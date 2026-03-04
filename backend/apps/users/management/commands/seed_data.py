"""
Seed Data Management Command
==============================
Creates initial data including roles, users, policies, and providers.
"""

from datetime import date, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core.management.base import BaseCommand

from apps.policies.services.policy_service import PolicyService
from apps.providers.services.provider_service import ProviderService
from apps.users.services.user_service import UserService

User = get_user_model()


class Command(BaseCommand):
    help = "Seed the database with initial data for NHISP"

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("=" * 60))
        self.stdout.write(self.style.NOTICE("NHISP Database Seeding"))
        self.stdout.write(self.style.NOTICE("=" * 60))

        self._create_groups()
        self._create_admin()
        self._create_supervisor()
        self._create_officers()
        self._create_citizens()
        self._create_providers()

        self.stdout.write(self.style.SUCCESS("\n✓ Database seeding completed successfully!"))
        self._print_credentials()

    def _create_groups(self):
        self.stdout.write("\n→ Creating role groups...")
        UserService.ensure_groups_exist()
        self.stdout.write(self.style.SUCCESS("  ✓ Role groups created"))

    def _create_admin(self):
        self.stdout.write("\n→ Creating Admin user...")
        if User.objects.filter(email="admin@nhisp.gov").exists():
            self.stdout.write(self.style.WARNING("  ⚠ Admin already exists, skipping"))
            return

        UserService.create_user_with_role(
            {
                "email": "admin@nhisp.gov",
                "first_name": "System",
                "last_name": "Administrator",
                "password": "admin123456",
                "national_id": "ADM-001",
            },
            "Admin",
        )
        self.stdout.write(self.style.SUCCESS("  ✓ Admin created"))

    def _create_supervisor(self):
        self.stdout.write("\n→ Creating Supervisor...")
        if User.objects.filter(email="supervisor@nhisp.gov").exists():
            self.stdout.write(self.style.WARNING("  ⚠ Supervisor already exists, skipping"))
            return

        UserService.create_user_with_role(
            {
                "email": "supervisor@nhisp.gov",
                "first_name": "Sarah",
                "last_name": "Johnson",
                "password": "super123456",
                "national_id": "SUP-001",
                "phone_number": "+1-555-0201",
            },
            "Supervisor",
        )
        self.stdout.write(self.style.SUCCESS("  ✓ Supervisor created"))

    def _create_officers(self):
        self.stdout.write("\n→ Creating Claims Officers...")
        officers = [
            {
                "email": "officer1@nhisp.gov",
                "first_name": "Michael",
                "last_name": "Chen",
                "password": "officer123456",
                "national_id": "OFF-001",
                "phone_number": "+1-555-0301",
            },
            {
                "email": "officer2@nhisp.gov",
                "first_name": "Emily",
                "last_name": "Davis",
                "password": "officer123456",
                "national_id": "OFF-002",
                "phone_number": "+1-555-0302",
            },
        ]
        for officer_data in officers:
            if User.objects.filter(email=officer_data["email"]).exists():
                self.stdout.write(
                    self.style.WARNING(f"  ⚠ {officer_data['email']} already exists, skipping")
                )
                continue
            UserService.create_user_with_role(officer_data, "ClaimsOfficer")
            self.stdout.write(self.style.SUCCESS(f"  ✓ Officer {officer_data['email']} created"))

    def _create_citizens(self):
        self.stdout.write("\n→ Creating Citizens with policies...")
        citizens = [
            {
                "user_data": {
                    "email": "john.doe@email.com",
                    "first_name": "John",
                    "last_name": "Doe",
                    "password": "citizen123456",
                    "national_id": "CIT-001",
                    "phone_number": "+1-555-0101",
                    "date_of_birth": date(1985, 3, 15),
                    "address": "123 Main St, Springfield, IL 62701",
                },
                "policies": [
                    {
                        "coverage_type": "Comprehensive",
                        "start_date": date.today() - timedelta(days=180),
                        "end_date": date.today() + timedelta(days=185),
                        "max_coverage_amount": Decimal("250000.00"),
                        "description": "Comprehensive family health coverage",
                    },
                ],
            },
            {
                "user_data": {
                    "email": "jane.smith@email.com",
                    "first_name": "Jane",
                    "last_name": "Smith",
                    "password": "citizen123456",
                    "national_id": "CIT-002",
                    "phone_number": "+1-555-0102",
                    "date_of_birth": date(1990, 7, 22),
                    "address": "456 Oak Ave, Chicago, IL 60601",
                },
                "policies": [
                    {
                        "coverage_type": "Standard",
                        "start_date": date.today() - timedelta(days=90),
                        "end_date": date.today() + timedelta(days=275),
                        "max_coverage_amount": Decimal("150000.00"),
                        "description": "Standard individual coverage",
                    },
                    {
                        "coverage_type": "Basic",
                        "start_date": date.today() - timedelta(days=365),
                        "end_date": date.today() - timedelta(days=1),
                        "max_coverage_amount": Decimal("50000.00"),
                        "description": "Expired basic coverage",
                    },
                ],
            },
            {
                "user_data": {
                    "email": "robert.wilson@email.com",
                    "first_name": "Robert",
                    "last_name": "Wilson",
                    "password": "citizen123456",
                    "national_id": "CIT-003",
                    "phone_number": "+1-555-0103",
                    "date_of_birth": date(1978, 11, 8),
                    "address": "789 Pine Rd, Naperville, IL 60540",
                },
                "policies": [
                    {
                        "coverage_type": "Premium",
                        "start_date": date.today() - timedelta(days=60),
                        "end_date": date.today() + timedelta(days=305),
                        "max_coverage_amount": Decimal("500000.00"),
                        "description": "Premium executive health coverage",
                    },
                ],
            },
        ]

        for citizen_config in citizens:
            user_data = citizen_config["user_data"]
            if User.objects.filter(email=user_data["email"]).exists():
                self.stdout.write(
                    self.style.WARNING(f"  ⚠ {user_data['email']} already exists, skipping")
                )
                continue

            citizen = UserService.register_citizen(user_data)
            self.stdout.write(self.style.SUCCESS(f"  ✓ Citizen {citizen.email} created"))

            for policy_data in citizen_config["policies"]:
                policy_data["citizen"] = citizen
                policy = PolicyService.create_policy(policy_data)
                self.stdout.write(
                    self.style.SUCCESS(f"    ✓ Policy {policy.policy_number} created")
                )

    def _create_providers(self):
        self.stdout.write("\n→ Creating Healthcare Providers...")
        providers = [
            {
                "name": "Springfield General Hospital",
                "license_number": "SGH-2024-001",
                "provider_type": "Hospital",
                "address": "500 Hospital Dr, Springfield, IL 62701",
                "phone_number": "+1-555-1000",
                "email": "info@sgh.org",
                "city": "Springfield",
            },
            {
                "name": "Downtown Medical Clinic",
                "license_number": "DMC-2024-002",
                "provider_type": "Clinic",
                "address": "100 Health Ave, Chicago, IL 60601",
                "phone_number": "+1-555-2000",
                "email": "contact@dmc.com",
                "city": "Chicago",
            },
            {
                "name": "Metro Pharmacy",
                "license_number": "MPH-2024-003",
                "provider_type": "Pharmacy",
                "address": "200 Rx St, Chicago, IL 60602",
                "phone_number": "+1-555-3000",
                "email": "rx@metropharmacy.com",
                "city": "Chicago",
            },
            {
                "name": "Central Diagnostics Lab",
                "license_number": "CDL-2024-004",
                "provider_type": "Laboratory",
                "address": "300 Lab Blvd, Naperville, IL 60540",
                "phone_number": "+1-555-4000",
                "email": "tests@centraldiag.com",
                "city": "Naperville",
            },
        ]

        from apps.providers.models import Provider

        for provider_data in providers:
            if Provider.objects.filter(license_number=provider_data["license_number"]).exists():
                self.stdout.write(
                    self.style.WARNING(f"  ⚠ {provider_data['name']} already exists, skipping")
                )
                continue
            ProviderService.create_provider(provider_data)
            self.stdout.write(self.style.SUCCESS(f"  ✓ Provider {provider_data['name']} created"))

    def _print_credentials(self):
        self.stdout.write(self.style.NOTICE("\n" + "=" * 60))
        self.stdout.write(self.style.NOTICE("Test Credentials"))
        self.stdout.write(self.style.NOTICE("=" * 60))
        credentials = [
            ("Admin", "admin@nhisp.gov", "admin123456"),
            ("Supervisor", "supervisor@nhisp.gov", "super123456"),
            ("Officer 1", "officer1@nhisp.gov", "officer123456"),
            ("Officer 2", "officer2@nhisp.gov", "officer123456"),
            ("Citizen 1", "john.doe@email.com", "citizen123456"),
            ("Citizen 2", "jane.smith@email.com", "citizen123456"),
            ("Citizen 3", "robert.wilson@email.com", "citizen123456"),
        ]
        for role, email, password in credentials:
            self.stdout.write(f"  {role:12s} | {email:30s} | {password}")
        self.stdout.write(self.style.NOTICE("=" * 60))
