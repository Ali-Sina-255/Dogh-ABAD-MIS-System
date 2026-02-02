from apps.users.tasks import (
    delete_image,
    log_create_category,
    log_create_gallery,
    log_create_gallery_task,
    log_delete_category,
    log_delete_gallery_task,
    log_update_gallery_task,
    process_service_creation,
    process_service_deletion,
    process_service_update,
    process_uploaded_image,
)
from django.http import JsonResponse
from rest_framework import generics, status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

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
from .serializers import (
    AboutModelSerializer,
    CategorySerializer,
    CustomerImagesSerializer,
    GalleryCategorySerializer,
    GallerySerializer,
    ImagesSerializer,
    ServicesSerializer,
    SubCategorySerializer,
)


# View for listing and creating services
class ServiceListCreate(generics.ListCreateAPIView):
    queryset = Services.objects.all()
    serializer_class = ServicesSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        service = serializer.save()
        process_service_creation.delay(service.id)


# View for retrieving details of a single service
class ServiceDetail(generics.RetrieveAPIView):
    queryset = Services.objects.all()
    serializer_class = ServicesSerializer
    permission_classes = [AllowAny]


# View for deleting a single service
class ServiceDelete(generics.DestroyAPIView):
    queryset = Services.objects.all()
    serializer_class = ServicesSerializer
    permission_classes = [AllowAny]

    def perform_destroy(self, instance):
        process_service_deletion.delay(instance.id)
        super().perform_destroy(instance)


# View for updating a single service
class ServiceUpdate(generics.UpdateAPIView):
    queryset = Services.objects.all()
    serializer_class = ServicesSerializer
    permission_classes = [AllowAny]

    # Optionally override the `update` method to add more custom logic
    def update(self, request, *args, **kwargs):
        instance = self.get_object()  # Get the service instance to be updated
        serializer = self.get_serializer(instance, data=request.data, partial=True)

        # Check if the serializer is valid
        serializer.is_valid(raise_exception=True)

        # Perform the update
        self.perform_update(serializer)

        # After update, trigger the Celery task in the background
        process_service_update.delay(
            instance.id
        )  # This triggers the Celery task asynchronously

        return Response(serializer.data)

    def perform_update(self, serializer):
        serializer.save()


class ImageUploadView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk=None):
        """Handle GET request to retrieve all images or a specific image."""
        if pk:
            try:
                image = Images.objects.get(pk=pk)
            except Images.DoesNotExist:
                return Response(
                    {"error": "Image not found"}, status=status.HTTP_404_NOT_FOUND
                )
            serializer = ImagesSerializer(image)
            return Response(serializer.data, status=status.HTTP_200_OK)

        images = Images.objects.all()
        serializer = ImagesSerializer(images, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Handle POST request to upload a new image."""
        if "image" not in request.data:
            return Response(
                {"error": "No image provided"}, status=status.HTTP_400_BAD_REQUEST
            )

        image = request.data["image"]
        new_image = Images.objects.create(images=image)

        process_uploaded_image.delay(new_image.images.url)

        return Response(
            {
                "id": new_image.id,
                "image": new_image.images.url,  # Ensure this field is correct
            },
            status=status.HTTP_201_CREATED,
        )

    def put(self, request, pk):
        """Handle PUT request to update an image."""
        try:
            image_instance = Images.objects.get(pk=pk)
        except Images.DoesNotExist:
            return Response(
                {"error": "Image not found"}, status=status.HTTP_404_NOT_FOUND
            )

        image = request.data.get("image")
        if image:
            image_instance.images = image
            image_instance.save()

            process_uploaded_image.delay(image_instance.images.url)

        serializer = ImagesSerializer(image_instance, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        try:
            image = Images.objects.get(id=pk)
        except Images.DoesNotExist:
            return Response(
                {"error": "Image not found"}, status=status.HTTP_404_NOT_FOUND
            )

        result = delete_image.delay(pk)

        if result:
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response(
                {"error": "Image not found to delete"},
                status=status.HTTP_404_NOT_FOUND,
            )


class GalleryCategoryViewSet(viewsets.ModelViewSet):
    queryset = GalleryCategory.objects.all()
    serializer_class = GalleryCategorySerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        category = serializer.save()
        log_create_category.delay(category.id)

    def perform_update(self, serializer):
        category = serializer.save()
        log_create_category.delay(category.id)

    def perform_destroy(self, instance):
        category_id = instance.id
        instance.delete()
        log_delete_category.delay(category_id)


class GalleryViewSet(viewsets.ModelViewSet):
    queryset = Gallery.objects.all()
    serializer_class = GallerySerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        gallery = serializer.save()
        log_create_gallery_task.delay(gallery.id)  # Trigger Celery task asynchronously
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        gallery = serializer.save()  # Update the gallery instance
        log_update_gallery_task.delay(gallery.id)  # Trigger Celery task asynchronously
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        gallery_id = instance.id
        self.perform_destroy(instance)
        log_delete_gallery_task.delay(gallery_id)  # Trigger Celery task asynchronously
        return Response(status=status.HTTP_204_NO_CONTENT)


class AboutModelViewSet(viewsets.ModelViewSet):

    queryset = AboutModel.objects.all()
    serializer_class = AboutModelSerializer
    permission_classes = [AllowAny]


class CustomerImagesListCreateView(generics.ListCreateAPIView):
    queryset = CustomerImages.objects.all()
    serializer_class = CustomerImagesSerializer
    permission_classes = [AllowAny]

class CustomerImageRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CustomerImages.objects.all()
    serializer_class = CustomerImagesSerializer
    lookup_field = "id"
    permission_classes = [AllowAny]


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


from rest_framework import viewsets
from apps.common.models import SubCategory
from apps.common.serializers import SubCategorySerializer
from rest_framework.permissions import AllowAny


class SubCategoryViewSet(viewsets.ModelViewSet):
    queryset = SubCategory.objects.all()
    serializer_class = SubCategorySerializer
    permission_classes = [AllowAny]

    # If you have a custom create method, ensure it processes the 'category' field correctly
    def create(self, request, *args, **kwargs):
        # Ensure category ID is being passed and not the whole object
        category_id = request.data.get("category")

        if category_id:
            # You can manually ensure category ID is processed correctly
            try:
                category = Category.objects.get(id=category_id)
                request.data["category"] = category.id  # Replace with just the ID
            except Category.DoesNotExist:
                return Response(
                    {"error": "Category not found"}, status=status.HTTP_400_BAD_REQUEST
                )

        return super().create(request, *args, **kwargs)
