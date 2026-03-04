"""
User Permissions
================
Custom DRF permissions for user-related endpoints.
"""

from rest_framework.permissions import BasePermission

from apps.core.permissions import ROLE_ADMIN, user_has_role


class IsOwnerOrAdmin(BasePermission):
    """Allow access to the resource owner or admin users."""

    def has_object_permission(self, request, view, obj):
        return obj == request.user or user_has_role(request.user, ROLE_ADMIN)
