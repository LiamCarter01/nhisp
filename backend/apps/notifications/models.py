"""
Notification Models
===================
"""

from django.conf import settings
from django.db import models

from apps.core.models import BaseModel


class Notification(BaseModel):
    """
    User notification model.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    message = models.TextField()
    read = models.BooleanField(default=False, db_index=True)

    class Meta:
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
        ordering = ["-created_at"]

    def __str__(self):
        status = "Read" if self.read else "Unread"
        return f"[{status}] {self.user.email}: {self.message[:50]}"
