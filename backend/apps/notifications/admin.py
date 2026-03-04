"""
Notification Admin
==================
"""

from django.contrib import admin

from apps.notifications.models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("user", "message_short", "read", "created_at")
    list_filter = ("read",)
    search_fields = ("user__email", "message")
    raw_id_fields = ("user",)

    def message_short(self, obj):
        return obj.message[:80]

    message_short.short_description = "Message"
