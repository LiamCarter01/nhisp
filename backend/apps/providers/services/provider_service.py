"""
Provider Service
================
Business logic for healthcare provider management.
"""

import logging

from django.db import transaction

from apps.core.exceptions import BusinessLogicError
from apps.providers.models import Provider

logger = logging.getLogger(__name__)


class ProviderService:
    """Service layer for provider operations."""

    @staticmethod
    @transaction.atomic
    def create_provider(validated_data: dict) -> Provider:
        """Create a new healthcare provider."""
        provider = Provider.objects.create(**validated_data)
        logger.info("Provider created: %s (%s)", provider.name, provider.license_number)
        return provider

    @staticmethod
    def deactivate_provider(provider: Provider) -> Provider:
        """Deactivate a healthcare provider."""
        if not provider.active:
            raise BusinessLogicError("Provider is already inactive.")
        provider.active = False
        provider.save(update_fields=["active", "updated_at"])
        logger.info("Provider deactivated: %s", provider.name)
        return provider

    @staticmethod
    def activate_provider(provider: Provider) -> Provider:
        """Activate a healthcare provider."""
        if provider.active:
            raise BusinessLogicError("Provider is already active.")
        provider.active = True
        provider.save(update_fields=["active", "updated_at"])
        logger.info("Provider activated: %s", provider.name)
        return provider

    @staticmethod
    def get_active_providers():
        """Get all active providers."""
        return Provider.objects.filter(active=True)
