from django.contrib.auth import get_user_model
from rest_framework.permissions import BasePermission


class CanUpdatePrice(BasePermission):

    def has_permission(self, request, view):
        User = get_user_model()  # Get the User model from Django's auth app

        # Ensure the user is authenticated and has the role 'Reception'
        user_role = request.user.role
        return user_role == 2  # 2 corresponds to the 'Reception' role
