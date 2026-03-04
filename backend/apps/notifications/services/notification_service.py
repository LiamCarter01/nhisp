"""
Notification Service
====================
Business logic for notification management.
"""

import logging

from apps.notifications.models import Notification

logger = logging.getLogger(__name__)


class NotificationService:
    """Service layer for notification operations."""

    @staticmethod
    def create_notification(user, message: str) -> Notification:
        """Create a new notification for a user."""
        notification = Notification.objects.create(user=user, message=message)
        logger.info("Notification created for user %s: %s", user.email, message[:50])
        return notification

    @staticmethod
    def mark_as_read(notification: Notification) -> Notification:
        """Mark a notification as read."""
        notification.read = True
        notification.save(update_fields=["read", "updated_at"])
        return notification

    @staticmethod
    def mark_all_as_read(user) -> int:
        """Mark all notifications as read for a user. Returns count updated."""
        count = Notification.objects.filter(user=user, read=False).update(read=True)
        logger.info("Marked %d notifications as read for user %s", count, user.email)
        return count

    @staticmethod
    def get_user_notifications(user):
        """Get all notifications for a user."""
        return Notification.objects.filter(user=user).order_by("-created_at")

    @staticmethod
    def get_unread_count(user) -> int:
        """Get count of unread notifications."""
        return Notification.objects.filter(user=user, read=False).count()
