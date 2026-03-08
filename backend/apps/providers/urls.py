"""
Provider URL Router
===================
"""

from rest_framework.routers import DefaultRouter

from apps.providers.views import ProviderFeedbackViewSet, ProviderViewSet

router = DefaultRouter()
router.register(r"providers", ProviderViewSet, basename="provider")
router.register(r"feedback", ProviderFeedbackViewSet, basename="provider-feedback")
