"""
Policy Service
==============
Business logic for insurance policy operations.
"""

import logging
import uuid

from django.db import transaction

from apps.core.exceptions import BusinessLogicError
from apps.policies.models import Policy

logger = logging.getLogger(__name__)


class PolicyService:
    """Service layer for policy operations."""

    @staticmethod
    def generate_policy_number() -> str:
        """Generate a unique policy number."""
        short_uuid = uuid.uuid4().hex[:8].upper()
        return f"POL-{short_uuid}"

    @staticmethod
    @transaction.atomic
    def create_policy(validated_data: dict) -> Policy:
        """Create a new insurance policy."""
        citizen = validated_data["citizen"]

        # Verify citizen has the Citizen role
        if not citizen.groups.filter(name="Citizen").exists():
            raise BusinessLogicError("Policies can only be created for citizens.")

        policy = Policy.objects.create(
            policy_number=PolicyService.generate_policy_number(),
            **validated_data,
        )

        logger.info(
            "Policy %s created for citizen %s",
            policy.policy_number,
            citizen.email,
        )
        return policy

    @staticmethod
    def deactivate_policy(policy: Policy) -> Policy:
        """Deactivate an insurance policy."""
        if not policy.active:
            raise BusinessLogicError("Policy is already inactive.")

        policy.active = False
        policy.save(update_fields=["active", "updated_at"])

        logger.info("Policy %s deactivated", policy.policy_number)
        return policy

    @staticmethod
    def activate_policy(policy: Policy) -> Policy:
        """Activate an insurance policy."""
        if policy.active:
            raise BusinessLogicError("Policy is already active.")

        policy.active = True
        policy.save(update_fields=["active", "updated_at"])

        logger.info("Policy %s activated", policy.policy_number)
        return policy

    @staticmethod
    def get_citizen_policies(citizen):
        """Get all policies for a specific citizen."""
        return Policy.objects.filter(citizen=citizen).select_related("citizen")

    @staticmethod
    def get_active_citizen_policies(citizen):
        """Get all active policies for a specific citizen."""
        return Policy.objects.filter(citizen=citizen, active=True).select_related("citizen")
