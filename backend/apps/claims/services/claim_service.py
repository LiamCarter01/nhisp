"""
Claim Service
=============
Business logic for insurance claim operations.
Handles claim submission, state transitions, and validation.
"""

import logging
import uuid
from decimal import Decimal

from django.db import transaction
from django.utils import timezone

from apps.claims.models import Claim, ClaimStatus
from apps.core.exceptions import (
    BusinessLogicError,
    InsufficientPermissionError,
    StateTransitionError,
)

logger = logging.getLogger(__name__)

# =============================================================================
# Valid State Transitions
# =============================================================================
# Defines which status transitions are allowed and by which roles.

VALID_TRANSITIONS = {
    ClaimStatus.SUBMITTED: {
        ClaimStatus.UNDER_REVIEW: ["ClaimsOfficer", "Admin"],
    },
    ClaimStatus.UNDER_REVIEW: {
        ClaimStatus.APPROVED: ["ClaimsOfficer", "Admin"],
        ClaimStatus.REJECTED: ["ClaimsOfficer", "Admin"],
    },
    ClaimStatus.APPROVED: {
        ClaimStatus.PAID: ["Admin"],
    },
    ClaimStatus.REJECTED: {
        ClaimStatus.APPROVED: ["Supervisor", "Admin"],  # Supervisor override
    },
    ClaimStatus.PAID: {},  # Terminal state
}


class ClaimService:
    """Service layer for claim operations."""

    @staticmethod
    def generate_claim_number() -> str:
        """Generate a unique claim number."""
        short_uuid = uuid.uuid4().hex[:8].upper()
        return f"CLM-{short_uuid}"

    @staticmethod
    @transaction.atomic
    def submit_claim(validated_data: dict) -> Claim:
        """
        Submit a new insurance claim.
        Initial status is always 'Submitted'.
        """
        claim = Claim.objects.create(
            claim_number=ClaimService.generate_claim_number(),
            status=ClaimStatus.SUBMITTED,
            **validated_data,
        )

        logger.info(
            "Claim %s submitted for policy %s (amount: %s)",
            claim.claim_number,
            claim.policy.policy_number,
            claim.amount_requested,
        )

        # Trigger notification
        ClaimService._notify_claim_submitted(claim)

        return claim

    @staticmethod
    @transaction.atomic
    def transition_status(
        claim: Claim,
        new_status: str,
        reviewer,
        amount_approved: Decimal = None,
        notes: str = "",
    ) -> Claim:
        """
        Transition a claim to a new status with full validation.

        Args:
            claim: The claim to transition
            new_status: Target status
            reviewer: User performing the transition
            amount_approved: Amount approved (required for Approved status)
            notes: Review notes

        Raises:
            StateTransitionError: If the transition is invalid
            InsufficientPermissionError: If the user lacks permission
        """
        current_status = claim.status

        # Validate transition is allowed
        allowed_transitions = VALID_TRANSITIONS.get(current_status, {})
        if new_status not in allowed_transitions:
            raise StateTransitionError(
                f"Cannot transition from '{current_status}' to '{new_status}'. "
                f"Allowed transitions: {list(allowed_transitions.keys()) or 'none'}"
            )

        # Validate user has the required role for this transition
        allowed_roles = allowed_transitions[new_status]
        user_roles = list(reviewer.groups.values_list("name", flat=True))
        if not any(role in allowed_roles for role in user_roles):
            raise InsufficientPermissionError(
                f"Your role(s) {user_roles} cannot perform this transition. "
                f"Required: {allowed_roles}"
            )

        # Apply transition
        claim.status = new_status
        claim.reviewed_by = reviewer
        claim.reviewed_at = timezone.now()

        if notes:
            claim.notes = notes

        if new_status == ClaimStatus.APPROVED:
            if amount_approved is None:
                raise BusinessLogicError(
                    "Approved amount is required when approving a claim."
                )
            if amount_approved > claim.amount_requested:
                raise BusinessLogicError(
                    "Approved amount cannot exceed requested amount."
                )
            claim.amount_approved = amount_approved

        claim.save()

        logger.info(
            "Claim %s transitioned: %s -> %s by %s",
            claim.claim_number,
            current_status,
            new_status,
            reviewer.email,
        )

        # Trigger notification
        ClaimService._notify_status_change(claim, current_status, new_status)

        return claim

    @staticmethod
    @transaction.atomic
    def supervisor_override(
        claim: Claim,
        supervisor,
        amount_approved: Decimal,
        notes: str = "",
    ) -> Claim:
        """
        Supervisor override: transition a Rejected claim to Approved.
        """
        if claim.status != ClaimStatus.REJECTED:
            raise StateTransitionError(
                "Supervisor override can only be applied to Rejected claims."
            )

        return ClaimService.transition_status(
            claim=claim,
            new_status=ClaimStatus.APPROVED,
            reviewer=supervisor,
            amount_approved=amount_approved,
            notes=f"[SUPERVISOR OVERRIDE] {notes}",
        )

    @staticmethod
    def get_claims_for_citizen(citizen):
        """Get all claims for a citizen through their policies."""
        return (
            Claim.objects.filter(policy__citizen=citizen)
            .select_related("policy", "policy__citizen", "reviewed_by")
            .order_by("-submitted_at")
        )

    @staticmethod
    def get_claims_for_review():
        """Get claims that are pending review."""
        return (
            Claim.objects.filter(
                status__in=[ClaimStatus.SUBMITTED, ClaimStatus.UNDER_REVIEW]
            )
            .select_related("policy", "policy__citizen", "reviewed_by")
            .order_by("submitted_at")
        )

    @staticmethod
    def get_rejected_claims():
        """Get rejected claims (for supervisor override view)."""
        return (
            Claim.objects.filter(status=ClaimStatus.REJECTED)
            .select_related("policy", "policy__citizen", "reviewed_by")
            .order_by("-reviewed_at")
        )

    @staticmethod
    def _notify_claim_submitted(claim: Claim):
        """Create notification when a claim is submitted."""
        try:
            from apps.notifications.services.notification_service import (
                NotificationService,
            )

            NotificationService.create_notification(
                user=claim.citizen,
                message=f"Your claim {claim.claim_number} has been submitted successfully.",
            )
        except Exception as e:
            logger.warning("Failed to create submission notification: %s", e)

    @staticmethod
    def _notify_status_change(claim: Claim, old_status: str, new_status: str):
        """Create notification when claim status changes."""
        try:
            from apps.notifications.services.notification_service import (
                NotificationService,
            )

            NotificationService.create_notification(
                user=claim.citizen,
                message=(
                    f"Your claim {claim.claim_number} status changed "
                    f"from {old_status} to {new_status}."
                ),
            )
        except Exception as e:
            logger.warning("Failed to create status change notification: %s", e)
