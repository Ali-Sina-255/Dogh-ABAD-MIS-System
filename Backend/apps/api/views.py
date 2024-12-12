from apps.api import serializers as api_serializer
from django.contrib.auth.models import User
from django_filters.rest_framework.backends import DjangoFilterBackend
from rest_framework import generics, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.filters import SearchFilter
from rest_framework.permissions import AllowAny, IsAuthenticated

from .filters import BlogFilter
from .models import BlogPost, Category, PostCategory, Reception
from .serializers import (
    BlogPostSerializer,
    CategorySerializer,
    PostCategorySerializer,
    ReceptionSerializer,
)

# Set up a logger


class ReceptionCreateView(generics.ListCreateAPIView):
    serializer_class = ReceptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == user.Designer:
            # Designers can only see orders assigned to them
            return Reception.objects.filter(designer=user)
        elif user.role == user.Reception:
            # Receptionists can see orders that have either no prices or any other status
            return (
                Reception.objects.all()
            )  # Adjust this line to see all orders for receptionists
        else:
            # Admins or other roles can see all orders
            return Reception.objects.all()

    def perform_create(self, serializer):
        user = self.request.user

        if user.role == user.Designer:
            # Only Designers can create new orders
            serializer.save(designer=user)
        else:
            raise PermissionDenied("You do not have permission to create orders.")

    def perform_update(self, serializer):
        user = self.request.user

        if user.role == user.Reception:
            # Only Receptionists can update orders (like setting prices)
            serializer.save(updated_by=user)
        else:
            raise PermissionDenied("You do not have permission to update this order.")


from .permissions import CanUpdatePrice


class ReceptionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Reception.objects.all()
    serializer_class = ReceptionSerializer
    permission_classes = [IsAuthenticated, CanUpdatePrice]

    def perform_update(self, serializer):
        user = self.request.user
        serializer.save(updated_by=user)


class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    from rest_framework import status, viewsets


class BlogPostRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = BlogPost.objects.all()
    serializer_class = BlogPostSerializer
    lookup_field = "id"


class PostCategoryListCreate(generics.ListCreateAPIView):
    queryset = PostCategory.objects.all()
    serializer_class = PostCategorySerializer
    permission_classes = [AllowAny]


class PostCategoryDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = PostCategory.objects.all()
    serializer_class = PostCategorySerializer
    permission_classes = [AllowAny]


from rest_framework import viewsets

from .models import BlogPost, PostCategory
from .serializers import BlogPostSerializer, PostCategorySerializer


class PostCategoryViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = PostCategory.objects.all()
    serializer_class = PostCategorySerializer


class BlogPostViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = BlogPost.objects.all()
    serializer_class = BlogPostSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_class = BlogFilter
    search_fields = ["title", "description", "category__category_name"]