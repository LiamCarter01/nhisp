"""
User Views
==========
ViewSets for user management. Business logic delegated to services.
"""

from django.contrib.auth import get_user_model
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated

from apps.core.permissions import IsAdmin
from apps.core.responses import success_response
from apps.users.permissions import IsOwnerOrAdmin
from apps.users.serializers import (
    AdminUserCreateSerializer,
    ChangePasswordSerializer,
    ProfileSerializer,
    UserCreateSerializer,
    UserSerializer,
    UserUpdateSerializer,
)
from apps.users.services.user_service import UserService

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for user management.
    Admin can list/create/update all users.
    Regular users can only view/update their own profile.
    """

    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action in ("create",):
            return [IsAdmin()]
        elif self.action in ("list", "destroy"):
            return [IsAdmin()]
        elif self.action in ("retrieve", "update", "partial_update"):
            return [IsOwnerOrAdmin()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == "create":
            return AdminUserCreateSerializer
        elif self.action in ("update", "partial_update"):
            return UserUpdateSerializer
        return UserSerializer

    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    def deactivate(self, request, pk=None):
        """Deactivate a user account."""
        user = self.get_object()
        UserService.deactivate_user(user)
        return success_response(message="User deactivated successfully.")

    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    def activate(self, request, pk=None):
        """Activate a user account."""
        user = self.get_object()
        UserService.activate_user(user)
        return success_response(message="User activated successfully.")
