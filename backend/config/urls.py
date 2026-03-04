"""
NHISP URL Configuration
=======================
Central URL routing for the National Health Insurance Services Portal.
"""

from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include("config.api_router")),
]
