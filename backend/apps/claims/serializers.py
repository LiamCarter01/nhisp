"""
Claim Serializers
=================
"""

from rest_framework import serializers

from apps.claims.models import Claim, ClaimStatus


class ClaimSerializer(serializers.ModelSerializer):
    """Read serializer for claims."""

    citizen_name = serializers.CharField(source="policy.citizen.get_full_name", read_only=True)
    policy_number = serializers.CharField(source="policy.policy_number", read_only=True)
    reviewed_by_name = serializers.CharField(
        source="reviewed_by.get_full_name", read_only=True, default=None
    )

    class Meta:
        model = Claim
        fields = [
            "id",
            "policy",
            "policy_number",
            "citizen_name",
            "claim_number",
            "status",
            "amount_requested",
            "amount_approved",
            "description",
            "diagnosis_code",
            "submitted_at",
            "reviewed_at",
            "reviewed_by",
            "reviewed_by_name",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "claim_number",
            "status",
            "amount_approved",
            "submitted_at",
            "reviewed_at",
            "reviewed_by",
            "created_at",
            "updated_at",
        ]


class ClaimCreateSerializer(serializers.ModelSerializer):
    """Serializer for citizens submitting new claims."""

    class Meta:
        model = Claim
        fields = [
            "policy",
            "amount_requested",
            "description",
            "diagnosis_code",
        ]

    def validate_amount_requested(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value

    def validate(self, attrs):
        policy = attrs["policy"]
        request = self.context.get("request")

        # Citizens can only create claims for their own policies
        if request and request.user.is_citizen:
            if policy.citizen != request.user:
                raise serializers.ValidationError(
                    {"policy": "You can only submit claims for your own policies."}
                )

        if not policy.is_valid:
            raise serializers.ValidationError(
                {"policy": "Cannot submit claims for an inactive or expired policy."}
            )

        if attrs["amount_requested"] > policy.max_coverage_amount:
            raise serializers.ValidationError(
                {
                    "amount_requested": f"Amount exceeds maximum coverage of {policy.max_coverage_amount}."
                }
            )

        return attrs

    def create(self, validated_data):
        from apps.claims.services.claim_service import ClaimService

        return ClaimService.submit_claim(validated_data)


class ClaimReviewSerializer(serializers.Serializer):
    """Serializer for officers reviewing claims."""

    status = serializers.ChoiceField(
        choices=[
            ClaimStatus.UNDER_REVIEW,
            ClaimStatus.APPROVED,
            ClaimStatus.REJECTED,
        ]
    )
    amount_approved = serializers.DecimalField(
        max_digits=12, decimal_places=2, required=False, allow_null=True
    )
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        new_status = attrs.get("status")
        if new_status == ClaimStatus.APPROVED and not attrs.get("amount_approved"):
            raise serializers.ValidationError(
                {"amount_approved": "Approved amount is required when approving a claim."}
            )
        return attrs


class ClaimOverrideSerializer(serializers.Serializer):
    """Serializer for supervisor override (Rejected -> Approved)."""

    amount_approved = serializers.DecimalField(max_digits=12, decimal_places=2)
    notes = serializers.CharField(required=False, allow_blank=True)


class ClaimListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing claims."""

    citizen_name = serializers.CharField(source="policy.citizen.get_full_name", read_only=True)
    policy_number = serializers.CharField(source="policy.policy_number", read_only=True)

    class Meta:
        model = Claim
        fields = [
            "id",
            "claim_number",
            "policy_number",
            "citizen_name",
            "status",
            "amount_requested",
            "amount_approved",
            "submitted_at",
            "reviewed_at",
        ]
