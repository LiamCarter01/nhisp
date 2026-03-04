"""
Provider Views
==============
ViewSets for healthcare provider management.
"""

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated

from apps.core.permissions import IsAdmin
from apps.core.responses import success_response
from apps.providers.models import Provider
from apps.providers.permissions import CanManageProvider
from apps.providers.serializers import ProviderListSerializer, ProviderSerializer
from apps.providers.services.provider_service import ProviderService


class ProviderViewSet(viewsets.ModelViewSet):
    """
    ViewSet for healthcare providers.
    - All authenticated users can view providers.
    - Only Admin can create/modify providers.
    """

    queryset = Provider.objects.all()
    serializer_class = ProviderSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [IsAuthenticated()]
        return [CanManageProvider()]

    def get_serializer_class(self):
        if self.action == "list":
            return ProviderListSerializer
        return ProviderSerializer

    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    def deactivate(self, request, pk=None):
        provider = self.get_object()
        ProviderService.deactivate_provider(provider)
        return success_response(
            data=ProviderSerializer(provider).data,
            message="Provider deactivated successfully.",
        )

    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    def activate(self, request, pk=None):
        provider = self.get_object()
        ProviderService.activate_provider(provider)
        return success_response(
            data=ProviderSerializer(provider).data,
            message="Provider activated successfully.",
        )
