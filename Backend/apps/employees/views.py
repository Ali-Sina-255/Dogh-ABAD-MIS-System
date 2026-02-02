from django.db.models import Q
from rest_framework import generics, permissions, viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Employee, TeacherLevel
from .serializers import (
    EmployeeSerializer,
    TeacherLevelSerializer,
    TeacherSalaryRule,
    TeacherSalaryRuleSerializer,
)


class TeacherLevelViewSet(viewsets.ModelViewSet):
    queryset = TeacherLevel.objects.all()
    serializer_class = TeacherLevelSerializer
    permission_classes = [IsAuthenticated]


class TeacherSalaryRuleViewSet(viewsets.ModelViewSet):
    queryset = TeacherSalaryRule.objects.select_related("teacher_level")
    serializer_class = TeacherSalaryRuleSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        teacher_level_id = self.request.data.get("teacher_level")
        serializer.save(teacher_level_id=teacher_level_id)


class EmployeeListCreateView(generics.ListCreateAPIView):
    serializer_class = EmployeeSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Employee.objects.all()

        role = self.request.query_params.get("role")
        search = self.request.query_params.get("search")

        if role is not None:
            queryset = queryset.filter(role=role)

        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) | Q(last_name__icontains=search)
            )

        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        return context


class EmployeeRetrieveUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        return context
