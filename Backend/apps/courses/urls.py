from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views
from .views import (
    BookViewSet,
    CardViewSet,
    CertificateViewSet,
    EnrollmentMonthlyDashboardViewSet,
    EnrollmentPaymentViewSet,
    EnrollmentStatusDashboardAPIView,
    EnrollmentViewSet,
    StudentClassesViewSet,
    StudentViewSet,
)

router = DefaultRouter()
router.register("books", BookViewSet)

router.register("enrollments", EnrollmentViewSet)
router.register("cards", CardViewSet, basename="cards")
router.register("enrollments", EnrollmentViewSet, basename="enrollments")
router.register("certificates", CertificateViewSet)
router.register(
    "enrollment-payments", EnrollmentPaymentViewSet, basename="enrollment-payment"
)
router.register("student-classes", StudentClassesViewSet, basename="student-classes")
router.register("students", StudentViewSet, basename="student")
router.register(
    "monthly-dashboard",
    EnrollmentMonthlyDashboardViewSet,
    basename="monthly-dashboard",
)

router.register("re-enrollments", views.ReEnrollmentViewSet, basename="re-enrollment")
urlpatterns = [
    path("", include(router.urls)),
    path(
        "dashboard/enrollment-status/",
        EnrollmentStatusDashboardAPIView.as_view(),
        name="dashboard-enrollment-status",
    ),
    path("dashboard/summary/", views.dashboard_summary),
    path("dashboard/recent-enrollments/", views.recent_enrollments),
    path("dashboard/monthly-revenue/", views.monthly_revenue),
    path("dashboard/enrollment-status/", views.enrollment_status),
    # path("check-student/", views.check_student, name="check-student"),
    path(
        "student-classes/<int:class_id>/enroll/",
        views.enroll_student,
        name="enroll_student",
    ),
    path(
        "monthly_fee/",
        views.monthly_fee,
    ),
    path(
        "student-classes/<int:class_id>/enroll/",
        views.enroll_student,
    ),
    path(
        "student-classes/<int:class_id>/eligible-students/",
        views.eligible_students,
        name="eligible_students",
    ),
    path("students/search/", views.StudentSearchAPIView.as_view()),
    path("student-classes/<int:class_id>/details/", views.ClassDetailView.as_view()),
    path(
        "teachers/<int:teacher_id>/classes/",
        views.TeacherClassesView.as_view(),
        name="teacher-classes",
    ),
]
