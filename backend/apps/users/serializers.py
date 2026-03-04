"""
User Serializers
================
"""

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user details."""

    role = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "national_id",
            "phone_number",
            "date_of_birth",
            "address",
            "role",
            "is_active",
            "date_joined",
        ]
        read_only_fields = ["id", "date_joined", "role"]


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new users (registration)."""

    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "email",
            "first_name",
            "last_name",
            "national_id",
            "phone_number",
            "date_of_birth",
            "address",
            "password",
            "password_confirm",
        ]

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password_confirm"):
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        from apps.users.services.user_service import UserService

        return UserService.register_citizen(validated_data)


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile."""

    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "phone_number",
            "date_of_birth",
            "address",
        ]


class AdminUserCreateSerializer(serializers.ModelSerializer):
    """Serializer for admin to create users with specific roles."""

    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=["Citizen", "ClaimsOfficer", "Supervisor", "Admin"])

    class Meta:
        model = User
        fields = [
            "email",
            "first_name",
            "last_name",
            "national_id",
            "phone_number",
            "date_of_birth",
            "address",
            "password",
            "role",
        ]

    def create(self, validated_data):
        from apps.users.services.user_service import UserService

        role = validated_data.pop("role")
        return UserService.create_user_with_role(validated_data, role)


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change."""

    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value


class ProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile view."""

    role = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "national_id",
            "phone_number",
            "date_of_birth",
            "address",
            "role",
            "date_joined",
        ]
        read_only_fields = fields
