from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    DailyExpenseViewSet,
    FineViewSet,
    FullReportAPIView,
    PayrollViewSet,
    SalaryPaymentViewSet,
    TeacherSalaryViewSet,
)

router = DefaultRouter()
router.register("expenses", DailyExpenseViewSet)
router.register("payrolls", PayrollViewSet)
router.register("salary-payments", SalaryPaymentViewSet, basename="salary-payment")
router.register("teacher-salary", TeacherSalaryViewSet, basename="teacher-salary")
router.register("fines", FineViewSet, basename="fine")

urlpatterns = [
    path("", include(router.urls)),
    path("reports/full/", FullReportAPIView.as_view(), name="full-report"),
]
