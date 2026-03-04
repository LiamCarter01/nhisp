"""
NHISP Central API Router
=========================
All app-level routes are registered here through DRF routers.
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from apps.claims.urls import router as claims_router
from apps.notifications.urls import router as notifications_router
from apps.payments.urls import router as payments_router
from apps.policies.urls import router as policies_router
from apps.providers.urls import router as providers_router
from apps.users.urls import router as users_router

# =============================================================================
# Central Router - Aggregates all app routers
# =============================================================================

router = DefaultRouter()

# Register all app routes into the central router
router.registry.extend(users_router.registry)
router.registry.extend(policies_router.registry)
router.registry.extend(claims_router.registry)
router.registry.extend(payments_router.registry)
router.registry.extend(providers_router.registry)
router.registry.extend(notifications_router.registry)

urlpatterns = [
    # JWT Auth endpoints
    path("auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # User auth endpoints (register, profile, etc.)
    path("auth/", include("apps.users.auth_urls")),
    # All ViewSet routes
    path("", include(router.urls)),
]
