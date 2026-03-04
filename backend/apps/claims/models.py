"""
Claim Models
============
Insurance claim domain models with status tracking.
"""

from django.conf import settings
from django.db import models

from apps.core.models import BaseModel


class ClaimStatus(models.TextChoices):
    SUBMITTED = "Submitted", "Submitted"
    UNDER_REVIEW = "UnderReview", "Under Review"
    APPROVED = "Approved", "Approved"
    REJECTED = "Rejected", "Rejected"
    PAID = "Paid", "Paid"


class Claim(BaseModel):
    """
    Insurance claim linked to a policy.
    Status transitions are managed through the service layer.
    """

    policy = models.ForeignKey(
        "policies.Policy",
        on_delete=models.CASCADE,
        related_name="claims",
    )
    claim_number = models.CharField(max_length=30, unique=True, db_index=True)
    status = models.CharField(
        max_length=20,
        choices=ClaimStatus.choices,
        default=ClaimStatus.SUBMITTED,
        db_index=True,
    )
    amount_requested = models.DecimalField(max_digits=12, decimal_places=2)
    amount_approved = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )
    description = models.TextField(help_text="Description of the claim")
    diagnosis_code = models.CharField(max_length=20, blank=True, help_text="ICD-10 diagnosis code")
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_claims",
    )
    notes = models.TextField(blank=True, help_text="Internal review notes")

    class Meta:
        verbose_name = "Claim"
        verbose_name_plural = "Claims"
        ordering = ["-submitted_at"]

    def __str__(self):
        return f"{self.claim_number} - {self.status}"

    @property
    def citizen(self):
        """Get the citizen who owns this claim through the policy."""
        return self.policy.citizen
