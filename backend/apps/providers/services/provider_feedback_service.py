"""
Provider Feedback Service
========================
Business utilities for provider feedback aggregation and management.
"""

from django.db.models import Avg

from apps.providers.models import FeedbackStatus, Provider, ProviderFeedback


class ProviderFeedbackService:
    """Service layer for provider feedback operations."""

    RECENT_FEEDBACK_LIMIT = 3

    @staticmethod
    def get_average_rating(provider: Provider) -> float | None:
        """Return the average approved rating for the provider."""
        average = (
            ProviderFeedback.objects
            .filter(provider=provider, status=FeedbackStatus.APPROVED)
            .aggregate(avg=Avg("rating_score"))["avg"]
        )
        return float(average) if average is not None else None

    @staticmethod
    def get_feedback_count(provider: Provider) -> int:
        """Return the count of approved feedback entries for the provider."""
        return ProviderFeedback.objects.filter(provider=provider, status=FeedbackStatus.APPROVED).count()

    @staticmethod
    def get_recent_feedbacks(provider: Provider, limit: int | None = None):
        """Return the most recent approved feedback entries for the provider."""
        return (
            ProviderFeedback.objects
            .filter(provider=provider, status=FeedbackStatus.APPROVED)
            .select_related("user")
            .order_by("-created_at")[: limit or ProviderFeedbackService.RECENT_FEEDBACK_LIMIT]
        )

    @staticmethod
    def get_approved_feedbacks(provider: Provider):
        """Return all approved feedback entries for the provider."""
        return (
            ProviderFeedback.objects
            .filter(provider=provider, status=FeedbackStatus.APPROVED)
            .select_related("user")
            .order_by("-created_at")
        )

    @staticmethod
    def create_feedback(provider: Provider, user, rating_score: int, comment: str) -> ProviderFeedback:
        """Create a new feedback entry (defaults to pending for moderation)."""
        return ProviderFeedback.objects.create(
            provider=provider,
            user=user,
            rating_score=rating_score,
            comment=comment,
            status=FeedbackStatus.PENDING,
        )
