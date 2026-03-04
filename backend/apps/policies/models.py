"""
Policy Models
=============
Insurance policy domain models.
"""

from django.conf import settings
from django.db import models

from apps.core.models import BaseModel


class CoverageType(models.TextChoices):
    BASIC = "Basic", "Basic Coverage"
    STANDARD = "Standard", "Standard Coverage"
    PREMIUM = "Premium", "Premium Coverage"
    COMPREHENSIVE = "Comprehensive", "Comprehensive Coverage"


class Policy(BaseModel):
    """
    Insurance policy linked to a citizen.
    """

    citizen = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="policies",
        limit_choices_to={"groups__name": "Citizen"},
    )
    policy_number = models.CharField(max_length=30, unique=True, db_index=True)
    coverage_type = models.CharField(
        max_length=20,
        choices=CoverageType.choices,
        default=CoverageType.BASIC,
    )
    start_date = models.DateField()
    end_date = models.DateField()
    active = models.BooleanField(default=True)
    max_coverage_amount = models.DecimalField(
        max_digits=12, decimal_places=2, default=100000.00
    )
    description = models.TextField(blank=True)

    class Meta:
        verbose_name = "Policy"
        verbose_name_plural = "Policies"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.policy_number} - {self.citizen.get_full_name()}"

    @property
    def is_valid(self):
        """Check if policy is currently active and within valid dates."""
        from django.utils import timezone

        today = timezone.now().date()
        return self.active and self.start_date <= today <= self.end_date
