from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views
from .views import EmployeeListCreateView, EmployeeRetrieveUpdateDeleteView

router = DefaultRouter()
router.register("teacher-levels", views.TeacherLevelViewSet)
router.register("teacher-salary-rules", views.TeacherSalaryRuleViewSet)
urlpatterns = [
    path("employees/", EmployeeListCreateView.as_view(), name="employee-list-create"),
    path(
        "employees/<int:pk>/",
        EmployeeRetrieveUpdateDeleteView.as_view(),
        name="employee-detail",
    ),
    path("", include(router.urls)),
]
