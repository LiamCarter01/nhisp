"""
Policy Permissions
==================
Custom DRF permissions for policy endpoints.
"""

from rest_framework.permissions import BasePermission

from apps.core.permissions import ROLE_ADMIN, ROLE_CITIZEN, STAFF_ROLES, user_has_any_role, user_has_role


class CanViewPolicy(BasePermission):
    """Citizens can only view their own policies. Staff can view all."""

    def has_object_permission(self, request, view, obj):
        if user_has_any_role(request.user, STAFF_ROLES):
            return True
        return obj.citizen == request.user


class CanManagePolicy(BasePermission):
    """Only Admin and Supervisor can create/modify policies."""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and user_has_any_role(
            request.user, [ROLE_ADMIN, "Supervisor"]
        )
