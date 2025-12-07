from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CategoryTypeDetailView,
    CategoryTypeListCreateView,
    DailyExpensePharmacyViewSet,
    DailyExpenseViewSet,
    LabTestApiView,
    PatientDeleteView,
    PatientListView,
    PatientUpdateView,
    PharmaceuticalDetailView,
    PharmaceuticalListCreateView,
    PharmaceuticalListView,
    StaffViewSet,
    StockListView,
    TakenDailyExpenseViewSet,
    TestTypeApiView,
)

router = DefaultRouter()
router.register("daily-expenses", DailyExpenseViewSet)
router.register("taken-expenses", TakenDailyExpenseViewSet)
router.register("daily-expenses-pharmacy", DailyExpensePharmacyViewSet)
router.register("staff", StaffViewSet, basename="staff")
urlpatterns = [
    path("", include(router.urls)),
    path("patients/", PatientListView.as_view(), name="patient-list"),
    path("lab/", LabTestApiView.as_view(), name="lab"),
    path("test-type/", TestTypeApiView.as_view(), name="lab"),
    path("patients/<int:pk>/", PatientDeleteView.as_view(), name="patient-delete"),
    path(
        "patients/<int:pk>/update/", PatientUpdateView.as_view(), name="patient-update"
    ),
    path("stocks/", StockListView.as_view(), name="stock-list"),
    path("stocks/<int:pk>/", StockListView.as_view(), name="stock-detail"),
    path(
        "category-types/",
        CategoryTypeListCreateView.as_view(),
        name="category-type-list-create",
    ),
    path(
        "category-types/<int:pk>/",
        CategoryTypeDetailView.as_view(),
        name="category-type-detail",
    ),
    path(
        "pharmaceuticals/",
        PharmaceuticalListCreateView.as_view(),
        name="pharmaceutical-list-create",
    ),
    path(
        "pharmaceuticals/<int:pk>/",
        PharmaceuticalDetailView.as_view(),
        name="pharmaceutical-detail",
    ),
    path(
        "pharmaceuticals/list/",
        PharmaceuticalListView.as_view(),
        name="pharmaceutical-list",
    ),
]
