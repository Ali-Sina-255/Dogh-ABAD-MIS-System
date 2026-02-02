from profile import Profile

from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.files.storage import default_storage
from django.db import transaction
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import ChatMassage, Contact, User, UserProfile


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
            "is_free",
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
        token["is_active"] = user.is_active
        token["phone_number"] = user.phone_number
        try:
            user_profile = UserProfile.objects.get(user=user)
            token["profile_pic"] = (
                user_profile.profile_pic.url if user_profile.profile_pic else None
            )
        except UserProfile.DoesNotExist:
            token["profile_pic"] = None

        return token


class UpdateUserSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)
    old_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "email",
            "phone_number",
            "old_password",
            "password",
            "confirm_password",
        ]

    def validate(self, data):
        password = data.get("password")
        confirm_password = data.get("confirm_password")
        old_password = data.get("old_password")

        # Get the current user
        user = self.context["request"].user

        # Check if old password is correct
        if old_password:
            user = authenticate(email=user.email, password=old_password)
            if not user:
                raise ValidationError(
                    {"old_password": "The old password is incorrect."}
                )

        # Check if password and confirm password match
        if password and confirm_password and password != confirm_password:
            raise ValidationError(
                {"confirm_password": "Password and Confirm password do not match."}
            )

        # Validate the new password (optional, you can add more validation rules here)
        if password:
            try:
                validate_password(
                    password, user
                )  # This will validate the new password against the system's rules
            except ValidationError as e:
                raise ValidationError({"password": list(e.messages)})

        return data

    def update(self, instance, validated_data):
        password = validated_data.get("password", None)
        if password:
            instance.set_password(password)  # Securely set the new password
            validated_data.pop(
                "confirm_password", None
            )  # Don't save confirm_password in the instance
            validated_data.pop(
                "old_password", None
            )  # Don't save old_password in the instance

        # Update email and phone_number
        instance.email = validated_data.get("email", instance.email)
        instance.phone_number = validated_data.get(
            "phone_number", instance.phone_number
        )

        instance.save()
        return instance


class ProfilePicUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ["profile_pic"]

    def update(self, instance, validated_data):
        # Update only the profile_pic field
        profile_pic = validated_data.get("profile_pic", None)
        if profile_pic:
            instance.profile_pic = profile_pic
            instance.save()
        return instance


class PasswordChangeSerializer(serializers.Serializer):
    otp = serializers.CharField(required=True)
    uuidb64 = serializers.CharField(required=True)
    password = serializers.CharField(required=True)


class ProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile  # Your model name
        fields = [
            "id",
            "user",
            "full_name",
            "profile_pic",
            "created_at",
            "updated_at",
        ]

    def get_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"


class MassageSerializer(serializers.ModelSerializer):
    sender_profile = ProfileSerializer(read_only=True)
    receiver_profile = ProfileSerializer(read_only=True)

    class Meta:
        model = ChatMassage
        fields = [
            "id",
            "sender",
            "sender_profile",
            "receiver",
            "receiver_profile",
            "message",
            "is_read",
            "date",
        ]


class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ['id', 'email', 'name', 'content']
        
class UserFreeStatus(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['is_free']