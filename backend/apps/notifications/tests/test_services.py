"""
Notification Service Tests
==========================
"""

from django.contrib.auth import get_user_model
from django.test import TestCase

from apps.notifications.services.notification_service import NotificationService

User = get_user_model()


class NotificationServiceTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="user@test.com", password="testpass123",
            first_name="Test", last_name="User",
        )

    def test_create_notification(self):
        notification = NotificationService.create_notification(
            user=self.user, message="Test notification"
        )
        self.assertEqual(notification.message, "Test notification")
        self.assertFalse(notification.read)

    def test_mark_as_read(self):
        notification = NotificationService.create_notification(
            user=self.user, message="Test notification"
        )
        NotificationService.mark_as_read(notification)
        self.assertTrue(notification.read)

    def test_mark_all_as_read(self):
        NotificationService.create_notification(user=self.user, message="Msg 1")
        NotificationService.create_notification(user=self.user, message="Msg 2")
        count = NotificationService.mark_all_as_read(self.user)
        self.assertEqual(count, 2)

    def test_unread_count(self):
        NotificationService.create_notification(user=self.user, message="Msg 1")
        NotificationService.create_notification(user=self.user, message="Msg 2")
        self.assertEqual(NotificationService.get_unread_count(self.user), 2)
