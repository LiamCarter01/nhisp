"""
Provider Views
==============
ViewSets for healthcare provider management, including citizen feedback.
"""

from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated

from apps.core.permissions import (
    IsAdmin,
    IsCitizen,
    IsStaff,
    STAFF_ROLES,
    user_has_any_role,
)
from apps.core.responses import created_response, success_response
from apps.providers.models import FeedbackStatus, Provider, ProviderFeedback
from apps.providers.permissions import CanManageProvider
from apps.providers.serializers import (
    ProviderDetailSerializer,
    ProviderFeedbackModerationSerializer,
    ProviderFeedbackSerializer,
    ProviderListSerializer,
    ProviderSerializer,
)
from apps.providers.services import ProviderFeedbackService, ProviderService


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
        if self.action == "retrieve":
            return ProviderDetailSerializer
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


class ProviderFeedbackViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    """ViewSet for managing provider feedback."""

    queryset = (
        ProviderFeedback.objects.select_related("provider", "user").order_by("-created_at")
    )
    serializer_class = ProviderFeedbackSerializer

    def get_permissions(self):
        if self.action == "create":
            return [IsAuthenticated(), IsCitizen()]
        if self.action in ("moderate",):
            return [IsAuthenticated(), IsStaff()]
        return [IsAuthenticated()]

    def get_queryset(self):
        queryset = super().get_queryset()
        provider_id = self.request.query_params.get("provider")
        status = self.request.query_params.get("status")

        if provider_id:
            queryset = queryset.filter(provider_id=provider_id)
        if status:
            queryset = queryset.filter(status=status)
        elif not user_has_any_role(self.request.user, STAFF_ROLES):
            queryset = queryset.filter(status=FeedbackStatus.APPROVED)

        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        feedback = ProviderFeedbackService.create_feedback(
            provider=serializer.validated_data["provider"],
            user=request.user,
            rating_score=serializer.validated_data["rating_score"],
            comment=serializer.validated_data["comment"],
        )

        return created_response(
            data=ProviderFeedbackSerializer(feedback).data,
            message="Feedback submitted for moderation.",
        )

    @action(detail=True, methods=["post"], permission_classes=[IsStaff])
    def moderate(self, request, pk=None):
        feedback = self.get_object()
        serializer = ProviderFeedbackModerationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        feedback.status = serializer.validated_data["status"]
        feedback.save(update_fields=["status", "updated_at"])

        return success_response(
            data=ProviderFeedbackSerializer(feedback).data,
            message="Feedback status updated.",
        )
