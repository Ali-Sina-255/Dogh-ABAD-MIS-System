from django.core.exceptions import ValidationError
from django.db import transaction
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User, UserProfile
from django.contrib.auth.hashers import make_password



class CreateUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "email",
            "phone_number",
            "role",
            "password",
            "password_confirm",
        ]

    def validate(self, data):
        # Ensure passwords match
        if data["password"] != data["password_confirm"]:
            raise ValidationError("Passwords must match.")

        # Ensure the role is valid
        role = data.get("role")
        if role not in dict(User.ROLE_CHOICES):
            raise ValidationError("Invalid role.")

        return data

    def create(self, validated_data):
        """Create a new user with encrypted password."""
        try:
            # Remove the password_confirm field before creating the user
            validated_data.pop("password_confirm", None)

            with transaction.atomic():  # Ensure atomicity
                password = validated_data.pop("password", None)
                user = User.objects.create(**validated_data)
                user.set_password(password)  # Securely set the password
                user.save()
                return user
        except Exception as e:
            raise ValidationError(f"Error creating user: {e}")


# Serializer for User (standard user details)
class UserSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source="get_role", read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "role",
            "role_display",
            "phone_number",
            "is_admin",
            "is_staff",
            "is_active",
            "is_superadmin",
        ]




class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["email"] = user.email
        token["first_name"] = user.first_name
        token["role"] = (user.role,)
        token["is_admin"] = user.is_admin
        try:
            user_profile = UserProfile.objects.get(user=user)
            token["profile_pic"] = (
                user_profile.profile_pic.url if user_profile.profile_pic else None
            )
        except UserProfile.DoesNotExist:
            token["profile_pic"] = None

        return token


from apps.users.models import UserProfile
from django.core.exceptions import ValidationError
from django.core.files.storage import default_storage
from rest_framework import serializers

from .models import UserProfile


class UserProfileSerializer(serializers.ModelSerializer):

    user_email = serializers.CharField(source="user.email", read_only=True)
    profile_pic = serializers.ImageField(
        required=False
    )  # Make profile_pic optional for updates

    class Meta:
        model = UserProfile
        fields = [
            "id",
            "user_email",
            "profile_pic",
            "address",
            "created_at",
            "updated_at",
        ]

    def update(self, instance, validated_data):

        profile_pic = validated_data.get("profile_pic", None)
        address = validated_data.get("address", None)

    
        if profile_pic:
           
            if profile_pic.size > 5 * 1024 * 1024:  # 5 MB 
                raise ValidationError(
                    "Profile picture is too large. Maximum size is 5MB."
                )
            if instance.profile_pic and default_storage.exists(
                instance.profile_pic.name
            ):
                default_storage.delete(instance.profile_pic.name)

            # Update the profile_pic field
            instance.profile_pic = profile_pic

        # Handle address update if it exists in the request
        if address:
            instance.address = address

        instance.save()
        return instance

class UpdateUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    password_confirm = serializers.CharField(
        write_only=True, required=False, allow_blank=True
    )

    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "email",
            "phone_number",
            "role",
            "password",
            "password_confirm",
        ]

    def validate(self, data):
        # Ensure passwords match if both are provided
        if "password" in data and data["password"] != data.get("password_confirm"):
            raise ValidationError("Passwords must match.")
        return data

    def update(self, instance, validated_data):
        # Remove password_confirm field if it exists
        validated_data.pop("password_confirm", None)

        password = validated_data.pop("password", None)
        if password:
            instance.set_password(password)

        # Update the rest of the fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance
