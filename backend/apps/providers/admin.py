"""
Provider Admin
==============
"""

from django.contrib import admin

from apps.providers.models import Provider


@admin.register(Provider)
class ProviderAdmin(admin.ModelAdmin):
    list_display = ("name", "license_number", "provider_type", "active", "city")
    list_filter = ("provider_type", "active")
    search_fields = ("name", "license_number", "city")
