"""
Claim Service Tests
===================
Tests for claim state transitions and business logic.
"""

from datetime import date, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.test import TestCase

from apps.claims.models import ClaimStatus
from apps.claims.services.claim_service import ClaimService
from apps.core.exceptions import InsufficientPermissionError, StateTransitionError
from apps.policies.services.policy_service import PolicyService

User = get_user_model()


class ClaimServiceTest(TestCase):
    def setUp(self):
        # Create groups
        self.citizen_group = Group.objects.create(name="Citizen")
        self.officer_group = Group.objects.create(name="ClaimsOfficer")
        self.supervisor_group = Group.objects.create(name="Supervisor")
        self.admin_group = Group.objects.create(name="Admin")

        # Create users
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

        self.supervisor = User.objects.create_user(
            email="supervisor@test.com", password="testpass123",
            first_name="Test", last_name="Supervisor",
        )
        self.supervisor.groups.add(self.supervisor_group)

        # Create policy
        self.policy = PolicyService.create_policy({
            "citizen": self.citizen,
            "coverage_type": "Basic",
            "start_date": date.today() - timedelta(days=30),
            "end_date": date.today() + timedelta(days=335),
            "max_coverage_amount": Decimal("100000.00"),
        })

    def _create_claim(self):
        return ClaimService.submit_claim({
            "policy": self.policy,
            "amount_requested": Decimal("5000.00"),
            "description": "Medical consultation",
        })

    def test_submit_claim(self):
        claim = self._create_claim()
        self.assertEqual(claim.status, ClaimStatus.SUBMITTED)
        self.assertTrue(claim.claim_number.startswith("CLM-"))

    def test_transition_submitted_to_under_review(self):
        claim = self._create_claim()
        claim = ClaimService.transition_status(
            claim=claim,
            new_status=ClaimStatus.UNDER_REVIEW,
            reviewer=self.officer,
        )
        self.assertEqual(claim.status, ClaimStatus.UNDER_REVIEW)

    def test_transition_under_review_to_approved(self):
        claim = self._create_claim()
        claim = ClaimService.transition_status(
            claim=claim,
            new_status=ClaimStatus.UNDER_REVIEW,
            reviewer=self.officer,
        )
        claim = ClaimService.transition_status(
            claim=claim,
            new_status=ClaimStatus.APPROVED,
            reviewer=self.officer,
            amount_approved=Decimal("4500.00"),
        )
        self.assertEqual(claim.status, ClaimStatus.APPROVED)
        self.assertEqual(claim.amount_approved, Decimal("4500.00"))

    def test_invalid_transition_raises(self):
        claim = self._create_claim()
        with self.assertRaises(StateTransitionError):
            ClaimService.transition_status(
                claim=claim,
                new_status=ClaimStatus.PAID,
                reviewer=self.officer,
            )

    def test_citizen_cannot_review(self):
        claim = self._create_claim()
        with self.assertRaises(InsufficientPermissionError):
            ClaimService.transition_status(
                claim=claim,
                new_status=ClaimStatus.UNDER_REVIEW,
                reviewer=self.citizen,
            )

    def test_supervisor_override(self):
        claim = self._create_claim()
        # Move to UnderReview then Rejected
        claim = ClaimService.transition_status(
            claim=claim,
            new_status=ClaimStatus.UNDER_REVIEW,
            reviewer=self.officer,
        )
        claim = ClaimService.transition_status(
            claim=claim,
            new_status=ClaimStatus.REJECTED,
            reviewer=self.officer,
        )
        # Supervisor override
        claim = ClaimService.supervisor_override(
            claim=claim,
            supervisor=self.supervisor,
            amount_approved=Decimal("3000.00"),
            notes="Override approved after re-review",
        )
        self.assertEqual(claim.status, ClaimStatus.APPROVED)
        self.assertEqual(claim.amount_approved, Decimal("3000.00"))

    def test_supervisor_override_non_rejected_raises(self):
        claim = self._create_claim()
        with self.assertRaises(StateTransitionError):
            ClaimService.supervisor_override(
                claim=claim,
                supervisor=self.supervisor,
                amount_approved=Decimal("3000.00"),
            )
