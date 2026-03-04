"""
Response Helpers
================
Standardized API response format helpers.
"""

from rest_framework import status
from rest_framework.response import Response


def success_response(data=None, message="Success", status_code=status.HTTP_200_OK):
    """Return a standardized success response."""
    payload = {
        "success": True,
        "message": message,
        "data": data,
    }
    return Response(payload, status=status_code)


def created_response(data=None, message="Resource created successfully"):
    """Return a standardized 201 created response."""
    return success_response(data=data, message=message, status_code=status.HTTP_201_CREATED)


def no_content_response():
    """Return a 204 no content response."""
    return Response(status=status.HTTP_204_NO_CONTENT)


def error_response(message="An error occurred", status_code=status.HTTP_400_BAD_REQUEST, details=None):
    """Return a standardized error response."""
    payload = {
        "success": False,
        "error": {
            "code": status_code,
            "message": message,
            "details": details,
        },
    }
    return Response(payload, status=status_code)
