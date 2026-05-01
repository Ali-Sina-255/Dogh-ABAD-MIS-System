from django.urls import path
from .views import (
    CategoryTypeDetailView,
    CategoryTypeListCreateView,
    LabTestApiView,
    LabTestDetailApiView,
    PatientDeleteView,
    PatientListView,
    PatientUpdateView,
    PharmaceuticalDetailView,
    PharmaceuticalListCreateView,
    PharmaceuticalListView,
    StockListView,
    TestTypeApiView,
    TestTypeDetailApiView,
    HospitalDashboardSummaryView,
    RecentPatientsView,
    RecentLabTestsView,
    RecentPharmaceuticalsView,
    MonthlyRevenueView,
    HospitalFinancialReportView,
)

urlpatterns = [
    # Existing URLs
    path("patients/", PatientListView.as_view(), name="patient-list"),
    path("lab/", LabTestApiView.as_view(), name="lab"),
    path("lab/<int:pk>/", LabTestDetailApiView.as_view(), name="lab-detail"),
    path("test-type/", TestTypeApiView.as_view(), name="lab"),
    path(
        "test-type/<int:pk>/", TestTypeDetailApiView.as_view(), name="test-type-detail"
    ),
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
    # Hospital Dashboard URLs - These will be prefixed with 'core/'
    path(
        "hospital/dashboard/summary/",
        HospitalDashboardSummaryView.as_view(),
        name="hospital-dashboard-summary",
    ),
    path(
        "hospital/patients/recent/",
        RecentPatientsView.as_view(),
        name="recent-patients",
    ),
    path(
        "hospital/lab-tests/recent/",
        RecentLabTestsView.as_view(),
        name="recent-lab-tests",
    ),
    path(
        "hospital/pharmaceuticals/recent/",
        RecentPharmaceuticalsView.as_view(),
        name="recent-pharmaceuticals",
    ),
    path(
        "hospital/revenue/monthly/",
        MonthlyRevenueView.as_view(),
        name="monthly-revenue",
    ),
    path(
        "hospital/financial-report/",
        HospitalFinancialReportView.as_view(),
        name="hospital-financial-report",
    ),
]
