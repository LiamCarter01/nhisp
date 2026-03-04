"""
Policy URL Router
=================
"""

from rest_framework.routers import DefaultRouter

from apps.policies.views import PolicyViewSet

router = DefaultRouter()
router.register(r"policies", PolicyViewSet, basename="policy")
