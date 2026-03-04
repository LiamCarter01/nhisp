"""
Payment URL Router
==================
"""

from rest_framework.routers import DefaultRouter

from apps.payments.views import PaymentViewSet

router = DefaultRouter()
router.register(r"payments", PaymentViewSet, basename="payment")
