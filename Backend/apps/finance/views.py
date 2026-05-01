# Create your views here.

from decimal import Decimal

from apps.courses.models import Certificate, Enrollment
from apps.finance.models import DailyExpense, Payroll, SalaryPayment
from django.db.models import Sum
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import DailyExpense, Fine, Payroll, SalaryPayment
from .serializers import (
    DailyExpenseSerializer,
    FineSerializer,
    PayrollSerializer,
    SalaryPaymentSerializer,
    TeacherSalarySummarySerializer,
)


# -------------------------
# Daily Expense
# -------------------------
class DailyExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = DailyExpenseSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "id"
    queryset = DailyExpense.objects.all().order_by("-jalali_month")  # Add this

    def get_queryset(self):
        queryset = super().get_queryset()  #
        jalali_month = self.request.query_params.get("jalali_month")
        if jalali_month:
            queryset = queryset.filter(jalali_month=jalali_month)
        return queryset


# -------------------------
# Payroll
# -------------------------
class PayrollViewSet(viewsets.ModelViewSet):
    queryset = Payroll.objects.select_related("employee")
    serializer_class = PayrollSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "id"


# -------------------------
# Salary Payment
# -------------------------


class SalaryPaymentViewSet(viewsets.ModelViewSet):
    serializer_class = SalaryPaymentSerializer
    queryset = SalaryPayment.objects.all().order_by("-paid_at")
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "id"

    def get_queryset(self):
        qs = super().get_queryset()
        payroll_id = self.request.query_params.get("payroll")
        if payroll_id:
            try:
                payroll_id = int(payroll_id)  # convert to integer
            except ValueError:
                return qs.none()
            qs = qs.filter(payroll_id=payroll_id)
        return qs


class TeacherSalaryViewSet(viewsets.ViewSet):
    """
    Endpoint to get payrolls and payment details for a single teacher
    """

    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=["get"], url_path="salary-summary")
    def salary_summary(self, request, pk=None):
        """
        GET /api/teacher-salary/<teacher_id>/salary-summary/
        """
        # Get all payrolls for this teacher
        payrolls = Payroll.objects.filter(employee_id=pk).order_by("-year", "-month")

        # Serialize payrolls with payment details
        serializer = TeacherSalarySummarySerializer(payrolls, many=True)

        # Calculate total paid across all payrolls
        total_paid = sum(item["total_paid"] for item in serializer.data)

        return Response(
            {"teacher_id": pk, "total_paid": total_paid, "payrolls": serializer.data}
        )


class FineViewSet(viewsets.ModelViewSet):
    queryset = Fine.objects.all().order_by("-created_at")
    serializer_class = FineSerializer
    permission_classes = [permissions.IsAuthenticated]


class FullReportAPIView(APIView):
    def get(self, request, *args, **kwargs):
        month = request.query_params.get("jalali_month")

        # ---------------- Students ----------------
        enrollments = Enrollment.objects.all()
        if month:
            enrollments = enrollments.filter(jalali_month=month)

        enrollments = enrollments.select_related(
            "student_class", "card"
        ).prefetch_related("books", "payments", "certificates")

        total_student_income = Decimal("0.00")
        total_student_remaining = Decimal("0.00")

        for e in enrollments:
            total_student_income += e.total_fee or Decimal("0.00")
            total_student_remaining += e.re_amount or Decimal("0.00")

        # ---------------- Certificates ----------------
        certificates = Certificate.objects.all()
        if month:
            certificates = certificates.filter(date_issued__month=month)
        total_certificate_income = certificates.aggregate(total=Sum("price"))[
            "total"
        ] or Decimal("0.00")

        # ---------------- Fines ----------------
        fines = Fine.objects.all()
        if month:
            fines = fines.filter(jalali_month=month)
        total_fine_income = fines.aggregate(total=Sum("amount_paid"))[
            "total"
        ] or Decimal("0.00")

        # ---------------- Teachers ----------------

        payrolls = SalaryPayment.objects.all()

        if month:
            payrolls = payrolls.filter(payroll__jalali_month=month)

        total_staff_salary = payrolls.aggregate(total=Sum("amount_paid"))[
            "total"
        ] or Decimal("0.00")
        # ---------------- Expenses ----------------
        expenses = DailyExpense.objects.all()
        if month:
            expenses = expenses.filter(jalali_month=month)
        total_expense = expenses.aggregate(total=Sum("amount"))["total"] or Decimal(
            "0.00"
        )

        expense_data = [
            {"name": e.name, "amount": e.amount, "date": e.created_at} for e in expenses
        ]

        # ---------------- Total Income ----------------
        total_income = (
            total_student_income + total_certificate_income + total_fine_income
        )

        # ---------------- Net Profit / Benefit ----------------
        net_profit = total_income - (total_staff_salary + total_expense)

        return Response(
            {
                "month": month,
                "total_student_income": total_student_income,
                "total_certificate_income": total_certificate_income,
                "total_fine_income": total_fine_income,
                "total_income": total_income,
                "total_student_remaining": total_student_remaining,
                "total_staff_salary": total_staff_salary,
                "total_expense": total_expense,
                "net_profit": net_profit,  # <-- This is your benefit
            }
        )


