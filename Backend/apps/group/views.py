from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AttributeType, AttributeValue, Category
from .serializers import (
    AttributeTypeSerializer,
    AttributeValueSerializer,
    CategorySerializer,
)


class CategoryListCreateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

    def post(self, request):

        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CategoryDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):

        try:
            category = Category.objects.get(pk=pk)
        except Category.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = CategorySerializer(category)
        return Response(serializer.data)

    def put(self, request, pk):

        try:
            category = Category.objects.get(pk=pk)
        except Category.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = CategorySerializer(category, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):

        try:
            category = Category.objects.get(pk=pk)
        except Category.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        category.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AttributeValueListCreateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        attribute_values = AttributeValue.objects.all()
        serializer = AttributeValueSerializer(attribute_values, many=True)
        return Response(serializer.data)

    def post(self, request):

        serializer = AttributeValueSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AttributeValueDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):

        try:
            attribute_value = AttributeValue.objects.get(pk=pk)
        except AttributeValue.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = AttributeValueSerializer(attribute_value)
        return Response(serializer.data)

    def put(self, request, pk):

        try:
            attribute_value = AttributeValue.objects.get(pk=pk)
        except AttributeValue.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = AttributeValueSerializer(attribute_value, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):

        try:
            attribute_value = AttributeValue.objects.get(pk=pk)
        except AttributeValue.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        attribute_value.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AttributeChoice
from .serializers import AttributeChoiceSerializer


class AttributeChoiceListCreateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        attribute_choices = AttributeChoice.objects.all()
        serializer = AttributeChoiceSerializer(attribute_choices, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = AttributeChoiceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AttributeChoiceDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            attribute_choice = AttributeChoice.objects.get(pk=pk)
            serializer = AttributeChoiceSerializer(attribute_choice)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except AttributeChoice.DoesNotExist:
            return Response(
                {"error": "AttributeChoice not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

    def put(self, request, pk):
        try:
            attribute_choice = AttributeChoice.objects.get(pk=pk)
            serializer = AttributeChoiceSerializer(attribute_choice, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except AttributeChoice.DoesNotExist:
            return Response(
                {"error": "AttributeChoice not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

    def delete(self, request, pk):
        try:
            attribute_choice = AttributeChoice.objects.get(pk=pk)
            attribute_choice.delete()
            return Response(
                {"message": "AttributeChoice deleted."},
                status=status.HTTP_204_NO_CONTENT,
            )
        except AttributeChoice.DoesNotExist:
            return Response(
                {"error": "AttributeChoice not found."},
                status=status.HTTP_404_NOT_FOUND,
            )


from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AttributeType
from .serializers import AttributeTypeSerializer


class AttributeTypeListCreateView(generics.ListCreateAPIView):
    queryset = AttributeType.objects.all()
    serializer_class = AttributeTypeSerializer
    permission_classes = [AllowAny]


class AttributeTypeListCreateView(generics.ListCreateAPIView):

    queryset = AttributeType.objects.all()
    serializer_class = AttributeTypeSerializer
    permission_classes = [AllowAny]


class AttributeTypeDetailView(generics.RetrieveUpdateDestroyAPIView):

    queryset = AttributeType.objects.all()
    serializer_class = AttributeTypeSerializer
    permission_classes = [AllowAny]  # Adju


class CategoryAttributeView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def get(self, request, category_id):
        try:
            # Get the category object by ID
            category = Category.objects.get(id=category_id)
        except Category.DoesNotExist:
            return Response(
                {"error": "Category not found"}, status=status.HTTP_404_NOT_FOUND
            )

        attribute_types = AttributeType.objects.filter(category=category)
        attribute_values = AttributeValue.objects.filter(attribute__category=category)

        # Serialize the data
        attribute_type_serializer = AttributeTypeSerializer(attribute_types, many=True)
        attribute_value_serializer = AttributeValueSerializer(
            attribute_values, many=True
        )

        response_data = {
            "attribute_types": attribute_type_serializer.data,
            "attribute_values": attribute_value_serializer.data,
        }

        return Response(response_data, status=status.HTTP_200_OK)
