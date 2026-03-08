'''
Provider Serializers
====================
'''

from rest_framework import serializers

from apps.providers.models import FeedbackStatus, Provider, ProviderFeedback
from apps.providers.services.provider_feedback_service import ProviderFeedbackService


def _resolve_average_rating(provider: Provider) -> float | None:
    average = getattr(provider, 'average_rating', None)
    if average is not None:
        return round(float(average), 2)
    return ProviderFeedbackService.get_average_rating(provider)


def _resolve_feedback_count(provider: Provider) -> int:
    count = getattr(provider, 'feedback_count', None)
    if count is not None:
        return count
    return ProviderFeedbackService.get_feedback_count(provider)


class ProviderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Provider
        fields = [
            'id',
            'name',
            'license_number',
            'provider_type',
            'active',
            'address',
            'phone_number',
            'email',
            'city',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProviderFeedbackSummarySerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)

    class Meta:
        model = ProviderFeedback
        fields = [
            'id',
            'rating_score',
            'comment',
            'created_at',
            'user_name',
        ]


class ProviderFeedbackSerializer(serializers.ModelSerializer):
    provider = serializers.PrimaryKeyRelatedField(queryset=Provider.objects.all())
    provider_name = serializers.CharField(source='provider.name', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = ProviderFeedback
        fields = [
            'id',
            'provider',
            'provider_name',
            'user',
            'user_name',
            'user_email',
            'rating_score',
            'comment',
            'status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'user',
            'status',
            'created_at',
            'updated_at',
            'provider_name',
            'user_name',
            'user_email',
        ]


class ProviderListSerializer(serializers.ModelSerializer):
    average_rating = serializers.SerializerMethodField()
    feedback_count = serializers.SerializerMethodField()
    recent_feedbacks = serializers.SerializerMethodField()

    class Meta:
        model = Provider
        fields = ProviderSerializer.Meta.fields + [
            'average_rating',
            'feedback_count',
            'recent_feedbacks',
        ]

    def get_average_rating(self, obj: Provider) -> float | None:
        return _resolve_average_rating(obj)

    def get_feedback_count(self, obj: Provider) -> int:
        return _resolve_feedback_count(obj)

    def get_recent_feedbacks(self, obj: Provider) -> list:
        feedbacks = ProviderFeedbackService.get_recent_feedbacks(obj)
        return ProviderFeedbackSummarySerializer(feedbacks, many=True).data


class ProviderDetailSerializer(ProviderSerializer):
    average_rating = serializers.SerializerMethodField()
    feedback_count = serializers.SerializerMethodField()
    feedbacks = serializers.SerializerMethodField()

    class Meta(ProviderSerializer.Meta):
        fields = ProviderSerializer.Meta.fields + [
            'average_rating',
            'feedback_count',
            'feedbacks',
        ]

    def get_average_rating(self, obj: Provider) -> float | None:
        return _resolve_average_rating(obj)

    def get_feedback_count(self, obj: Provider) -> int:
        return _resolve_feedback_count(obj)

    def get_feedbacks(self, obj: Provider) -> list:
        feedbacks = ProviderFeedbackService.get_approved_feedbacks(obj)
        return ProviderFeedbackSummarySerializer(feedbacks, many=True).data


class ProviderFeedbackModerationSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=FeedbackStatus.choices)
