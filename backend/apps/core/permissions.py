"""
Core Permissions
================
Base permission classes used across the portal.
"""

from rest_framework.permissions import BasePermission

# Role group names - used consistently across the application
ROLE_ADMIN = "Admin"
ROLE_SUPERVISOR = "Supervisor"
ROLE_CLAIMS_OFFICER = "ClaimsOfficer"
ROLE_CITIZEN = "Citizen"

ALL_ROLES = [ROLE_ADMIN, ROLE_SUPERVISOR, ROLE_CLAIMS_OFFICER, ROLE_CITIZEN]
STAFF_ROLES = [ROLE_ADMIN, ROLE_SUPERVISOR, ROLE_CLAIMS_OFFICER]


def user_has_role(user, role_name):
    """Check if user belongs to a specific group/role."""
    return user.groups.filter(name=role_name).exists()


def user_has_any_role(user, role_names):
    """Check if user belongs to any of the specified groups/roles."""
    return user.groups.filter(name__in=role_names).exists()


class IsAdmin(BasePermission):
    """Allows access only to Admin users."""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and user_has_role(request.user, ROLE_ADMIN)


class IsSupervisor(BasePermission):
    """Allows access only to Supervisor users."""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and user_has_role(request.user, ROLE_SUPERVISOR)


class IsClaimsOfficer(BasePermission):
    """Allows access only to Claims Officer users."""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and user_has_role(request.user, ROLE_CLAIMS_OFFICER)


class IsCitizen(BasePermission):
    """Allows access only to Citizen users."""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and user_has_role(request.user, ROLE_CITIZEN)


class IsStaff(BasePermission):
    """Allows access to Admin, Supervisor, or Claims Officer."""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and user_has_any_role(request.user, STAFF_ROLES)


class IsAdminOrSupervisor(BasePermission):
    """Allows access to Admin or Supervisor."""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and user_has_any_role(
            request.user, [ROLE_ADMIN, ROLE_SUPERVISOR]
        )
