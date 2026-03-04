"""
Claim Admin
===========
"""

from django.contrib import admin

from apps.claims.models import Claim


@admin.register(Claim)
class ClaimAdmin(admin.ModelAdmin):
    list_display = (
        "claim_number",
        "status",
        "policy",
        "amount_requested",
        "amount_approved",
        "submitted_at",
        "reviewed_at",
    )
    list_filter = ("status",)
    search_fields = ("claim_number", "policy__policy_number", "policy__citizen__email")
    raw_id_fields = ("policy", "reviewed_by")
    date_hierarchy = "submitted_at"
    readonly_fields = ("claim_number", "submitted_at")
