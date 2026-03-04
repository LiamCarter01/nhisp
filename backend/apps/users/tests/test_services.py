"""
User Service Tests
==================
"""

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.test import TestCase

from apps.users.services.user_service import UserService

User = get_user_model()


class UserServiceTest(TestCase):
    def test_register_citizen(self):
        data = {
            "email": "citizen@example.com",
            "first_name": "Jane",
            "last_name": "Doe",
            "password": "securepass123",
        }
        user = UserService.register_citizen(data)
        self.assertEqual(user.email, "citizen@example.com")
        self.assertTrue(user.groups.filter(name="Citizen").exists())

    def test_create_user_with_role(self):
        data = {
            "email": "officer@example.com",
            "first_name": "Officer",
            "last_name": "Smith",
            "password": "securepass123",
        }
        user = UserService.create_user_with_role(data, "ClaimsOfficer")
        self.assertTrue(user.groups.filter(name="ClaimsOfficer").exists())
        self.assertTrue(user.is_staff)

    def test_ensure_groups_exist(self):
        UserService.ensure_groups_exist()
        self.assertTrue(Group.objects.filter(name="Citizen").exists())
        self.assertTrue(Group.objects.filter(name="ClaimsOfficer").exists())
        self.assertTrue(Group.objects.filter(name="Supervisor").exists())
        self.assertTrue(Group.objects.filter(name="Admin").exists())
