"""
Notification URL Router
=======================
"""

from rest_framework.routers import DefaultRouter

from apps.notifications.views import NotificationViewSet

router = DefaultRouter()
router.register(r"notifications", NotificationViewSet, basename="notification")
