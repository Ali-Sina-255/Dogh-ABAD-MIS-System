from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import BasePermission


class IsDesigner(BasePermission):

    def has_permission(self, request, view):
        role = request.user.role
        return role == 1


class IsReception(BasePermission):
    def has_permission(self, request, view):
        role = request.user.role
        return role == 2


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        role = request.user.role
        return role == 0
