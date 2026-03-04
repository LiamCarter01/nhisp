"""
Claim Views
===========
ViewSets for insurance claim management.
Business logic delegated to ClaimService.
"""

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated

from apps.claims.models import Claim
from apps.claims.permissions import (
    CanCreateClaim,
    CanOverrideClaim,
    CanReviewClaim,
    CanViewClaim,
)
from apps.claims.serializers import (
    ClaimCreateSerializer,
    ClaimListSerializer,
    ClaimOverrideSerializer,
    ClaimReviewSerializer,
    ClaimSerializer,
)
from apps.claims.services.claim_service import ClaimService
from apps.core.responses import success_response


class ClaimViewSet(viewsets.ModelViewSet):
    """
    ViewSet for insurance claims.
    - Citizens see only their own claims and can submit new ones.
    - Officers can review and transition claim statuses.
    - Supervisors can override rejected claims.
    """

    serializer_class = ClaimSerializer
    http_method_names = ["get", "post", "patch", "head", "options"]

    def get_queryset(self):
        user = self.request.user
        if user.is_citizen:
            return ClaimService.get_claims_for_citizen(user)
        return (
            Claim.objects.all()
            .select_related("policy", "policy__citizen", "reviewed_by")
            .order_by("-submitted_at")
        )

    def get_permissions(self):
        if self.action == "create":
            return [CanCreateClaim()]
        elif self.action in ("retrieve",):
            return [IsAuthenticated(), CanViewClaim()]
        elif self.action == "review":
            return [CanReviewClaim()]
        elif self.action == "override":
            return [CanOverrideClaim()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == "create":
            return ClaimCreateSerializer
        elif self.action == "list":
            return ClaimListSerializer
        elif self.action == "review":
            return ClaimReviewSerializer
        elif self.action == "override":
            return ClaimOverrideSerializer
        return ClaimSerializer

    @action(detail=True, methods=["post"], permission_classes=[CanReviewClaim])
    def review(self, request, pk=None):
        """
        Review a claim - transition its status.
        Used by Claims Officers and Admin.
        """
        claim = self.get_object()
        serializer = ClaimReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        claim = ClaimService.transition_status(
            claim=claim,
            new_status=serializer.validated_data["status"],
            reviewer=request.user,
            amount_approved=serializer.validated_data.get("amount_approved"),
            notes=serializer.validated_data.get("notes", ""),
        )

        return success_response(
            data=ClaimSerializer(claim).data,
            message=f"Claim status updated to {claim.status}.",
        )

    @action(detail=True, methods=["post"], permission_classes=[CanOverrideClaim])
    def override(self, request, pk=None):
        """
        Supervisor override - approve a previously rejected claim.
        """
        claim = self.get_object()
        serializer = ClaimOverrideSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        claim = ClaimService.supervisor_override(
            claim=claim,
            supervisor=request.user,
            amount_approved=serializer.validated_data["amount_approved"],
            notes=serializer.validated_data.get("notes", ""),
        )

        return success_response(
            data=ClaimSerializer(claim).data,
            message="Claim override successful. Status changed to Approved.",
        )

    @action(detail=False, methods=["get"], permission_classes=[CanReviewClaim])
    def pending(self, request):
        """Get claims pending review."""
        claims = ClaimService.get_claims_for_review()
        page = self.paginate_queryset(claims)
        if page is not None:
            serializer = ClaimListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = ClaimListSerializer(claims, many=True)
        return success_response(data=serializer.data)

    @action(detail=False, methods=["get"], permission_classes=[CanOverrideClaim])
    def rejected(self, request):
        """Get rejected claims (for supervisor override view)."""
        claims = ClaimService.get_rejected_claims()
        page = self.paginate_queryset(claims)
        if page is not None:
            serializer = ClaimListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = ClaimListSerializer(claims, many=True)
        return success_response(data=serializer.data)
