from django.db import models


class UserIdentity(models.Model):
    phone_number = models.CharField(max_length=15, unique=True)
    otp_verified_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.phone_number


class Bill(models.Model):
    MODE_EQUAL = "equal"
    MODE_CHOICES = (
        (MODE_EQUAL, "Equal"),
    )

    organizer_phone = models.CharField(max_length=15)
    name = models.CharField(max_length=120)
    total_amount = models.PositiveIntegerField()
    mode = models.CharField(max_length=16, choices=MODE_CHOICES, default=MODE_EQUAL)
    status = models.CharField(max_length=16, default="open")
    share_token = models.CharField(max_length=36, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["organizer_phone"]),
            models.Index(fields=["share_token"]),
        ]

    def __str__(self) -> str:
        return f"{self.name} ({self.total_amount})"


class Participant(models.Model):
    STATUS_PENDING = "pending"
    STATUS_PAID = "paid"
    STATUS_FAILED = "failed"

    bill = models.ForeignKey(Bill, on_delete=models.CASCADE, related_name="participants")
    phone_number = models.CharField(max_length=15)
    expected_amount = models.PositiveIntegerField()
    paid_amount = models.PositiveIntegerField(default=0)
    status = models.CharField(
        max_length=16,
        choices=((STATUS_PENDING, "Pending"), (STATUS_PAID, "Paid"), (STATUS_FAILED, "Failed")),
        default=STATUS_PENDING,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("bill", "phone_number")
        indexes = [
            models.Index(fields=["bill"]),
            models.Index(fields=["phone_number"]),
        ]

    def __str__(self) -> str:
        return f"{self.phone_number}: {self.expected_amount} ({self.status})"


class Payment(models.Model):
    STATUS_PENDING = "pending"
    STATUS_SUCCESS = "success"
    STATUS_FAILED = "failed"

    bill = models.ForeignKey(Bill, on_delete=models.CASCADE, related_name="payments")
    participant = models.ForeignKey(Participant, on_delete=models.CASCADE, related_name="payments")
    amount = models.PositiveIntegerField()
    mpesa_checkout_request_id = models.CharField(max_length=64, unique=True)
    result_code = models.CharField(max_length=16, null=True, blank=True)
    status = models.CharField(
        max_length=16,
        choices=((STATUS_PENDING, "Pending"), (STATUS_SUCCESS, "Success"), (STATUS_FAILED, "Failed")),
        default=STATUS_PENDING,
    )
    raw_callback = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["bill"]),
            models.Index(fields=["participant"]),
            models.Index(fields=["mpesa_checkout_request_id"]),
        ]

    def __str__(self) -> str:
        return f"{self.participant.phone_number} - {self.amount} ({self.status})"


class OtpCode(models.Model):
    phone_number = models.CharField(max_length=15)
    code_hash = models.CharField(max_length=128)
    expires_at = models.DateTimeField()
    consumed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["phone_number"]),
            models.Index(fields=["expires_at"]),
        ]

    def __str__(self) -> str:
        return f"OTP for {self.phone_number} (expires {self.expires_at})"
