"""
User Service
=============
Business logic for user management operations.
"""

import logging

from django.contrib.auth.models import Group
from django.db import transaction

from apps.core.exceptions import BusinessLogicError
from apps.core.permissions import ALL_ROLES
from apps.users.models import User

logger = logging.getLogger(__name__)


class UserService:
    """Service layer for user operations."""

    @staticmethod
    @transaction.atomic
    def register_citizen(validated_data: dict) -> User:
        """
        Register a new citizen user.
        Creates the user and assigns them to the Citizen group.
        """
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()

        citizen_group, _ = Group.objects.get_or_create(name="Citizen")
        user.groups.add(citizen_group)

        logger.info("New citizen registered: %s", user.email)
        return user

    @staticmethod
    @transaction.atomic
    def create_user_with_role(validated_data: dict, role: str) -> User:
        """
        Create a user with a specific role (Admin operation).
        """
        if role not in ALL_ROLES:
            raise BusinessLogicError(f"Invalid role: {role}. Must be one of {ALL_ROLES}")

        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)

        if role in ("Admin", "Supervisor", "ClaimsOfficer"):
            user.is_staff = True

        user.save()

        group, _ = Group.objects.get_or_create(name=role)
        user.groups.add(group)

        logger.info("User created with role %s: %s", role, user.email)
        return user

    @staticmethod
    def change_password(user: User, new_password: str) -> None:
        """Change user password."""
        user.set_password(new_password)
        user.save(update_fields=["password"])
        logger.info("Password changed for user: %s", user.email)

    @staticmethod
    def deactivate_user(user: User) -> User:
        """Deactivate a user account."""
        user.is_active = False
        user.save(update_fields=["is_active"])
        logger.info("User deactivated: %s", user.email)
        return user

    @staticmethod
    def activate_user(user: User) -> User:
        """Activate a user account."""
        user.is_active = True
        user.save(update_fields=["is_active"])
        logger.info("User activated: %s", user.email)
        return user

    @staticmethod
    def ensure_groups_exist():
        """Ensure all role groups exist in the database."""
        for role in ALL_ROLES:
            Group.objects.get_or_create(name=role)
        logger.info("All role groups verified.")
