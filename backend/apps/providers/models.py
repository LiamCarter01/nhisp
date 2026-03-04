"""
Provider Models
===============
Healthcare provider (hospital/clinic) models.
"""

from django.db import models

from apps.core.models import BaseModel


class ProviderType(models.TextChoices):
    HOSPITAL = "Hospital", "Hospital"
    CLINIC = "Clinic", "Clinic"
    PHARMACY = "Pharmacy", "Pharmacy"
    LABORATORY = "Laboratory", "Laboratory"
    SPECIALIST = "Specialist", "Specialist Center"


class Provider(BaseModel):
    """
    Healthcare provider (hospital, clinic, etc.)
    """

    name = models.CharField(max_length=200)
    license_number = models.CharField(max_length=50, unique=True, db_index=True)
    provider_type = models.CharField(
        max_length=20,
        choices=ProviderType.choices,
        default=ProviderType.HOSPITAL,
    )
    active = models.BooleanField(default=True)
    address = models.TextField(blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    city = models.CharField(max_length=100, blank=True)

    class Meta:
        verbose_name = "Provider"
        verbose_name_plural = "Providers"
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.license_number})"
