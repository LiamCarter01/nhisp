"""
Provider Serializers
====================
"""

from rest_framework import serializers

from apps.providers.models import Provider, ProviderFeedback


class ProviderFeedbackPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProviderFeedback
        fields = ["id", "rating_score", "comment", "created_at"]


class ProviderSerializer(serializers.ModelSerializer):
    average_rating = serializers.DecimalField(
        max_digits=4,
        decimal_places=2,
        allow_null=True,
        read_only=True,
    )
    approved_feedback_count = serializers.IntegerField(read_only=True)
    feedback_preview = ProviderFeedbackPublicSerializer(
        many=True,
        read_only=True,
        source="approved_feedback_preview",
    )

    class Meta:
        model = Provider
        fields = [
            "id",
            "name",
            "license_number",
            "provider_type",
            "active",
            "address",
            "phone_number",
            "email",
            "city",
            "created_at",
            "updated_at",
            "average_rating",
            "approved_feedback_count",
            "feedback_preview",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "average_rating",
            "approved_feedback_count",
            "feedback_preview",
        ]


class ProviderListSerializer(serializers.ModelSerializer):
    average_rating = serializers.DecimalField(
        max_digits=4,
        decimal_places=2,
        allow_null=True,
        read_only=True,
    )
    approved_feedback_count = serializers.IntegerField(read_only=True)
    feedback_preview = ProviderFeedbackPublicSerializer(
        many=True,
        read_only=True,
        source="approved_feedback_preview",
    )

    class Meta:
        model = Provider
        fields = [
            "id",
            "name",
            "license_number",
            "provider_type",
            "active",
            "city",
            "average_rating",
            "approved_feedback_count",
            "feedback_preview",
        ]


class ProviderFeedbackCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProviderFeedback
        fields = ["rating_score", "comment"]


class ProviderFeedbackCitizenSerializer(serializers.ModelSerializer):
    provider_name = serializers.CharField(source="provider.name", read_only=True)

    class Meta:
        model = ProviderFeedback
        fields = [
            "id",
            "provider",
            "provider_name",
            "rating_score",
            "comment",
            "status",
            "created_at",
            "moderated_at",
        ]
        read_only_fields = fields


class ProviderFeedbackManagementSerializer(serializers.ModelSerializer):
    provider_name = serializers.CharField(source="provider.name", read_only=True)
    citizen_name = serializers.SerializerMethodField()
    citizen_email = serializers.EmailField(source="citizen.email", read_only=True)
    moderated_by_name = serializers.SerializerMethodField()

    class Meta:
        model = ProviderFeedback
        fields = [
            "id",
            "provider",
            "provider_name",
            "citizen",
            "citizen_name",
            "citizen_email",
            "rating_score",
            "comment",
            "status",
            "created_at",
            "moderated_at",
            "moderated_by",
            "moderated_by_name",
        ]
        read_only_fields = [
            "id",
            "provider",
            "provider_name",
            "citizen",
            "citizen_name",
            "citizen_email",
            "rating_score",
            "comment",
            "status",
            "created_at",
            "moderated_at",
            "moderated_by",
            "moderated_by_name",
        ]

    def get_citizen_name(self, obj):
        return obj.citizen.get_full_name()

    def get_moderated_by_name(self, obj):
        return obj.moderated_by.get_full_name() if obj.moderated_by else None
