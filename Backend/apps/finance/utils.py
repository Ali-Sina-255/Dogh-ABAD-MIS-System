from decimal import Decimal

from django.apps import apps
from django.db.models import Sum
from django.utils import timezone


def calculate_salary(employee, year=None, month=None, jalali_month=None):
    """
    Calculate salary for an employee.
    If `jalali_month` is provided, it filters by that instead of year/month.
    """
    Enrollment = apps.get_model("courses", "Enrollment")

    # Auto-detect current year/month if not provided
    now = timezone.now()
    year = year or now.year
    month = month or now.month

    # Non-teachers OR fixed salary teachers
    if employee.role != employee.Role.TEACHER or employee.is_fixed_salary:
        return employee.salary

    # Build queryset
    qs = Enrollment.objects.filter(student_class__teachers=employee)

    if jalali_month:
        qs = qs.filter(jalali_month=jalali_month)
    else:
        qs = qs.filter(created_at__year=year, created_at__month=month)

    total_fee = qs.aggregate(total=Sum("course_fee"))["total"] or Decimal("0.00")

    # Percentage-based salary
    return total_fee * (employee.salary / Decimal("100"))
