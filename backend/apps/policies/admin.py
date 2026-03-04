"""
Policy Admin
============
"""

from django.contrib import admin

from apps.policies.models import Policy


@admin.register(Policy)
class PolicyAdmin(admin.ModelAdmin):
    list_display = (
        "policy_number",
        "citizen",
        "coverage_type",
        "start_date",
        "end_date",
        "active",
    )
    list_filter = ("coverage_type", "active")
    search_fields = ("policy_number", "citizen__email", "citizen__first_name")
    raw_id_fields = ("citizen",)
    date_hierarchy = "start_date"
