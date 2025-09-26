from django.urls import path
from . import views

urlpatterns = [
    path("otp/send", views.otp_send, name="otp-send"),
    path("otp/verify", views.otp_verify, name="otp-verify"),
    path("bills", views.bills_create, name="bills-create"),
    path("bills/by-token/<str:token>", views.bills_get_by_token, name="bills-by-token"),
    path("bills/receipt/<str:token>", views.bills_receipt, name="bills-receipt"),
    path("bills/my-share", views.bills_my_share, name="bills-my-share"),
    path("payments/stk/initiate", views.payments_initiate_stk, name="payments-stk-init"),
    path("payments/daraja/callback", views.payments_callback, name="payments-callback"),
    path("health", views.health, name="health"),
]


