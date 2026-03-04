"""
Provider Permissions
====================
"""

from rest_framework.permissions import BasePermission

from apps.core.permissions import ROLE_ADMIN, STAFF_ROLES, user_has_any_role, user_has_role


class CanManageProvider(BasePermission):
    """Only Admin can create/modify providers."""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and user_has_role(request.user, ROLE_ADMIN)
