"""
Notification Serializers
========================
"""

from rest_framework import serializers

from apps.notifications.models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            "id",
            "user",
            "message",
            "read",
            "created_at",
        ]
        read_only_fields = ["id", "user", "message", "created_at"]


class NotificationListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            "id",
            "message",
            "read",
            "created_at",
        ]
