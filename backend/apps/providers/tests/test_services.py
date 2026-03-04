"""
Provider Service Tests
======================
"""

from django.test import TestCase

from apps.core.exceptions import BusinessLogicError
from apps.providers.models import Provider
from apps.providers.services.provider_service import ProviderService


class ProviderServiceTest(TestCase):
    def test_create_provider(self):
        provider = ProviderService.create_provider({
            "name": "City Hospital",
            "license_number": "LIC-001",
            "provider_type": "Hospital",
        })
        self.assertEqual(provider.name, "City Hospital")
        self.assertTrue(provider.active)

    def test_deactivate_provider(self):
        provider = ProviderService.create_provider({
            "name": "City Hospital",
            "license_number": "LIC-002",
            "provider_type": "Hospital",
        })
        ProviderService.deactivate_provider(provider)
        self.assertFalse(provider.active)

    def test_deactivate_inactive_provider_raises(self):
        provider = ProviderService.create_provider({
            "name": "City Hospital",
            "license_number": "LIC-003",
            "provider_type": "Hospital",
        })
        ProviderService.deactivate_provider(provider)
        with self.assertRaises(BusinessLogicError):
            ProviderService.deactivate_provider(provider)
