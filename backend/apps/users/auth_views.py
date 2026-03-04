"""
User Auth Views
===============
Views for authentication-related endpoints (register, profile, change password).
"""

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView

from apps.core.responses import created_response, success_response
from apps.users.serializers import (
    ChangePasswordSerializer,
    ProfileSerializer,
    UserCreateSerializer,
)
from apps.users.services.user_service import UserService


class RegisterView(APIView):
    """Public endpoint for citizen self-registration."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return created_response(
            data=ProfileSerializer(user).data,
            message="Registration successful.",
        )


class ProfileView(APIView):
    """Authenticated user's profile."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = ProfileSerializer(request.user)
        return success_response(data=serializer.data)


class ChangePasswordView(APIView):
    """Change password for authenticated user."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        UserService.change_password(request.user, serializer.validated_data["new_password"])
        return success_response(message="Password changed successfully.")
