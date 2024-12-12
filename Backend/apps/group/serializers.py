from rest_framework import serializers

from .models import AttributeChoice, AttributeType, AttributeValue, Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "created_at", "updated_at"]


class AttributeChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttributeChoice
        fields = ["id", "name", "created_at", "updated_at"]


class AttributeTypeSerializer(serializers.ModelSerializer):

    # Use the nested serializer for better representation
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    attribute_type = serializers.PrimaryKeyRelatedField(
        queryset=AttributeChoice.objects.all(), allow_null=True
    )

    class Meta:
        model = AttributeType
        fields = [
            "id",
            "name",
            "category",
            "attribute_type",
            "created_at",
            "updated_at",
        ]


class AttributeValueSerializer(serializers.ModelSerializer):
    # attribute_value = serializers.PrimaryKeyRelatedField(
    #     queryset=AttributeType.objects.all()
    # )
    attribute = AttributeTypeSerializer()
    type = serializers.PrimaryKeyRelatedField(
        queryset=AttributeChoice.objects.all(), allow_null=True
    )

    class Meta:
        model = AttributeValue
        fields = [
            "id",
            "attribute",
            "type",
            "attribute_value",
            "created_at",
            "updated_at",
        ]
