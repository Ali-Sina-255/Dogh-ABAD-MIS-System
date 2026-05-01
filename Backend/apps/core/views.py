import logging

from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import CategoryType, LabTest, Patient, Pharmaceutical, Stock, TestType
from .pagination import PharmaceuticalPagination
from .serializers import (
    CategoryTypeSerializer,
    LabTestSerializer,
    PatientSerializer,
    PharmaceuticalSerializer,
    StockSerializer,
    TestTypeSerializer,
)

logger = logging.getLogger(__name__)


class TestTypeApiView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    queryset = TestType.objects.all()
    serializer_class = TestTypeSerializer
    # pagination_class = TestTypePagination

    def create(self, request, *args, **kwargs):
        # Check if data is a list or a single dict
        many = isinstance(request.data, list)
        serializer = self.get_serializer(data=request.data, many=many)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )

    def get_queryset(self):
        queryset = super().get_queryset()
        month = self.request.query_params.get("jalali_month")
        if month:
            queryset = queryset.filter(jalali_month=month)
        return queryset


class TestTypeDetailApiView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [AllowAny]
    queryset = TestType.objects.all()
    serializer_class = TestTypeSerializer


class LabTestApiView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    queryset = LabTest.objects.all()
    serializer_class = LabTestSerializer

    def get_queryset(self):
        queryset = LabTest.objects.all()
        month = self.request.query_params.get("jalali_month")
        test_type = self.request.query_params.get("test_type")  # <-- new
        if month:
            queryset = queryset.filter(jalali_month=month)
        if test_type:
            queryset = queryset.filter(test_type=test_type)
        return queryset


class LabTestDetailApiView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [AllowAny]
    queryset = LabTest.objects.all()
    serializer_class = LabTestSerializer


class PatientListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            patients = Patient.objects.all()
            serializer = PatientSerializer(patients, many=True)
            return Response(serializer.data)
        except Exception as e:
            print(f"Error fetching patients: {e}")
            return Response({"error": "Failed to load patients."}, status=500)

    def post(self, request):
        try:
            # Serialize and validate the incoming data
            serializer = PatientSerializer(data=request.data)
            if serializer.is_valid():
                # Save the new patient to the database
                serializer.save()
                return Response(
                    {"message": "Patient registered successfully."}, status=201
                )
            else:
                return Response(serializer.errors, status=400)
        except Exception as e:
            print(f"Error registering patient: {e}")
            return Response({"error": "Failed to register patient."}, status=500)


class PatientDeleteView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        """
        Handle GET request to retrieve patient details by ID.
        """
        try:
            patient = Patient.objects.get(pk=pk)
            patient_data = {
                "id": patient.id,
                "name": patient.name,
                "age": patient.age,
                "patient_type": patient.patient_type,
                "category": (
                    patient.category.id if patient.category else None
                ),  # Include the category ID if it exists
                "created_at": patient.created_at,
            }
            return Response(patient_data, status=status.HTTP_200_OK)
        except Patient.DoesNotExist:
            return Response(
                {"error": "Patient not found."}, status=status.HTTP_404_NOT_FOUND
            )

    def delete(self, request, pk):
        try:
            patient = Patient.objects.get(pk=pk)
            patient.delete()
            return Response(
                {"message": "Patient deleted successfully."},
                status=status.HTTP_204_NO_CONTENT,
            )
        except Patient.DoesNotExist:
            return Response(
                {"error": "Patient not found."}, status=status.HTTP_404_NOT_FOUND
            )


class PatientUpdateView(APIView):
    permission_classes = [AllowAny]

    def put(self, request, pk):
        try:
            patient = Patient.objects.get(pk=pk)
            serializer = PatientSerializer(patient, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Patient.DoesNotExist:
            return Response(
                {"error": "Patient not found."}, status=status.HTTP_404_NOT_FOUND
            )


class StockListView(APIView):
    permission_classes = [IsAuthenticated]  # Only authenticated users can access
    # permission_classes = [AllowAny]

    def get(self, request):
        stocks = Stock.objects.all()
        serializer = StockSerializer(stocks, many=True)
        return Response(serializer.data)

    def post(self, request):
        # Only Admin can create
        if request.user.role != request.user.Admin:
            return Response(
                {"error": "You do not have permission to add stock."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = StockSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        # Only Admin can update
        if request.user.role != request.user.Admin:
            return Response(
                {"error": "You do not have permission to update stock."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            stock = Stock.objects.get(pk=pk)
        except Stock.DoesNotExist:
            return Response(
                {"error": "Stock not found."}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = StockSerializer(stock, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        # Only Admin can delete
        if request.user.role != request.user.Admin:
            return Response(
                {"error": "You do not have permission to delete stock."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            stock = Stock.objects.get(pk=pk)
            stock.delete()
            return Response(
                {"message": "Stock deleted successfully."},
                status=status.HTTP_204_NO_CONTENT,
            )
        except Stock.DoesNotExist:
            return Response(
                {"error": "Stock not found."}, status=status.HTTP_404_NOT_FOUND
            )


class StockCreateView(APIView):
    def post(self, request):
        print("Request payload:", request.data)  # Log incoming request data
        serializer = StockSerializer(data=request.data)

        if serializer.is_valid():
            print("Validated data:", serializer.validated_data)  # Log validated data
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            print("Serializer errors:", serializer.errors)  # Log validation errors
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CategoryTypeListCreateView(generics.ListCreateAPIView):

    permission_classes = [AllowAny]
    queryset = CategoryType.objects.all()
    serializer_class = CategoryTypeSerializer


class CategoryTypeDetailView(generics.RetrieveUpdateDestroyAPIView):

    permission_classes = [AllowAny]
    queryset = CategoryType.objects.all()
    serializer_class = CategoryTypeSerializer


class PharmaceuticalListCreateView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    queryset = Pharmaceutical.objects.all()
    serializer_class = PharmaceuticalSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        month = self.request.query_params.get("jalali_month")
        if month:
            queryset = queryset.filter(jalali_month=month)
        return queryset


class PharmaceuticalListView(generics.ListAPIView):
    """
    API endpoint to list all pharmaceuticals with pagination.
    """

    permission_classes = [AllowAny]
    queryset = Pharmaceutical.objects.all().order_by("-created_at")
    serializer_class = PharmaceuticalSerializer
    pagination_class = PharmaceuticalPagination


class PharmaceuticalDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [AllowAny]
    queryset = Pharmaceutical.objects.all()
    serializer_class = PharmaceuticalSerializer


# apps/core/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum
from django.utils import timezone
from decimal import Decimal
from .models import Patient, LabTest, Pharmaceutical


class HospitalDashboardSummaryView(APIView):
    def get(self, request):
        total_patients = Patient.objects.count()
        today_patients = Patient.objects.filter(
            created_at=timezone.now().date()
        ).count()

        lab_revenue = LabTest.objects.aggregate(total=Sum("price"))["total"] or Decimal(
            "0.00"
        )
        pharmacy_revenue = Pharmaceutical.objects.aggregate(total=Sum("price"))[
            "total"
        ] or Decimal("0.00")
        consultation_revenue = Patient.objects.aggregate(total=Sum("fee"))[
            "total"
        ] or Decimal("0.00")
        total_revenue = lab_revenue + pharmacy_revenue + consultation_revenue

        outstanding_balance = Patient.objects.filter(fee__isnull=False).exclude(
            fee=0
        ).aggregate(total=Sum("fee"))["total"] or Decimal("0.00")

        total_lab_tests = LabTest.objects.count()
        total_prescriptions = Pharmaceutical.objects.count()

        return Response(
            {
                "total_patients": total_patients,
                "today_patients": today_patients,
                "total_lab_tests": total_lab_tests,
                "total_prescriptions": total_prescriptions,
                "total_revenue": float(total_revenue),
                "lab_revenue": float(lab_revenue),
                "pharmacy_revenue": float(pharmacy_revenue),
                "consultation_revenue": float(consultation_revenue),
                "outstanding_balance": float(outstanding_balance),
            }
        )


class RecentPatientsView(APIView):
    def get(self, request):
        patients = (
            Patient.objects.all()
            .select_related("category")
            .order_by("-created_at")[:10]
        )
        data = [
            {
                "id": p.id,
                "name": p.name,
                "age": p.age,
                "category": {"name": p.category.name} if p.category else None,
                "patient_type": p.patient_type,
                "fee": float(p.fee) if p.fee else 0,
                "created_at": str(p.created_at),  # Fixed: convert to string
            }
            for p in patients
        ]
        return Response(data)


class RecentLabTestsView(APIView):
    def get(self, request):
        tests = (
            LabTest.objects.all()
            .select_related("patient", "test_type")
            .order_by("-date")[:10]
        )
        data = [
            {
                "id": t.id,
                "patient": {"name": t.patient.name} if t.patient else None,
                "test_type": {"name": t.test_type.name} if t.test_type else None,
                "price": float(t.price) if t.price else 0,
                "refer_to": t.refer_to,
                "date": str(t.date),  # Fixed: convert to string
            }
            for t in tests
        ]
        return Response(data)


class RecentPharmaceuticalsView(APIView):
    def get(self, request):
        prescriptions = (
            Pharmaceutical.objects.all()
            .select_related("patient_name", "doctor_name")
            .prefetch_related("pharmaceuticaldrug_set__drug")
            .order_by("-created_at")[:10]
        )

        data = []
        for p in prescriptions:
            drugs_list = []
            for pharmaceutical_drug in p.pharmaceuticaldrug_set.all()[:3]:
                drugs_list.append(
                    {
                        "name": pharmaceutical_drug.drug.name,
                        "amount_used": pharmaceutical_drug.amount_used,
                    }
                )

            data.append(
                {
                    "id": p.id,
                    "patient_name": (
                        {"name": p.patient_name.name} if p.patient_name else None
                    ),
                    "doctor_name": (
                        {"name": p.doctor_name.name} if p.doctor_name else None
                    ),
                    "drugs": drugs_list,
                    "price": float(p.price) if p.price else 0,
                    "created_at": str(p.created_at),  # Fixed: convert to string
                }
            )

        return Response(data)


class MonthlyRevenueView(APIView):
    def get(self, request):
        revenues = []

        lab_revenue_by_month = (
            LabTest.objects.values("jalali_month")
            .annotate(total=Sum("price"))
            .order_by("-jalali_month")[:6]
        )

        revenue_dict = {}

        for lab in lab_revenue_by_month:
            month = lab["jalali_month"]
            if month:
                revenue_dict[month] = {
                    "month": str(month),  # Fixed: convert to string
                    "lab_revenue": float(lab["total"] or 0),
                    "pharmacy_revenue": 0,
                    "total": float(lab["total"] or 0),
                }

        pharmacy_revenue_by_month = (
            Pharmaceutical.objects.values("jalali_month")
            .annotate(total=Sum("price"))
            .order_by("-jalali_month")[:6]
        )

        for pharm in pharmacy_revenue_by_month:
            month = pharm["jalali_month"]
            if month:
                if month in revenue_dict:
                    revenue_dict[month]["pharmacy_revenue"] = float(pharm["total"] or 0)
                    revenue_dict[month]["total"] += float(pharm["total"] or 0)
                else:
                    revenue_dict[month] = {
                        "month": str(month),  # Fixed: convert to string
                        "lab_revenue": 0,
                        "pharmacy_revenue": float(pharm["total"] or 0),
                        "total": float(pharm["total"] or 0),
                    }

        revenues = sorted(revenue_dict.values(), key=lambda x: x["month"], reverse=True)

        return Response({"revenues": revenues})


class HospitalFinancialReportView(APIView):
    def get(self, request):
        from django.db.models import Sum
        from decimal import Decimal
        from apps.finance.models import DailyExpense

        # Revenue calculations
        lab_revenue = LabTest.objects.aggregate(total=Sum("price"))["total"] or Decimal(
            "0.00"
        )
        pharmacy_revenue = Pharmaceutical.objects.aggregate(total=Sum("price"))[
            "total"
        ] or Decimal("0.00")
        consultation_revenue = Patient.objects.aggregate(total=Sum("fee"))[
            "total"
        ] or Decimal("0.00")
        total_revenue = lab_revenue + pharmacy_revenue + consultation_revenue

        # Outstanding balance
        outstanding_balance = Patient.objects.filter(fee__isnull=False).exclude(
            fee=0
        ).aggregate(total=Sum("fee"))["total"] or Decimal("0.00")

        # Calculate total expenses from DailyExpense
        total_expenses = DailyExpense.objects.aggregate(total=Sum("amount"))[
            "total"
        ] or Decimal("0.00")

        # Net profit
        net_profit = total_revenue - total_expenses

        # Monthly trend (combine revenue and expenses)
        monthly_trend = []

        # Get unique months from last 6 months across all models
        months_set = set()

        # Get months from lab tests
        lab_months = (
            LabTest.objects.values_list("jalali_month", flat=True)
            .distinct()
            .order_by("-jalali_month")[:6]
        )
        months_set.update(lab_months)

        # Get months from pharmacy
        pharm_months = (
            Pharmaceutical.objects.values_list("jalali_month", flat=True)
            .distinct()
            .order_by("-jalali_month")[:6]
        )
        months_set.update(pharm_months)

        # Get months from expenses
        expense_months = (
            DailyExpense.objects.values_list("jalali_month", flat=True)
            .distinct()
            .order_by("-jalali_month")[:6]
        )
        months_set.update(expense_months)

        # Convert to sorted list
        months = sorted(list(months_set), reverse=True)[:6]

        for month in months:
            if month:
                # Calculate revenue for this month
                month_lab_revenue = LabTest.objects.filter(
                    jalali_month=month
                ).aggregate(total=Sum("price"))["total"] or Decimal("0.00")
                month_pharmacy_revenue = Pharmaceutical.objects.filter(
                    jalali_month=month
                ).aggregate(total=Sum("price"))["total"] or Decimal("0.00")
                month_consultation_revenue = Patient.objects.filter(
                    jalali_month=month
                ).aggregate(total=Sum("fee"))["total"] or Decimal("0.00")
                month_revenue = (
                    month_lab_revenue
                    + month_pharmacy_revenue
                    + month_consultation_revenue
                )

                # Calculate expenses for this month
                month_expenses = DailyExpense.objects.filter(
                    jalali_month=month
                ).aggregate(total=Sum("amount"))["total"] or Decimal("0.00")

                # Calculate profit for this month
                month_profit = month_revenue - month_expenses

                monthly_trend.append(
                    {
                        "month": str(month),
                        "revenue": float(month_revenue),
                        "expenses": float(month_expenses),
                        "profit": float(month_profit),
                    }
                )

        return Response(
            {
                "total_lab_revenue": float(lab_revenue),
                "total_pharmacy_revenue": float(pharmacy_revenue),
                "total_consultation_revenue": float(consultation_revenue),
                "total_revenue": float(total_revenue),
                "outstanding_balance": float(outstanding_balance),
                "total_expenses": float(total_expenses),
                "net_profit": float(net_profit),
                "monthly_trend": monthly_trend,
            }
        )
