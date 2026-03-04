"""
Payment Models
==============
Payment records linked to approved claims.
"""

from django.db import models

from apps.core.models import BaseModel


class Payment(BaseModel):
    """
    Payment record for an approved claim.
    """

    claim = models.OneToOneField(
        "claims.Claim",
        on_delete=models.CASCADE,
        related_name="payment",
    )
    payment_reference = models.CharField(max_length=50, unique=True, db_index=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    paid_at = models.DateTimeField()
    payment_method = models.CharField(max_length=50, default="Bank Transfer")
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = "Payment"
        verbose_name_plural = "Payments"
        ordering = ["-paid_at"]

    def __str__(self):
        return f"{self.payment_reference} - {self.amount}"
