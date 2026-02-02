from apps.api.models import BlogPost, Category, Order, PostCategory, Reception
from apps.users.serializers import UserSerializer
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import BlogPost, Category, PostCategory, Reception


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "created_at", "updated_at"]


class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ["id", "Customer_name", "order_name"]


class ReceptionSerializer(serializers.ModelSerializer):
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source="category"
    )
    designer = UserSerializer(read_only=True)
    designer_name = serializers.CharField(
        source="designer.get_full_name", read_only=True
    )
    deliveryDate = serializers.DateField(required=False)

    total_price = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False
    )
    receive_price = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False
    )
    reminder_price = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )  # Read-only, calculated

    class Meta:
        model = Reception
        fields = [
            "id",
            "designer",
            "designer_name",
            "customer_name",
            "order_name",
            "description",
            "total_price",
            "receive_price",
            "reminder_price",
            "category_id",
            "deliveryDate",
            "updated_at",
        ]

    def create(self, validated_data):
        # Automatically assign the logged-in user as the designer
        user = self.context["request"].user
        validated_data["designer"] = user

        total_price = validated_data.get("total_price", 0)  # Default to 0 if None
        receive_price = validated_data.get("receive_price", 0)  # Default to 0 if None

        validated_data["reminder_price"] = self.calculate_reminder_price(
            total_price, receive_price
        )

        return super().create(validated_data)

    def update(self, instance, validated_data):
        print("Validated data:", validated_data)  # Log the data for debugging

        # Don't allow the designer field to be updated by anyone other than the designer
        if "designer" in validated_data:
            raise PermissionDenied("You cannot change the designer for this reception.")

        # Update the fields: Allow updates to prices and delivery date
        total_price = validated_data.get("total_price", None)
        receive_price = validated_data.get("receive_price", None)
        delivery_date = validated_data.get("deliveryDate", None)

        if total_price is not None:
            instance.total_price = total_price
        if receive_price is not None:
            instance.receive_price = receive_price
        if delivery_date is not None:
            instance.deliveryDate = delivery_date

        # Recalculate reminder_price if either total_price or receive_price has changed
        instance.reminder_price = self.calculate_reminder_price(
            instance.total_price or 0, instance.receive_price or 0
        )

        instance.save()
        return instance

    def calculate_reminder_price(self, total_price, receive_price):

        total_price = total_price if total_price is not None else 0
        receive_price = receive_price if receive_price is not None else 0
        return max(0, total_price - receive_price)


class PostCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PostCategory
        fields = ["id", "category_name", "created_at"]


class BlogPostSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(queryset=PostCategory.objects.all())

    class Meta:
        model = BlogPost
        fields = ["id", "title", "category", "image", "description", "created_at"]

    def create(self, validated_data):
        # Save the blog post instance without triggering Celery task
        category = validated_data.pop("category")
        blog_post = BlogPost.objects.create(category=category, **validated_data)
        return blog_post

    def update(self, instance, validated_data):
        # Update the instance without triggering Celery task
        category = validated_data.pop("category", instance.category)
        instance.category = category
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
