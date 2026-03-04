"""
Policy Service Tests
====================
"""

from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.test import TestCase

from apps.core.exceptions import BusinessLogicError
from apps.policies.services.policy_service import PolicyService

User = get_user_model()


class PolicyServiceTest(TestCase):
    def setUp(self):
        self.citizen_group = Group.objects.create(name="Citizen")
        self.citizen = User.objects.create_user(
            email="citizen@test.com",
            password="testpass123",
            first_name="Test",
            last_name="Citizen",
        )
        self.citizen.groups.add(self.citizen_group)

    def test_create_policy(self):
        data = {
            "citizen": self.citizen,
            "coverage_type": "Basic",
            "start_date": date.today(),
            "end_date": date.today() + timedelta(days=365),
        }
        policy = PolicyService.create_policy(data)
        self.assertIsNotNone(policy.policy_number)
        self.assertTrue(policy.policy_number.startswith("POL-"))
        self.assertTrue(policy.active)

    def test_deactivate_policy(self):
        data = {
            "citizen": self.citizen,
            "coverage_type": "Basic",
            "start_date": date.today(),
            "end_date": date.today() + timedelta(days=365),
        }
        policy = PolicyService.create_policy(data)
        PolicyService.deactivate_policy(policy)
        self.assertFalse(policy.active)

    def test_deactivate_already_inactive_policy_raises(self):
        data = {
            "citizen": self.citizen,
            "coverage_type": "Basic",
            "start_date": date.today(),
            "end_date": date.today() + timedelta(days=365),
        }
        policy = PolicyService.create_policy(data)
        PolicyService.deactivate_policy(policy)
        with self.assertRaises(BusinessLogicError):
            PolicyService.deactivate_policy(policy)
