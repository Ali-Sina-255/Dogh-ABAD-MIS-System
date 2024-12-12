from rest_framework import serializers

from .models import Images, Services


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
