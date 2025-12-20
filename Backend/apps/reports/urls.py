from django.urls import path

from . import views

urlpatterns = [
    path("api/v1/reports/", views.ReportAPIView.as_view(), name="reports"),
]
