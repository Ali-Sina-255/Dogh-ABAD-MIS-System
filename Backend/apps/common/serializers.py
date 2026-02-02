from rest_framework import serializers

from .models import (
    AboutModel,
    Category,
    CustomerImages,
    Gallery,
    GalleryCategory,
    Images,
    Services,
    SubCategory,
)


class ServicesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Services
        fields = ["id", "title", "description", "image", "created_at"]


class ImagesSerializer(serializers.ModelSerializer):
    images = serializers.SerializerMethodField()

    class Meta:
        model = Images
        fields = ["id", "images"]

    def get_images(self, obj):
        request = self.context.get("request")
        if request is not None:
            return request.build_absolute_uri(obj.images.url)
        return obj.images.url


class GalleryCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = GalleryCategory
        fields = ["id", "name", "created_at", "updated_at"]


class GallerySerializer(serializers.ModelSerializer):
    class Meta:
        model = Gallery
        fields = ["id", "category", "image", "created_at", "updated_at"]


class AboutModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = AboutModel
        fields = ["id", "image", "created_at", "updated_at"]


class CustomerImagesSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerImages
        fields = ["id", "name", "image"]

    def update(self, instance, validated_data):
        instance.name = validated_data.get("name", instance.name)
        instance.image = validated_data.get("image", instance.image)
        instance.save()
        return instance


class SubCategorySerializer(serializers.ModelSerializer):

    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())

    class Meta:
        model = SubCategory
        fields = ["id", "name", "image", "created_at", "category"]


class CategorySerializer(serializers.ModelSerializer):
    subcategories = SubCategorySerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = ["id", "name", "description", "image", "created_at", "subcategories"]
        ref_name = "ApiCategory"


# class BenefitSerializer(serializers.ModelSerializer):
#     class Meta:
#         # model = .Benefits
#         fields = ["id", "title", "description"]
