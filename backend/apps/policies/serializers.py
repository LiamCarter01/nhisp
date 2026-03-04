"""
Policy Serializers
==================
"""

from rest_framework import serializers

from apps.policies.models import Policy
from apps.users.serializers import UserSerializer


class PolicySerializer(serializers.ModelSerializer):
    """Read serializer for policies."""

    citizen_name = serializers.CharField(source="citizen.get_full_name", read_only=True)
    is_valid = serializers.BooleanField(read_only=True)

    class Meta:
        model = Policy
        fields = [
            "id",
            "citizen",
            "citizen_name",
            "policy_number",
            "coverage_type",
            "start_date",
            "end_date",
            "active",
            "max_coverage_amount",
            "description",
            "is_valid",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "policy_number", "created_at", "updated_at"]


class PolicyCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating policies (admin/staff operation)."""

    class Meta:
        model = Policy
        fields = [
            "citizen",
            "coverage_type",
            "start_date",
            "end_date",
            "max_coverage_amount",
            "description",
        ]

    def validate(self, attrs):
        if attrs["start_date"] >= attrs["end_date"]:
            raise serializers.ValidationError(
                {"end_date": "End date must be after start date."}
            )
        return attrs

    def create(self, validated_data):
        from apps.policies.services.policy_service import PolicyService

        return PolicyService.create_policy(validated_data)


class PolicyListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing policies."""

    citizen_name = serializers.CharField(source="citizen.get_full_name", read_only=True)

    class Meta:
        model = Policy
        fields = [
            "id",
            "policy_number",
            "coverage_type",
            "start_date",
            "end_date",
            "active",
            "citizen_name",
        ]
