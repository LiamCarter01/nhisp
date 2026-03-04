"""
Payment Views
=============
ViewSets for payment management.
"""

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from apps.core.permissions import IsAdmin
from apps.payments.models import Payment
from apps.payments.permissions import CanProcessPayment, CanViewPayment
from apps.payments.serializers import (
    PaymentCreateSerializer,
    PaymentListSerializer,
    PaymentSerializer,
)
from apps.payments.services.payment_service import PaymentService


class PaymentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for payments.
    - Citizens see only their own payments.
    - Admin can manage all payments.
    """

    serializer_class = PaymentSerializer
    http_method_names = ["get", "post", "head", "options"]

    def get_queryset(self):
        user = self.request.user
        if user.is_citizen:
            return PaymentService.get_citizen_payments(user)
        return (
            Payment.objects.all()
            .select_related("claim", "claim__policy", "claim__policy__citizen")
            .order_by("-paid_at")
        )

    def get_permissions(self):
        if self.action == "create":
            return [CanProcessPayment()]
        elif self.action == "retrieve":
            return [IsAuthenticated(), CanViewPayment()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == "create":
            return PaymentCreateSerializer
        elif self.action == "list":
            return PaymentListSerializer
        return PaymentSerializer
