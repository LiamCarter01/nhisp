"""
Payment Service Tests
=====================
"""

from datetime import date, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.test import TestCase

from apps.claims.models import ClaimStatus
from apps.claims.services.claim_service import ClaimService
from apps.core.exceptions import BusinessLogicError
from apps.payments.services.payment_service import PaymentService
from apps.policies.services.policy_service import PolicyService

User = get_user_model()


class PaymentServiceTest(TestCase):
    def setUp(self):
        self.citizen_group = Group.objects.create(name="Citizen")
        self.officer_group = Group.objects.create(name="ClaimsOfficer")

        self.citizen = User.objects.create_user(
            email="citizen@test.com", password="testpass123",
            first_name="Test", last_name="Citizen",
        )
        self.citizen.groups.add(self.citizen_group)

        self.officer = User.objects.create_user(
            email="officer@test.com", password="testpass123",
            first_name="Test", last_name="Officer",
        )
        self.officer.groups.add(self.officer_group)

        self.policy = PolicyService.create_policy({
            "citizen": self.citizen,
            "coverage_type": "Basic",
            "start_date": date.today() - timedelta(days=30),
            "end_date": date.today() + timedelta(days=335),
            "max_coverage_amount": Decimal("100000.00"),
        })

    def _create_approved_claim(self):
        claim = ClaimService.submit_claim({
            "policy": self.policy,
            "amount_requested": Decimal("5000.00"),
            "description": "Medical consultation",
        })
        claim = ClaimService.transition_status(
            claim=claim, new_status=ClaimStatus.UNDER_REVIEW, reviewer=self.officer,
        )
        claim = ClaimService.transition_status(
            claim=claim, new_status=ClaimStatus.APPROVED, reviewer=self.officer,
            amount_approved=Decimal("4500.00"),
        )
        return claim

    def test_process_payment(self):
        claim = self._create_approved_claim()
        payment = PaymentService.process_payment({
            "claim": claim,
            "amount": Decimal("4500.00"),
        })
        self.assertIsNotNone(payment.payment_reference)
        claim.refresh_from_db()
        self.assertEqual(claim.status, ClaimStatus.PAID)

    def test_payment_for_non_approved_claim_raises(self):
        claim = ClaimService.submit_claim({
            "policy": self.policy,
            "amount_requested": Decimal("5000.00"),
            "description": "Medical consultation",
        })
        with self.assertRaises(BusinessLogicError):
            PaymentService.process_payment({
                "claim": claim,
                "amount": Decimal("5000.00"),
            })
