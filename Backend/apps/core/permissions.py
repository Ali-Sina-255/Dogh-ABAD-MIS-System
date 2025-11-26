# apps/core/permissions.py
from rest_framework.permissions import BasePermission


class BlockReceptionForWriteActions(BasePermission):
    """
    Allow all GET requests.
    Block POST, PUT, DELETE for users with role = Reception.
    """

    def has_permission(self, request, view):
        # Allow all GET requests
        if request.method in ["GET", "HEAD", "OPTIONS"]:
            return True

        # If the user is anonymous, deny write access
        if not request.user or not hasattr(request.user, "role"):
            return False

        # Deny write access for Reception role
        if request.user.role == 2:  # 2 = Reception
            return False

        return True
