"""
Claim Permissions
=================
Custom DRF permissions for claim endpoints.
"""

from rest_framework.permissions import BasePermission

from apps.core.permissions import (
    ROLE_ADMIN,
    ROLE_CITIZEN,
    ROLE_CLAIMS_OFFICER,
    ROLE_SUPERVISOR,
    STAFF_ROLES,
    user_has_any_role,
    user_has_role,
)


class CanCreateClaim(BasePermission):
    """Only citizens can create claims (for their own policies)."""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (
            user_has_role(request.user, ROLE_CITIZEN)
            or user_has_role(request.user, ROLE_ADMIN)
        )


class CanViewClaim(BasePermission):
    """Citizens can only view their own claims. Staff can view all."""

    def has_object_permission(self, request, view, obj):
        if user_has_any_role(request.user, STAFF_ROLES):
            return True
        return obj.policy.citizen == request.user


class CanReviewClaim(BasePermission):
    """Only Claims Officers and Admins can review claims."""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and user_has_any_role(
            request.user, [ROLE_CLAIMS_OFFICER, ROLE_ADMIN]
        )


class CanOverrideClaim(BasePermission):
    """Only Supervisors and Admins can override rejected claims."""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and user_has_any_role(
            request.user, [ROLE_SUPERVISOR, ROLE_ADMIN]
        )
