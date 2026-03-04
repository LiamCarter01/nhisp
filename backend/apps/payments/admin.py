"""
Payment Admin
=============
"""

from django.contrib import admin

from apps.payments.models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        "payment_reference",
        "claim",
        "amount",
        "paid_at",
        "payment_method",
    )
    list_filter = ("payment_method",)
    search_fields = ("payment_reference", "claim__claim_number")
    raw_id_fields = ("claim",)
    date_hierarchy = "paid_at"
