"""
Provider Serializers
====================
"""

from rest_framework import serializers

from apps.providers.models import Provider


class ProviderSerializer(serializers.ModelSerializer):
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
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class ProviderListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Provider
        fields = [
            "id",
            "name",
            "license_number",
            "provider_type",
            "active",
            "city",
        ]
