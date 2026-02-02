from decimal import Decimal

from apps.courses.jalali_date import get_current_jalali_month
from apps.courses.models import Enrollment, EnrollmentPayment
from apps.finance.models import DailyExpense, Fine, Payroll, SalaryPayment
from django.db import models
from django.db.models import Sum
from django.utils import timezone
from rest_framework import serializers

from .models import DailyExpense, Payroll, SalaryPayment


# -------------------------
# Daily Expense
# -------------------------
class DailyExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyExpense
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")


# -------------------------
# Salary Payment
# -------------------------
class SalaryPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalaryPayment
        fields = ["id", "payroll", "amount_paid", "note", "paid_at", "jalali_month"]


# -------------------------
# Payroll
# -------------------------


class PayrollSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source="employee.full_name", read_only=True)
    total_paid = serializers.SerializerMethodField()
    remaining_amount = serializers.SerializerMethodField()

    class Meta:
        model = Payroll
        fields = [
            "id",
            "employee",
            "employee_name",
            "year",
            "month",
            "base_amount",
            "total_amount",
            "total_paid",
            "remaining_amount",
            "created_at",
            "jalali_month",
        ]
        read_only_fields = (
            "base_amount",
            "total_amount",
            "year",
            "month",
            "created_at",
        )

    def get_total_paid(self, obj):
        return obj.salarypayment_set.aggregate(total=Sum("amount_paid"))["total"] or 0

    def get_remaining_amount(self, obj):
        return obj.total_amount - self.get_total_paid(obj)

    def validate(self, attrs):
        employee = attrs["employee"]
        now = timezone.now()
        if Payroll.objects.filter(
            employee=employee, year=now.year, month=now.month
        ).exists():
            raise serializers.ValidationError(
                "Payroll already exists for this teacher this month."
            )
        return attrs

    def create(self, validated_data):
        employee = validated_data["employee"]
        now = timezone.now()
        validated_data["year"] = now.year
        validated_data["month"] = now.month

        # ✅ Correctly count total active students for this teacher
        student_count = sum(
            cls.enrollments.filter(status="active").count()
            for cls in employee.student_classes.filter(is_active=True)
        )

        # Calculate salary based on rules
        salary_amount = employee.calculate_salary(student_count)

        validated_data["base_amount"] = salary_amount
        validated_data["total_amount"] = salary_amount
        validated_data["jalali_month"] = get_current_jalali_month()

        return super().create(validated_data)


# ---------------- Salary Payment ----------------
class SalaryPaymentDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalaryPayment
        fields = ["id", "amount_paid", "note", "jalali_month", "created_at"]


# ---------------- Teacher Salary Summary ----------------
class TeacherSalarySummarySerializer(serializers.ModelSerializer):
    payrolls = serializers.SerializerMethodField()
    payroll_total = serializers.SerializerMethodField()
    total_paid = serializers.SerializerMethodField()
    remaining = serializers.SerializerMethodField()

    class Meta:
        model = Payroll
        fields = [
            "id",
            "employee",
            "jalali_month",
            "base_amount",
            "payroll_total",
            "total_paid",
            "remaining",
            "payrolls",
        ]

    def get_payrolls(self, obj):
        payments = SalaryPayment.objects.filter(payroll=obj)
        return SalaryPaymentDetailSerializer(payments, many=True).data

    def get_payroll_total(self, obj):
        # total of base_amount + any other additions (if needed)
        return obj.total_amount

    def get_total_paid(self, obj):
        payments = SalaryPayment.objects.filter(payroll=obj)
        return sum(p.amount_paid for p in payments) or Decimal("0.00")

    def get_remaining(self, obj):
        return (obj.total_amount - self.get_total_paid(obj)) or Decimal("0.00")


# ---------------- Student Payment Details ----------------
class StudentPaymentDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = EnrollmentPayment
        fields = ["amount", "note", "jalali_month", "created_at"]


class StudentReportSerializer(serializers.ModelSerializer):
    card_price = serializers.SerializerMethodField()
    books_price = serializers.SerializerMethodField()
    payments = serializers.SerializerMethodField()
    total_fee = serializers.DecimalField(
        max_digits=12, decimal_places=2, read_only=True
    )
    remaining = serializers.SerializerMethodField()

    class Meta:
        model = Enrollment
        fields = [
            "student",
            "student_class",
            "card_price",
            "books_price",
            "course_fee",
            "total_fee",
            "remaining",
            "payments",
            "jalali_month",
        ]

    def get_card_price(self, obj):
        return obj.card.price if obj.card else Decimal("0.00")

    def get_books_price(self, obj):
        return obj.books.aggregate(total=models.Sum("price"))["total"] or Decimal(
            "0.00"
        )

    def get_payments(self, obj):
        payments = obj.payments.all()
        return StudentPaymentDetailSerializer(payments, many=True).data

    def get_remaining(self, obj):
        return max(Decimal("0.00"), obj.total_fee - obj.paid_amount)


# ---------------- Teacher Salary Report ----------------
class TeacherSalaryReportSerializer(serializers.ModelSerializer):
    payments = serializers.SerializerMethodField()
    total_paid = serializers.SerializerMethodField()
    remaining = serializers.SerializerMethodField()

    class Meta:
        model = Payroll
        fields = [
            "employee",
            "base_amount",
            "total_amount",
            "total_paid",
            "remaining",
            "payments",
            "jalali_month",
        ]

    def get_payments(self, obj):
        payments = obj.salarypayment_set.all()
        return SalaryPaymentDetailSerializer(payments, many=True).data

    def get_total_paid(self, obj):
        return sum([p.amount_paid for p in obj.salarypayment_set.all()]) or Decimal(
            "0.00"
        )

    def get_remaining(self, obj):
        return obj.total_amount - self.get_total_paid(obj)


class FineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fine
        fields = ["id", "person", "note", "amount_paid", "created_at", "jalali_month"]
        read_only_fields = [
            "id",
            "created_at",
            "jalali_month",
        ]  # jalali_month will be auto-calculated

    def create(self, validated_data):
        # Ensure jalali_month is set if not provided
        if "jalali_month" not in validated_data or not validated_data["jalali_month"]:

            validated_data["jalali_month"] = get_current_jalali_month
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Update jalali_month if created_at is updated
        if "created_at" in validated_data:

            validated_data["jalali_month"] = get_current_jalali_month
        return super().update(instance, validated_data)
