from datetime import timedelta
from django.utils import timezone
from django.db.models import Sum, Count
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.core import models as core_model


# -------------------------------------------------------------------
# DATE HELPERS
# -------------------------------------------------------------------
def get_date_ranges():
    today = timezone.now().date()

    return {
        "daily": {
            "start": today,
        },
        "weekly": {
            "start": today - timedelta(days=7),
        },
        "monthly": {
            "start": today.replace(day=1),
        },
    }


# -------------------------------------------------------------------
# CORE REPORT LOGIC
# -------------------------------------------------------------------
def generate_report(start_date):
    """
    Generates a financial & operational report from a start date.
    """

    patients_count = core_model.Patient.objects.filter(
        created_at__date__gte=start_date
    ).count()

    pharmacy_sales = core_model.Pharmaceutical.objects.filter(
        created_at__date__gte=start_date
    ).aggregate(
        total=Sum("price")
    )["total"] or 0

    lab_income = core_model.LabTest.objects.filter(
        date__date__gte=start_date
    ).aggregate(
        total=Sum("price")
    )["total"] or 0

    daily_expenses = core_model.DailyExpense.objects.filter(
        date__date__gte=start_date
    ).aggregate(
        total=Sum("totla_price")
    )["total"] or 0

    pharmacy_expenses = core_model.DailyExpensePharmacy.objects.filter(
        date__date__gte=start_date
    ).aggregate(
        total=Sum("amount")
    )["total"] or 0

    taken_price = core_model.TakenPrice.objects.filter(
        date__date__gte=start_date
    ).aggregate(
        total=Sum("amount")
    )["total"] or 0

    staff_salary = core_model.Staff.objects.aggregate(
        total=Sum("salary")
    )["total"] or 0

    stock_usage = core_model.PharmaceuticalDrug.objects.filter(
        pharmaceutical__created_at__date__gte=start_date
    ).values(
        "drug__name"
    ).annotate(
        total_used=Sum("amount_used")
    )

    total_income = pharmacy_sales + lab_income + taken_price
    total_expenses = daily_expenses + pharmacy_expenses + staff_salary
    net_profit = total_income - total_expenses

    return {
        "patients_registered": patients_count,
        "income": {
            "pharmacy_sales": pharmacy_sales,
            "lab_tests": lab_income,
            "taken_price": taken_price,
            "total_income": total_income,
        },
        "expenses": {
            "daily_expense": daily_expenses,
            "pharmacy_expense": pharmacy_expenses,
            "staff_salary": staff_salary,
            "total_expenses": total_expenses,
        },
        "net_profit": net_profit,
        "stock_usage": list(stock_usage),
    }


# -------------------------------------------------------------------
# API VIEW
# -------------------------------------------------------------------
class ReportAPIView(APIView):
    """
    GET /api/v1/reports/?type=daily|weekly|monthly
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        report_type = request.query_params.get("type", "daily")

        ranges = get_date_ranges()

        if report_type not in ranges:
            return Response(
                {"error": "Invalid report type. Use daily, weekly, or monthly."},
                status=400,
            )

        start_date = ranges[report_type]["start"]
        report_data = generate_report(start_date)

        return Response(
            {
                "report_type": report_type,
                "start_date": start_date,
                "generated_at": timezone.now(),
                "data": report_data,
            }
        )
