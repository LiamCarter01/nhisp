"""
Notification Views
==================
ViewSets for notification management.
"""

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated

from apps.core.responses import success_response
from apps.notifications.models import Notification
from apps.notifications.permissions import IsNotificationOwner
from apps.notifications.serializers import (
    NotificationListSerializer,
    NotificationSerializer,
)
from apps.notifications.services.notification_service import NotificationService


class NotificationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for notifications.
    Users can only see their own notifications.
    """

    serializer_class = NotificationSerializer
    http_method_names = ["get", "patch", "delete", "head", "options"]

    def get_queryset(self):
        return NotificationService.get_user_notifications(self.request.user)

    def get_permissions(self):
        if self.action in ("retrieve", "partial_update", "destroy"):
            return [IsAuthenticated(), IsNotificationOwner()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == "list":
            return NotificationListSerializer
        return NotificationSerializer

    @action(detail=True, methods=["post"])
    def mark_read(self, request, pk=None):
        """Mark a single notification as read."""
        notification = self.get_object()
        NotificationService.mark_as_read(notification)
        return success_response(message="Notification marked as read.")

    @action(detail=False, methods=["post"])
    def mark_all_read(self, request):
        """Mark all notifications as read."""
        count = NotificationService.mark_all_as_read(request.user)
        return success_response(
            data={"count": count},
            message=f"{count} notifications marked as read.",
        )

    @action(detail=False, methods=["get"])
    def unread_count(self, request):
        """Get count of unread notifications."""
        count = NotificationService.get_unread_count(request.user)
        return success_response(data={"unread_count": count})
