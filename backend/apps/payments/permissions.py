"""
Payment Permissions
===================
Custom DRF permissions for payment endpoints.
"""

from rest_framework.permissions import BasePermission

from apps.core.permissions import ROLE_ADMIN, ROLE_CITIZEN, STAFF_ROLES, user_has_any_role, user_has_role


class CanViewPayment(BasePermission):
    """Citizens can only view their own payments. Staff can view all."""

    def has_object_permission(self, request, view, obj):
        if user_has_any_role(request.user, STAFF_ROLES):
            return True
        return obj.claim.policy.citizen == request.user


class CanProcessPayment(BasePermission):
    """Only Admin can process payments."""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and user_has_role(request.user, ROLE_ADMIN)
