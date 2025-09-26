import hashlib
import os
from datetime import datetime, timedelta, timezone

from django.http import JsonResponse
from django.views.decorators.http import require_POST, require_GET
from django.views.decorators.csrf import csrf_exempt
from django.core.signing import TimestampSigner, BadSignature
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt

from .models import OtpCode, UserIdentity, Bill, Participant, Payment
from .serializers import BillCreateSerializer, BillDetailSerializer
import uuid
from .daraja import DarajaClient


def _normalize_phone(phone: str) -> str:
    phone = phone.strip().replace(" ", "")
    if phone.startswith("+"):
        return phone
    if phone.startswith("0"):
        return "+254" + phone[1:]
    if phone.startswith("254"):
        return "+" + phone
    return phone


def _hash_code(code: str) -> str:
    return hashlib.sha256(code.encode("utf-8")).hexdigest()


def _generate_code() -> str:
    return f"{int.from_bytes(os.urandom(3), 'big') % 1000000:06d}"


@csrf_exempt
@require_POST
def otp_send(request):
    phone = _normalize_phone(request.POST.get("phone_number", ""))
    if not phone:
        return JsonResponse({"error": "phone_number required"}, status=400)
    code = _generate_code()
    expires = datetime.now(timezone.utc) + timedelta(minutes=5)
    OtpCode.objects.create(phone_number=phone, code_hash=_hash_code(code), expires_at=expires)
    # TODO: Integrate SMS provider. For now, return code in dev (do NOT do in prod)
    return JsonResponse({"ok": True, "dev_code": code})


@csrf_exempt
@require_POST
def otp_verify(request):
    phone = _normalize_phone(request.POST.get("phone_number", ""))
    code = request.POST.get("code", "")
    if not phone or not code:
        return JsonResponse({"error": "phone_number and code required"}, status=400)
    now = datetime.now(timezone.utc)
    otp = (
        OtpCode.objects.filter(phone_number=phone, consumed_at__isnull=True, expires_at__gte=now)
        .order_by("-created_at")
        .first()
    )
    if not otp or otp.code_hash != _hash_code(code):
        return JsonResponse({"ok": False, "error": "invalid_code"}, status=400)
    otp.consumed_at = now
    otp.save(update_fields=["consumed_at"])
    UserIdentity.objects.get_or_create(phone_number=phone)
    signer = TimestampSigner()
    token = signer.sign(phone)
    return JsonResponse({"ok": True, "token": token})


@csrf_exempt
@require_POST
def bills_create(request):
    data = request.POST.copy()
    if "participant_phones" in data:
        # Accept comma-separated input for simplicity in MVP
        data.setlist(
            "participant_phones",
            [p for p in data.get("participant_phones", "").split(",") if p.strip()],
        )
    serializer = BillCreateSerializer(data=data)
    if not serializer.is_valid():
        return JsonResponse(serializer.errors, status=400)
    payload = serializer.validated_data
    organizer_phone = _normalize_phone(payload["organizer_phone"])
    phones = [_normalize_phone(p) for p in payload["participant_phones"]]
    share_token = str(uuid.uuid4())
    bill = Bill.objects.create(
        organizer_phone=organizer_phone,
        name=payload["name"],
        total_amount=payload["total_amount"],
        share_token=share_token,
    )
    # Equal split with remainder to last participant
    total = bill.total_amount
    n = len(phones)
    base = total // n
    remainder = total - base * n
    for idx, phone in enumerate(phones):
        expected = base + (remainder if idx == n - 1 else 0)
        Participant.objects.create(
            bill=bill,
            phone_number=phone,
            expected_amount=expected,
        )
    resp = BillDetailSerializer(instance=bill)
    return JsonResponse(resp.data, status=201)


@csrf_exempt
@require_POST
def payments_initiate_stk(request):
    phone = _normalize_phone(request.POST.get("phone_number", ""))
    bill_id = request.POST.get("bill_id")
    if not phone or not bill_id:
        return JsonResponse({"error": "phone_number and bill_id required"}, status=400)
    try:
        bill = Bill.objects.get(id=bill_id)
        participant = Participant.objects.get(bill=bill, phone_number=phone)
    except (Bill.DoesNotExist, Participant.DoesNotExist):
        return JsonResponse({"error": "not_found"}, status=404)
    client = DarajaClient(
        settings.DARAJA_BASE_URL,
        settings.DARAJA_CONSUMER_KEY,
        settings.DARAJA_CONSUMER_SECRET,
        settings.DARAJA_SHORT_CODE,
        settings.DARAJA_PASSKEY,
    )
    ref = f"BILL-{bill.id}"
    try:
        resp = client.stk_push(
            phone_number=phone,
            amount=participant.expected_amount,
            account_ref=ref,
            callback_url=settings.DARAJA_CALLBACK_URL,
        )
    except Exception as e:
        return JsonResponse({"error": "stk_failed", "detail": str(e)}, status=502)
    checkout_id = resp.get("CheckoutRequestID") or resp.get("MerchantRequestID")
    if not checkout_id:
        return JsonResponse({"error": "no_checkout_id", "raw": resp}, status=502)
    Payment.objects.create(
        bill=bill,
        participant=participant,
        amount=participant.expected_amount,
        mpesa_checkout_request_id=checkout_id,
    )
    return JsonResponse({"ok": True, "checkout_id": checkout_id, "raw": resp})


@csrf_exempt
def payments_callback(request):
    try:
        import json as _json
        payload = _json.loads(request.body.decode("utf-8"))
    except Exception:
        payload = {}
    result_code = payload.get("Body", {}).get("stkCallback", {}).get("ResultCode")
    checkout_id = payload.get("Body", {}).get("stkCallback", {}).get("CheckoutRequestID")
    if not checkout_id:
        return JsonResponse({"error": "invalid_callback"}, status=400)
    try:
        payment = Payment.objects.select_related("participant").get(mpesa_checkout_request_id=checkout_id)
    except Payment.DoesNotExist:
        return JsonResponse({"error": "payment_not_found"}, status=404)
    payment.result_code = str(result_code) if result_code is not None else None
    payment.raw_callback = payload
    if result_code == 0:
        payment.status = Payment.STATUS_SUCCESS
        payment.participant.status = Participant.STATUS_PAID
        payment.participant.paid_amount = payment.amount
        payment.participant.save(update_fields=["status", "paid_amount"])
    else:
        payment.status = Payment.STATUS_FAILED
        payment.participant.status = Participant.STATUS_FAILED
        payment.participant.save(update_fields=["status"])
    payment.save(update_fields=["result_code", "raw_callback", "status"])
    return JsonResponse({"ok": True})


@require_GET
def bills_get_by_token(request, token: str):
    try:
        bill = Bill.objects.get(share_token=token)
    except Bill.DoesNotExist:
        return JsonResponse({"error": "not_found"}, status=404)
    return JsonResponse(BillDetailSerializer(bill).data)


@require_GET
def bills_receipt(request, token: str):
    try:
        bill = Bill.objects.get(share_token=token)
    except Bill.DoesNotExist:
        return JsonResponse({"error": "not_found"}, status=404)
    participants = list(bill.participants.values("phone_number", "expected_amount", "paid_amount", "status"))
    total_expected = sum(p["expected_amount"] for p in participants)
    total_paid = sum(p["paid_amount"] for p in participants)
    summary = {
        "bill": {
            "id": bill.id,
            "name": bill.name,
            "total_amount": bill.total_amount,
            "share_token": bill.share_token,
        },
        "participants": participants,
        "totals": {
            "expected": total_expected,
            "paid": total_paid,
            "outstanding": max(total_expected - total_paid, 0),
        },
    }
    return JsonResponse(summary)


@require_GET
def bills_my_share(request):
    token = request.GET.get("token", "")
    phone = _normalize_phone(request.GET.get("phone_number", ""))
    if not token or not phone:
        return JsonResponse({"error": "token and phone_number required"}, status=400)
    try:
        bill = Bill.objects.get(share_token=token)
        participant = Participant.objects.get(bill=bill, phone_number=phone)
    except (Bill.DoesNotExist, Participant.DoesNotExist):
        return JsonResponse({"error": "not_found"}, status=404)
    return JsonResponse({
        "bill_id": bill.id,
        "expected_amount": participant.expected_amount,
        "paid_amount": participant.paid_amount,
        "status": participant.status,
    })


@require_GET
def health(request):
    return JsonResponse({"ok": True})



# Create your views here.
