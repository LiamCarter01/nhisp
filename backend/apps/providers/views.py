"""
Provider Views
==============
ViewSets for healthcare provider management.
"""

from django.db.models import Avg, Count, Prefetch, Q
from django.utils import timezone

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated

from apps.core.permissions import IsAdmin, IsCitizen, IsStaff
from apps.core.responses import created_response, success_response
from apps.providers.models import (
    Provider,
    ProviderFeedback,
    ProviderFeedbackStatus,
)
from apps.providers.permissions import CanManageProvider
from apps.providers.serializers import (
    ProviderFeedbackCitizenSerializer,
    ProviderFeedbackCreateSerializer,
    ProviderFeedbackManagementSerializer,
    ProviderFeedbackPublicSerializer,
    ProviderListSerializer,
    ProviderSerializer,
)
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
        if self.action in ("list", "retrieve", "feedback"):
            return [IsAuthenticated()]
        if self.action == "my_feedback":
            return [IsAuthenticated(), IsCitizen()]
        if self.action == "submit_feedback":
            return [IsAuthenticated(), IsCitizen()]
        return [CanManageProvider()]

    def get_queryset(self):
        approved_feedback = ProviderFeedback.objects.filter(
            status=ProviderFeedbackStatus.APPROVED,
        ).order_by("-created_at")

        return (
            Provider.objects.annotate(
                average_rating=Avg(
                    "feedback_entries__rating_score",
                    filter=Q(feedback_entries__status=ProviderFeedbackStatus.APPROVED),
                ),
                approved_feedback_count=Count(
                    "feedback_entries",
                    filter=Q(feedback_entries__status=ProviderFeedbackStatus.APPROVED),
                ),
            )
            .prefetch_related(
                Prefetch(
                    "feedback_entries",
                    queryset=approved_feedback,
                    to_attr="approved_feedback_preview",
                )
            )
        )

    def get_serializer_class(self):
        if self.action == "list":
            return ProviderListSerializer
        return ProviderSerializer

    @action(detail=True, methods=["get"], permission_classes=[IsAuthenticated])
    def feedback(self, request, pk=None):
        provider = self.get_object()
        entries = provider.feedback_entries.filter(
            status=ProviderFeedbackStatus.APPROVED,
        ).order_by("-created_at")
        serializer = ProviderFeedbackPublicSerializer(entries, many=True)
        return success_response(data=serializer.data)

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[IsAuthenticated(), IsCitizen()],
        url_path="submit-feedback",
    )
    def submit_feedback(self, request, pk=None):
        provider = self.get_object()
        serializer = ProviderFeedbackCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        feedback = serializer.save(provider=provider, citizen=request.user)
        response_serializer = ProviderFeedbackPublicSerializer(feedback)
        return created_response(
            data=response_serializer.data,
            message="Feedback submitted and awaiting moderation.",
        )

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated(), IsCitizen()], url_path="my-feedback")
    def my_feedback(self, request):
        entries = ProviderFeedback.objects.filter(citizen=request.user).order_by("-created_at")
        serializer = ProviderFeedbackCitizenSerializer(entries, many=True)
        return success_response(data=serializer.data)

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


class ProviderFeedbackViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ProviderFeedback.objects.select_related("provider", "citizen", "moderated_by").all()
    serializer_class = ProviderFeedbackManagementSerializer
    permission_classes = [IsStaff]

    def get_queryset(self):
        queryset = super().get_queryset()
        status_param = self.request.query_params.get("status")
        provider_param = self.request.query_params.get("provider")

        if status_param in ProviderFeedbackStatus.values:
            queryset = queryset.filter(status=status_param)
        if provider_param:
            queryset = queryset.filter(provider_id=provider_param)

        return queryset.order_by("-created_at")

    @action(detail=True, methods=["post"], permission_classes=[IsStaff])
    def moderate(self, request, pk=None):
        feedback = self.get_object()
        status_value = request.data.get("status")
        if status_value not in ProviderFeedbackStatus.values:
            raise ValidationError({"status": "Invalid status value."})
        feedback.status = status_value
        feedback.moderated_by = request.user
        feedback.moderated_at = timezone.now()
        feedback.save(update_fields=["status", "moderated_by", "moderated_at"])
        serializer = self.get_serializer(feedback)
        return success_response(
            data=serializer.data, message="Feedback moderated successfully.",
        )