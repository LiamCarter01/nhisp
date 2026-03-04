"""
Notification Permissions
========================
"""

from rest_framework.permissions import BasePermission


class IsNotificationOwner(BasePermission):
    """Users can only access their own notifications."""

    def has_object_permission(self, request, view, obj):
        return obj.user == request.user
