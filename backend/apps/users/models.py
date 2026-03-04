"""
User Models
===========
Custom user model with role support via Django Groups.
"""

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models

from apps.core.models import UUIDModel


class UserManager(BaseUserManager):
    """Custom manager for User model."""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, **extra_fields)


class User(UUIDModel, AbstractUser):
    """
    Custom User model using email as the primary identifier.
    Roles are managed through Django Groups.
    """

    username = None
    email = models.EmailField("email address", unique=True, db_index=True)
    national_id = models.CharField(
        max_length=20, unique=True, blank=True, null=True, help_text="National ID number"
    )
    phone_number = models.CharField(max_length=20, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    address = models.TextField(blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    objects = UserManager()

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"
        ordering = ["-date_joined"]

    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"

    @property
    def role(self):
        """Return the primary role (first group) of the user."""
        group = self.groups.first()
        return group.name if group else None

    @property
    def is_citizen(self):
        return self.groups.filter(name="Citizen").exists()

    @property
    def is_claims_officer(self):
        return self.groups.filter(name="ClaimsOfficer").exists()

    @property
    def is_supervisor(self):
        return self.groups.filter(name="Supervisor").exists()

    @property
    def is_admin_role(self):
        return self.groups.filter(name="Admin").exists()
