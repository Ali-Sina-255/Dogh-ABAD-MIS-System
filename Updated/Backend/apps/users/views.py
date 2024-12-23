from apps.users.models import UserProfile
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.contrib.sites.shortcuts import get_current_site
from django.db import transaction
from django.http import HttpResponse
from django.shortcuts import redirect
from django.utils.http import urlsafe_base64_decode
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.permissions import AllowAny, BasePermission, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User, UserProfile
from .serializers import (
    CreateUserSerializer,
    MyTokenObtainPairSerializer,
    UpdateUserSerializer,
    UserProfileSerializer,
    UserSerializer,
)
from .utils import send_verification_email

# Get the custom User model
User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [
        AllowAny
    ]  # Change this if you want to require authentication globally

    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated])
    def create_user(self, request):
        serializer = CreateUserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {
                    "message": "User created successfully",
                    "user": UserSerializer(user).data,
                },
                status=201,
            )
        return Response(serializer.errors, status=400)


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


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


# views.py


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Retrieve the user profile for the logged-in user
        try:
            profile = UserProfile.objects.get(user=request.user)
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            return Response(
                {"detail": "User profile not found."}, status=status.HTTP_404_NOT_FOUND
            )

    def put(self, request):
        try:
            # Get the user profile related to the authenticated user
            profile = UserProfile.objects.get(user=request.user)
        except UserProfile.DoesNotExist:
            return Response(
                {"detail": "User profile not found."}, status=status.HTTP_404_NOT_FOUND
            )

        # Update profile data using the serializer with the request data (partial=True allows partial updates)
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)

        if serializer.is_valid():
            # Save the updated profile to the database
            serializer.save()
            return Response(
                serializer.data, status=status.HTTP_200_OK
            )  # Return updated profile data with a 200 OK status

        return Response(
            serializer.errors, status=status.HTTP_400_BAD_REQUEST
        )  # Return validation errors if any


class CreateUserView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = CreateUserSerializer

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                with transaction.atomic():
                    user = serializer.save()
                    user.is_active = False
                    user.save()
                    send_verification_email(request, user)
                    return Response(
                        {
                            "message": "User created successfully. Please check your email to verify your account.",
                            "roles": dict(User.ROLE_CHOICES),
                        },
                        status=status.HTTP_201_CREATED,
                    )
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_ChoicINTERNAL_SERVER_ERROR
            )


# Function-based view for account activation
def activate_account(request, uidb64, token):
    try:
        # Decode the UID
        uid = urlsafe_base64_decode(uidb64).decode()
        user = get_user_model().objects.get(pk=uid)

        # Validate the token
        if default_token_generator.check_token(user, token):
            # Token is valid, activate the user
            user.is_active = True
            user.save()

            # Optionally log the user in or redirect
            # login(request, user)
            return redirect("token")  # Redirect to the login page

        else:
            return HttpResponse("Invalid activation link", status=400)

    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return HttpResponse("Invalid activation link", status=400)


class RoleChoicesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Return the role choices from the User model
        roles = dict(User.ROLE_CHOICES)
        return Response(roles)


class UpdateUserView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UpdateUserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):

        user = self.request.user
        try:
            if user.is_staff:  # Admin can update any user
                return User.objects.get(pk=self.kwargs["pk"])
            elif (
                user.id == self.kwargs["pk"]
            ):  # Regular user can only update their own info
                return user
            else:
                raise PermissionDenied(
                    "You do not have permission to update this user."
                )
        except User.DoesNotExist:
            raise NotFound("User not found")

    def patch(self, request, *args, **kwargs):
        """Handle patch request for partial updates."""
        return self.update(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)


class DeleteUserView(generics.DestroyAPIView):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]

    def get_object(self):
        user = self.request.user
        if user.is_staff:  # Admin can delete any user
            return User.objects.get(pk=self.kwargs["pk"])
        else:  # Regular users can only delete their own account
            return user

    def delete(self, request, *args, **kwargs):
        user = self.get_object()

        if (
            user == request.user or request.user.is_staff
        ):  # Check if the user is deleting themselves or is an admin
            user.delete()
            return Response(
                {"message": "User deleted successfully."},
                status=status.HTTP_204_NO_CONTENT,
            )
        else:
            return Response(
                {"error": "You are not authorized to delete this user."},
                status=status.HTTP_403_FORBIDDEN,
            )
