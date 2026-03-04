"""
Payment Serializers
===================
"""

from rest_framework import serializers

from apps.payments.models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    """Read serializer for payments."""

    claim_number = serializers.CharField(source="claim.claim_number", read_only=True)
    citizen_name = serializers.CharField(
        source="claim.policy.citizen.get_full_name", read_only=True
    )

    class Meta:
        model = Payment
        fields = [
            "id",
            "claim",
            "claim_number",
            "citizen_name",
            "payment_reference",
            "amount",
            "paid_at",
            "payment_method",
            "notes",
            "created_at",
        ]
        read_only_fields = ["id", "payment_reference", "created_at"]


class PaymentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating payments (admin operation)."""

    class Meta:
        model = Payment
        fields = [
            "claim",
            "amount",
            "payment_method",
            "notes",
        ]

    def validate_claim(self, claim):
        if claim.status != "Approved":
            raise serializers.ValidationError(
                "Payments can only be made for approved claims."
            )
        if hasattr(claim, "payment"):
            raise serializers.ValidationError(
                "This claim already has a payment record."
            )
        return claim

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value

    def create(self, validated_data):
        from apps.payments.services.payment_service import PaymentService

        return PaymentService.process_payment(validated_data)


class PaymentListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing payments."""

    claim_number = serializers.CharField(source="claim.claim_number", read_only=True)

    class Meta:
        model = Payment
        fields = [
            "id",
            "claim_number",
            "payment_reference",
            "amount",
            "paid_at",
            "payment_method",
        ]
