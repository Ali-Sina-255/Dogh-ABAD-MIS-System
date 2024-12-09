from rest_framework.permissions import BasePermission


class IsReception(BasePermission):
    def has_permission(self, request, view):
        role = request.user.role
        return role == 2


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        role = request.user.role
        return role == 0
