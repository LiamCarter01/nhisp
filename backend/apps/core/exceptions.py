"""
Custom Exception Handler
========================
Provides consistent API error responses across all endpoints.
"""

import logging

from rest_framework import status
from rest_framework.exceptions import APIException
from rest_framework.response import Response
from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler that wraps DRF's default handler
    to return consistent error response format.
    """
    response = exception_handler(exc, context)

    if response is not None:
        custom_response = {
            "success": False,
            "error": {
                "code": response.status_code,
                "message": _get_error_message(response),
                "details": response.data if isinstance(response.data, dict) else None,
            },
        }
        response.data = custom_response
    else:
        # Unhandled exception
        logger.exception("Unhandled exception: %s", exc)
        response = Response(
            {
                "success": False,
                "error": {
                    "code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                    "message": "An unexpected error occurred.",
                    "details": None,
                },
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return response


def _get_error_message(response):
    """Extract a human-readable error message from the response."""
    if isinstance(response.data, dict):
        if "detail" in response.data:
            return str(response.data["detail"])
        # Return first error message found
        for key, value in response.data.items():
            if isinstance(value, list) and value:
                return f"{key}: {value[0]}"
            elif isinstance(value, str):
                return f"{key}: {value}"
    elif isinstance(response.data, list) and response.data:
        return str(response.data[0])
    return "An error occurred."


class BusinessLogicError(APIException):
    """Exception raised when business logic validation fails."""

    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "A business logic error occurred."
    default_code = "business_logic_error"


class StateTransitionError(APIException):
    """Exception raised when an invalid state transition is attempted."""

    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Invalid state transition."
    default_code = "invalid_state_transition"


class InsufficientPermissionError(APIException):
    """Exception raised when user lacks required permissions."""

    status_code = status.HTTP_403_FORBIDDEN
    default_detail = "You do not have permission to perform this action."
    default_code = "insufficient_permission"
