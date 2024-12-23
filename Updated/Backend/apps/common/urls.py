from django.urls import path

from .views import (
    ImageUploadView,
    ServiceDelete,
    ServiceDetail,
    ServiceListCreate,
    ServiceUpdate,
)

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
]
