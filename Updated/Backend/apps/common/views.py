from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import Services
from .serializers import ServicesSerializer


# View for listing and creating services
class ServiceListCreate(generics.ListCreateAPIView):
    queryset = Services.objects.all()
    serializer_class = ServicesSerializer
    permission_classes = [AllowAny]


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


from rest_framework.response import Response


# View for updating a single service
class ServiceUpdate(generics.UpdateAPIView):
    queryset = Services.objects.all()
    serializer_class = ServicesSerializer
    permission_classes = [AllowAny]  # Consider tightening permissions as needed

    # Optionally override the `update` method to add more custom logic
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)


from django.http import JsonResponse
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Images
from .serializers import ImagesSerializer


class ImageUploadView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # Retrieve and return images
        images = Images.objects.all()
        serializer = ImagesSerializer(images, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        if "image" not in request.data:
            return Response(
                {"error": "No image provided"}, status=status.HTTP_400_BAD_REQUEST
            )

        image = request.data["image"]
        new_image = Images.objects.create(images=image)

        return Response(
            {
                "id": new_image.id,
                "image": new_image.images.url,  # Ensure this field is correct
            },
            status=status.HTTP_201_CREATED,
        )

    def put(self, request, pk):
        # Retrieve the image object by its ID
        try:
            image = Images.objects.get(id=pk)
        except Images.DoesNotExist:
            return Response(
                {"error": "Image not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Check if a new image is provided in the request
        if "image" not in request.data:
            return Response(
                {"error": "No image provided to update"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Update the image field with the new image data
        image.images = request.data["image"]
        image.save()

        return Response(
            {
                "id": image.id,
                "image": image.images.url,  # Ensure this field is correct
            },
            status=status.HTTP_200_OK,
        )

    def delete(self, request, pk):
        try:
            image = Images.objects.get(pk=pk)
            image.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Images.DoesNotExist:
            return Response(
                {"error": "Image not found"}, status=status.HTTP_404_NOT_FOUND
            )


class ImageDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [AllowAny]  # Ensure the user is authenticated
    queryset = Images.objects.all()
    serializer_class = ImagesSerializer

    def put(self, request, *args, **kwargs):
        print("PUT request received")
        return super().put(request, *args, **kwargs)
