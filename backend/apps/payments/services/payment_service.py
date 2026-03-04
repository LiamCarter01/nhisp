"""
Payment Service
===============
Business logic for payment processing.
"""

import logging
import uuid

from django.db import transaction
from django.utils import timezone

from apps.claims.models import ClaimStatus
from apps.core.exceptions import BusinessLogicError
from apps.payments.models import Payment

logger = logging.getLogger(__name__)


class PaymentService:
    """Service layer for payment operations."""

    @staticmethod
    def generate_payment_reference() -> str:
        """Generate a unique payment reference."""
        short_uuid = uuid.uuid4().hex[:10].upper()
        return f"PAY-{short_uuid}"

    @staticmethod
    @transaction.atomic
    def process_payment(validated_data: dict) -> Payment:
        """
        Process payment for an approved claim.
        Also transitions the claim status to Paid.
        """
        claim = validated_data["claim"]

        if claim.status != ClaimStatus.APPROVED:
            raise BusinessLogicError(
                "Payments can only be processed for approved claims."
            )

        if hasattr(claim, "payment"):
            raise BusinessLogicError("This claim already has a payment record.")

        payment = Payment.objects.create(
            payment_reference=PaymentService.generate_payment_reference(),
            paid_at=timezone.now(),
            **validated_data,
        )

        # Transition claim to Paid status
        claim.status = ClaimStatus.PAID
        claim.save(update_fields=["status", "updated_at"])

        logger.info(
            "Payment %s processed for claim %s (amount: %s)",
            payment.payment_reference,
            claim.claim_number,
            payment.amount,
        )

        # Notify citizen
        PaymentService._notify_payment(payment)

        return payment

    @staticmethod
    def get_citizen_payments(citizen):
        """Get all payments for a citizen's claims."""
        return (
            Payment.objects.filter(claim__policy__citizen=citizen)
            .select_related("claim", "claim__policy", "claim__policy__citizen")
            .order_by("-paid_at")
        )

    @staticmethod
    def _notify_payment(payment: Payment):
        """Create notification when payment is processed."""
        try:
            from apps.notifications.services.notification_service import (
                NotificationService,
            )

            NotificationService.create_notification(
                user=payment.claim.policy.citizen,
                message=(
                    f"Payment of {payment.amount} processed for claim "
                    f"{payment.claim.claim_number}. Reference: {payment.payment_reference}"
                ),
            )
        except Exception as e:
            logger.warning("Failed to create payment notification: %s", e)
