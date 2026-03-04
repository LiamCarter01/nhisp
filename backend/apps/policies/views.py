"""
Policy Views
============
ViewSets for insurance policy management.
"""

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated

from apps.core.permissions import IsAdmin, IsAdminOrSupervisor, IsStaff
from apps.core.responses import success_response
from apps.policies.models import Policy
from apps.policies.permissions import CanManagePolicy, CanViewPolicy
from apps.policies.serializers import (
    PolicyCreateSerializer,
    PolicyListSerializer,
    PolicySerializer,
)
from apps.policies.services.policy_service import PolicyService


class PolicyViewSet(viewsets.ModelViewSet):
    """
    ViewSet for insurance policies.
    - Citizens see only their own policies.
    - Staff can see and manage all policies.
    """

    serializer_class = PolicySerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_citizen:
            return Policy.objects.filter(citizen=user).select_related("citizen")
        return Policy.objects.all().select_related("citizen")

    def get_permissions(self):
        if self.action in ("create", "destroy"):
            return [IsAdminOrSupervisor()]
        elif self.action in ("update", "partial_update"):
            return [IsAdminOrSupervisor()]
        elif self.action == "retrieve":
            return [IsAuthenticated(), CanViewPolicy()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == "create":
            return PolicyCreateSerializer
        elif self.action == "list":
            return PolicyListSerializer
        return PolicySerializer

    @action(detail=True, methods=["post"], permission_classes=[IsAdminOrSupervisor])
    def deactivate(self, request, pk=None):
        """Deactivate a policy."""
        policy = self.get_object()
        PolicyService.deactivate_policy(policy)
        return success_response(
            data=PolicySerializer(policy).data,
            message="Policy deactivated successfully.",
        )

    @action(detail=True, methods=["post"], permission_classes=[IsAdminOrSupervisor])
    def activate(self, request, pk=None):
        """Activate a policy."""
        policy = self.get_object()
        PolicyService.activate_policy(policy)
        return success_response(
            data=PolicySerializer(policy).data,
            message="Policy activated successfully.",
        )
