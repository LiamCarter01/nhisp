"""
User Model Tests
================
"""

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.test import TestCase

User = get_user_model()


class UserModelTest(TestCase):
    def setUp(self):
        self.citizen_group = Group.objects.create(name="Citizen")
        self.officer_group = Group.objects.create(name="ClaimsOfficer")

    def test_create_user_with_email(self):
        user = User.objects.create_user(
            email="test@example.com",
            password="testpass123",
            first_name="Test",
            last_name="User",
        )
        self.assertEqual(user.email, "test@example.com")
        self.assertTrue(user.check_password("testpass123"))

    def test_create_superuser(self):
        user = User.objects.create_superuser(
            email="admin@example.com",
            password="adminpass123",
            first_name="Admin",
            last_name="User",
        )
        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_superuser)

    def test_user_role_property(self):
        user = User.objects.create_user(
            email="citizen@example.com",
            password="testpass123",
            first_name="Citizen",
            last_name="User",
        )
        user.groups.add(self.citizen_group)
        self.assertEqual(user.role, "Citizen")
        self.assertTrue(user.is_citizen)
        self.assertFalse(user.is_claims_officer)

    def test_user_str(self):
        user = User.objects.create_user(
            email="test@example.com",
            password="testpass123",
            first_name="John",
            last_name="Doe",
        )
        self.assertEqual(str(user), "John Doe (test@example.com)")
