"""
Provider Admin
==============
"""

from django.contrib import admin

from apps.providers.models import Provider, ProviderFeedback


@admin.register(Provider)
class ProviderAdmin(admin.ModelAdmin):
    list_display = ("name", "license_number", "provider_type", "active", "city")
    list_filter = ("provider_type", "active")
    search_fields = ("name", "license_number", "city")


@admin.register(ProviderFeedback)
class ProviderFeedbackAdmin(admin.ModelAdmin):
    list_display = (
        "provider",
        "citizen",
        "rating_score",
        "status",
        "created_at",
    )
    list_filter = ("status",)
    search_fields = ("citizen__email", "provider__name")
