from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AboutModelViewSet,
    CategoryViewSet,
    CustomerImageRetrieveUpdateDestroyView,
    CustomerImagesListCreateView,
    GalleryCategoryViewSet,
    GalleryViewSet,
    ImageUploadView,
    ServiceDelete,
    ServiceDetail,
    ServiceListCreate,
    ServiceUpdate,
    SubCategoryViewSet,
)

router = DefaultRouter()
router.register(
    "gallery-categories", GalleryCategoryViewSet, basename="gallerycategory"
)
router.register("galleries", GalleryViewSet, basename="gallery")
router.register("about", AboutModelViewSet, basename="about")

router.register("categories", CategoryViewSet)
router.register("subcategory", SubCategoryViewSet)


urlpatterns = [
    path("services/", ServiceListCreate.as_view(), name="service-list-create"),
    path("services/<int:pk>/", ServiceDetail.as_view(), name="service-detail"),
    path("services/<int:pk>/delete/", ServiceDelete.as_view(), name="service-delete"),
    path("services/<int:pk>/update/", ServiceUpdate.as_view(), name="service-update"),
    path("upload-image/", ImageUploadView.as_view(), name="upload-image"),
    path("upload-image/<int:pk>/", ImageUploadView.as_view(), name="update-image"),
    path(
        "common/upload-image/<int:pk>/", ImageUploadView.as_view(), name="delete-image"
    ),
    path("", include(router.urls)),
    path(
        "customer-images/",
        CustomerImagesListCreateView.as_view(),
        name="customer-images-list-create",
    ),
    path(
        "customer-images/<int:id>/",
        CustomerImageRetrieveUpdateDestroyView.as_view(),
        name="customer-image-retrieve-update-destroy",
    ),
]
