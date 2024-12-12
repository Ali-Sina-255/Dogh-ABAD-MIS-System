from apps.api import views as api_views
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views
from .views import (
    BlogPostViewSet,
    CategoryDetailView,
    CategoryListCreateView,
    PostCategoryDetail,
    PostCategoryListCreate,
    PostCategoryViewSet,
    ReceptionCreateView,
    ReceptionDetailView,
)

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register("categories", PostCategoryViewSet, basename="post-category")
router.register("blog-posts", BlogPostViewSet, basename="blog-post")


urlpatterns = [
    path(
        "blog/", include(router.urls)
    ),  # Include all routes from the router under `/api/`
    path("receptions/", ReceptionCreateView.as_view(), name="reception-create"),
    path(
        "receptions/<int:pk>/", ReceptionDetailView.as_view(), name="reception-detail"
    ),
    path("categories/", CategoryListCreateView.as_view(), name="category-list-create"),
    path("categories/<int:pk>/", CategoryDetailView.as_view(), name="category-detail"),
    path(
        "api/post-categories/",
        PostCategoryListCreate.as_view(),
        name="post-category-list-create",
    ),
    path(
        "api/post-categories/<int:pk>/",
        PostCategoryDetail.as_view(),
        name="post-category-detail",
    ),
]
