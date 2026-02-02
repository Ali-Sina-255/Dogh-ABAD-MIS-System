from datetime import date
from decimal import Decimal

import jdatetime
from apps.employees.models import Employee
from apps.finance.models import Fine
from dateutil.relativedelta import relativedelta
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from django.db.models import DecimalField, F, Q, Sum
from django.db.models.functions import Coalesce
from django.utils import timezone
from django.utils.timezone import now
from rest_framework import mixins, permissions, serializers, status, viewsets
from rest_framework.decorators import action, api_view
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet

from .models import (
    Book,
    Card,
    Certificate,
    Enrollment,
    EnrollmentPayment,
    Student,
    StudentClasses,
)
from .serializers import (
    BookSerializer,
    CardSerializer,
    CertificateSerializer,
    ClassDetailSerializer,
    EnrollmentCreateSerializer,
    EnrollmentMonthlySerializer,
    EnrollmentPaymentSerializer,
    EnrollmentSerializer,
    StudentClassesSerializer,
    StudentSerializer,
)
from .services.enrollment_service import complete_finished_enrollments
from .utils import PERSIAN_MONTHS, get_jalali_month_from_date, get_next_month_date


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all().order_by("-created_at")
    serializer_class = StudentSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Student.objects.prefetch_related(
            "enrollments__card", "enrollments__books"
        )
        month = self.request.query_params.get("jalali_month")
        if month:
            queryset = queryset.filter(enrollments__jalali_month=month)
        return queryset

    # ✅ ONLY ADD THIS (CREATE)
    def perform_create(self, serializer):
        try:
            serializer.save()
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.message_dict)

    # ✅ ONLY ADD THIS (UPDATE)
    def perform_update(self, serializer):
        try:
            serializer.save()
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.message_dict)

    @action(detail=False, methods=["get"], url_path="search")
    def search(self, request):
        q = request.query_params.get("q", "").strip()
        if not q:
            return Response([])

        parts = [p.strip() for p in q.split(",") if p.strip()]

        qs = self.queryset
        for part in parts:
            qs = qs.filter(
                Q(name__icontains=part)
                | Q(father_name__icontains=part)
                | Q(enrollments__card__card_id__icontains=part)
                | Q(enrollments__jalali_month__icontains=part)
            )
        serializer = self.get_serializer(qs.distinct(), many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"], url_path="available-classes")
    def available_classes(self, request, pk=None):
        classes = StudentClasses.objects.filter(is_active=True)
        serializer = StudentClassesSerializer(classes, many=True)
        return Response(serializer.data)


class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=["get"], url_path="class-books")
    def class_books(self, request, pk=None):
        """
        Returns all books for a class. If query param `all=true` is set,
        returns all books regardless of class association.
        """
        all_param = request.query_params.get("all", "false").lower() == "true"

        if all_param:
            # Return ALL books
            books = self.queryset.order_by("name", "book_type")
        else:
            # Return only books linked to this class (if needed)
            books = self.queryset.filter(enrollment__student_class_id=pk).order_by(
                "name", "book_type"
            )

        serializer = self.get_serializer(books, many=True)
        return Response(serializer.data)


class CardViewSet(viewsets.ModelViewSet):
    queryset = Card.objects.all()
    serializer_class = CardSerializer
    permission_classes = [permissions.AllowAny]
    permission_classes = [permissions.IsAuthenticated]


class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = (
        Enrollment.objects.select_related(
            "card",
            "student_class",
        )
        .prefetch_related(
            "books",
            "student_class__teachers",
        )
        .order_by("-start_month")
    )
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        month = self.request.query_params.get("jalali_month")
        if month:
            queryset = queryset.filter(jalali_month=month)
        return queryset


class CertificateViewSet(viewsets.ModelViewSet):
    """
    API endpoint for HR to manage certificates.
    """

    queryset = Certificate.objects.all().order_by("-created_at")
    serializer_class = CertificateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        month = self.request.query_params.get("jalali_month")
        if month:
            queryset = queryset.filter(jalali_month=month)
        return queryset


class StudentClassesViewSet(viewsets.ModelViewSet):
    serializer_class = StudentClassesSerializer

    def get_queryset(self):
        qs = StudentClasses.objects.all().prefetch_related(
            "teachers", "enrollments__student"
        )

        month = self.request.query_params.get("jalali_month")
        if month:
            qs = qs.filter(jalali_month=month)

        return qs.order_by("day", "created_at")

    def partial_update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return super().update(request, *args, **kwargs)


class CreateNextMonthPayments(APIView):
    """
    Create enrollment payments for the next month
    """

    def post(self, request):
        enrollment_ids = request.data.get("enrollments", [])
        if not enrollment_ids:
            return Response({"error": "No enrollments provided"}, status=400)

        next_month_date = get_next_month_date()
        created_payments = []

        for eid in enrollment_ids:
            enrollment = Enrollment.objects.filter(id=eid).first()
            if not enrollment:
                continue

            # Payment for the next month
            amount = enrollment.re_amount  # or any logic you want
            payment_data = {
                "enrollment": enrollment.id,
                "amount": amount,
                "paid_at": next_month_date,
                "note": f"Auto payment for {next_month_date.strftime('%B %Y')}",
            }

            serializer = EnrollmentPaymentSerializer(data=payment_data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            created_payments.append(serializer.data)

        return Response(created_payments, status=status.HTTP_201_CREATED)


class EnrollmentPaymentViewSet(viewsets.ModelViewSet):
    queryset = EnrollmentPayment.objects.select_related("enrollment")
    serializer_class = EnrollmentPaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payment = serializer.save()

        enrollment_data = EnrollmentMonthlySerializer(payment.enrollment).data

        return Response(
            {
                "payment_id": payment.id,
                "enrollment": enrollment_data,
            },
            status=status.HTTP_201_CREATED,
        )


# ---------------- Enrollment Monthly Dashboard ----------------
class EnrollmentMonthlyDashboardViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = EnrollmentMonthlySerializer

    def get_queryset(self):
        """
        Filter enrollments by Gregorian start_month and Jalali month for display
        """
        year = self.request.query_params.get("year")
        jalali_month = self.request.query_params.get("jalali_month")

        qs = Enrollment.objects.select_related(
            "student", "student_class"
        ).prefetch_related("student_class__teachers")

        # Filter by Gregorian year
        if year:
            try:
                qs = qs.filter(start_month__year=int(year))
            except ValueError:
                pass

        # Filter by Jalali month (for display)
        if jalali_month:
            qs = [
                e
                for e in qs
                if get_jalali_month_from_date(e.start_month) == jalali_month
            ]

        return qs


# ---------------- Enrollment Status Dashboard ----------------
class EnrollmentStatusDashboardAPIView(APIView):
    def get(self, request):
        total = Enrollment.objects.count()
        completed = (
            Enrollment.objects.filter(start_month__lte=now().date())
            .exclude(student_class__is_active=True)
            .count()
        )
        active = total - completed

        return Response(
            [
                {"status": "Active", "value": active},
                {"status": "Completed", "value": completed},
            ]
        )


# ---------------- Dashboard Summary ----------------


@api_view(["GET"])
def dashboard_summary(request):
    today = jdatetime.date.today()
    month = request.query_params.get("jalali_month")

    # ---------------- Start and end of the current Jalali year ----------------
    start_j = jdatetime.date(today.year, 1, 1)
    end_j = jdatetime.date(today.year + 1, 1, 1)

    start_g = start_j.togregorian()
    end_g = end_j.togregorian()

    # ---------------- Yearly revenue and remaining ----------------
    yearly_aggregates = Enrollment.objects.filter(
        start_month__gte=start_g, start_month__lt=end_g
    ).aggregate(
        total_paid=Sum("paid_amount"),
        total_fee=Sum("total_fee"),
    )

    yearly_revenue = yearly_aggregates["total_paid"] or Decimal("0.00")
    yearly_total_fee = yearly_aggregates["total_fee"] or Decimal("0.00")
    yearly_remaining = yearly_total_fee - yearly_revenue

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

    total_fine_income = fines.aggregate(total=Sum("amount_paid"))["total"] or Decimal(
        "0.00"
    )

    # ---------------- Total revenue ever (FIXED) ----------------
    enrollment_revenue = Enrollment.objects.aggregate(total=Sum("paid_amount"))[
        "total"
    ] or Decimal("0.00")

    total_revenue = enrollment_revenue + total_fine_income + total_certificate_income

    # ---------------- Counts ----------------
    students = Enrollment.objects.values("student").distinct().count()
    classes = Enrollment.objects.values("student_class").distinct().count()
    teachers = Employee.objects.filter(role=Employee.Role.Doctor).count()

    return Response(
        {
            "students": students,
            "classes": classes,
            "teachers": teachers,
            "total_revenue": total_revenue,
            "yearly_revenue": yearly_revenue,
            "yearly_remaining": yearly_remaining,
        }
    )


# ---------------- Recent Enrollments ----------------
@api_view(["GET"])
def recent_enrollments(request):
    enrollments = Enrollment.objects.order_by("-start_month")[:10]
    serializer = EnrollmentSerializer(enrollments, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def monthly_revenue(request):
    data = []

    for month_index, month_name in enumerate(PERSIAN_MONTHS, start=1):
        # Get all enrollments in this month
        enrollments = Enrollment.objects.filter(jalali_month=month_name)

        course_total = 0.0
        card_total = 0.0
        book_total = 0.0

        for enrollment in enrollments:
            # -------------------------------
            # Only count what student actually paid
            # -------------------------------
            course_total += float(enrollment.paid_amount or 0)

            # Card: assume fully paid if enrollment has card
            if enrollment.card:
                card_total += float(enrollment.card.price or 0)

            # Books: assume fully paid if enrollment has books
            for book in enrollment.books.all():
                book_total += float(book.price or 0)

        # Total revenue received this month
        total = course_total

        data.append(
            {
                "month_name": month_name,
                "month_number": month_index,
                "course": course_total,
                "card": card_total,
                "book": book_total,
                "total": total,
            }
        )

    return Response(data)


# ---------------- Enrollment Status ----------------
@api_view(["GET"])
def enrollment_status(request):
    """
    Count enrollments for the current Jalali month:
    PAID, PARTIAL, UNPAID
    """
    today_j = jdatetime.date.today()
    start_j = jdatetime.date(today_j.year, today_j.month, 1)
    end_j = (
        jdatetime.date(today_j.year, today_j.month + 1, 1)
        if today_j.month < 12
        else jdatetime.date(today_j.year + 1, 1, 1)
    )

    # Convert to Gregorian for filtering
    start_g = start_j.togregorian()
    end_g = end_j.togregorian()

    paid = (
        Enrollment.objects.filter(
            payments__created_at__gte=start_g,
            payments__created_at__lt=end_g,
            re_amount=0,
        )
        .distinct()
        .count()
    )

    partial = (
        Enrollment.objects.filter(
            payments__created_at__gte=start_g,
            payments__created_at__lt=end_g,
            paid_amount__gt=0,
            re_amount__gt=0,
        )
        .distinct()
        .count()
    )

    unpaid = (
        Enrollment.objects.filter(
            payments__created_at__gte=start_g,
            payments__created_at__lt=end_g,
            paid_amount=0,
        )
        .distinct()
        .count()
    )

    return Response(
        [
            {"status": "PAID", "value": paid},
            {"status": "PARTIAL", "value": partial},
            {"status": "UNPAID", "value": unpaid},
        ]
    )


@api_view(["POST"])
def enroll_student(request, class_id):
    # ✅ auto-complete finished enrollments
    complete_finished_enrollments()

    student_id = request.data.get("student_id")
    if not student_id:
        return Response(
            {"detail": "student_id is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        student = Student.objects.get(id=student_id)
        student_class = StudentClasses.objects.get(id=class_id)
    except (Student.DoesNotExist, StudentClasses.DoesNotExist):
        return Response(
            {"detail": "Student or class not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    last_enrollment = (
        Enrollment.objects.filter(student=student, student_class=student_class)
        .order_by("-created_at")
        .first()
    )

    if last_enrollment and last_enrollment.status == "active":
        return Response(
            {"detail": "Student is still completing this level"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if last_enrollment:
        start_month = last_enrollment.start_month + relativedelta(
            months=student_class.duration_months
        )
    else:
        start_month = timezone.localdate()

    enrollment = Enrollment.objects.create(
        student=student,
        student_class=student_class,
        start_month=start_month,
        status="active",
        paid_amount=0,
    )

    return Response(
        {
            "detail": "Student enrolled successfully",
            "enrollment_id": enrollment.id,
        },
        status=status.HTTP_201_CREATED,
    )


# views.py
@api_view(["GET"])
def eligible_students(request, class_id):
    """
    Return students who have completed a class and are eligible for next month
    """
    enrollments = Enrollment.objects.filter(
        student_class_id=class_id, status="completed"  # ✅ use the enrollment status
    ).select_related("student")

    students = [e.student for e in enrollments]

    # serialize students
    data = [
        {
            "id": s.id,
            "name": s.name,
            "father_name": s.father_name,
        }
        for s in students
    ]

    return Response(data)


@api_view(["GET"])
def monthly_fee(request):
    q = request.GET.get("q", "").strip()
    if not q:
        return Response([], status=200)

    # Try searching by ID if q is numeric, else by name
    if q.isdigit():
        enrollments = Enrollment.objects.filter(student__id=int(q))
    else:
        enrollments = Enrollment.objects.filter(student__name__icontains=q)

    # Only take latest enrollment per student_class
    data = []
    for e in enrollments:
        data.append(
            {
                "id": e.id,
                "student": e.student.id,
                "student_info": {
                    "id": e.student.id,
                    "name": e.student.name,
                    "father_name": e.student.father_name,
                    "phone_number": str(e.student.phone_number),
                    "is_discount": e.student.is_discount,
                    "discount_percent": e.student.discount_percent,
                    "created_at": e.student.created_at,
                    "jalali_month": e.student.jalali_month,
                },
                "student_class": e.student_class.id,
                "class_name": e.student_class.name,
                "teachers": [t.first_name for t in e.student_class.teachers.all()],
                "books": [b.id for b in e.books.all()],
                "book_display": ", ".join([b.name for b in e.books.all()]),
                "card": e.card.id,
                "card_info": {
                    "id": e.card.id,
                    "card_id": e.card.card_id,
                    "price": str(e.card.price),
                    "start_date": e.card.start_date,
                    "expiry_date": e.card.expiry_date,
                    "created_at": e.card.created_at,
                    "jalali_month": e.card.jalali_month,
                },
                "course_fee": str(e.course_fee),
                "total_fee": str(e.total_fee),
                "paid_amount": str(e.paid_amount),
                "remaining_fee": str(e.re_amount),
                "status": e.status,
                "note": e.note,
                "created_at": e.created_at,
                "jalali_month": e.jalali_month,
            }
        )

    return Response(data)


class StudentSearchAPIView(ListAPIView):
    serializer_class = StudentSerializer

    def get_queryset(self):
        q = self.request.query_params.get("q", "")
        return Student.objects.filter(
            Q(name__icontains=q) | Q(father_name__icontains=q)
        )


class ReEnrollmentViewSet(ModelViewSet):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        student = data["student"]
        student_class = data["student_class"]
        paid_amount = data.get("paid_amount", Decimal("0.00"))
        book_ids = data.get("book_ids", [])
        start_month = data.get("start_month") or date.today()

        # ✅ EXTRACT DISCOUNT DATA
        is_discount = data.pop("is_discount", False)
        discount_percent = data.pop("discount_percent", 0)

        with transaction.atomic():

            if not student_class.is_active:
                return Response(
                    {"detail": "This class is not active"},
                    status=400,
                )

            if Enrollment.objects.filter(
                student=student, student_class=student_class, start_month=start_month
            ).exists():
                return Response(
                    {"detail": "Student already enrolled in this class for this month"},
                    status=400,
                )

            # 🔁 Reuse student card
            first_enrollment = (
                Enrollment.objects.filter(student=student)
                .order_by("start_month")
                .first()
            )
            card = first_enrollment.card if first_enrollment else None

            # ✅ UPDATE STUDENT DISCOUNT (SINGLE SOURCE OF TRUTH)
            student.is_discount = is_discount
            student.discount_percent = discount_percent if is_discount else 0
            student.save(update_fields=["is_discount", "discount_percent"])

            # ✅ CREATE ENROLLMENT (NO DISCOUNT PASSED)
            enrollment = Enrollment.objects.create(
                student=student,
                student_class=student_class,
                card=card,
                start_month=start_month,
                paid_amount=paid_amount,
                status="active",
            )

            # 📚 Assign books
            books = Book.objects.filter(id__in=book_ids)
            if books.exists():
                enrollment.books.set(books)

            # 💰 Calculate fees
            enrollment.calculate_fees()
            enrollment.save(
                update_fields=[
                    "course_fee",
                    "total_fee",
                    "re_amount",
                    "jalali_month",
                ]
            )

        return Response(
            {
                "id": enrollment.id,
                "student": enrollment.student.name,
                "class_name": enrollment.student_class.name,
                "teachers": [
                    f"{t.first_name} {t.last_name}"
                    for t in enrollment.student_class.teachers.all()
                ],
                "books": [book.name for book in books],
                "jalali_month": enrollment.jalali_month,
                "course_fee": enrollment.course_fee,
                "total_fee": enrollment.total_fee,
                "paid_amount": enrollment.paid_amount,
                "remaining_fee": enrollment.re_amount,
                "start_month": enrollment.start_month,
                "status": enrollment.status,
            },
            status=201,
        )


class ClassDetailView(APIView):
    def get(self, request, class_id):
        try:
            cls = StudentClasses.objects.prefetch_related(
                "teachers", "enrollments__student", "enrollments__books"
            ).get(id=class_id)

            # Aggregates
            student_count = cls.enrollments.count()
            discount_student_count = cls.enrollments.filter(
                student__is_discount=True
            ).count()

            total_course_fee = cls.enrollments.aggregate(
                total=Coalesce(
                    Sum(F("total_fee"), output_field=DecimalField()), Decimal("0.00")
                )
            )["total"]

            total_paid_amount = cls.enrollments.aggregate(
                total=Coalesce(
                    Sum(F("paid_amount"), output_field=DecimalField()), Decimal("0.00")
                )
            )["total"]

            total_remaining = cls.enrollments.aggregate(
                total=Coalesce(
                    Sum(F("re_amount"), output_field=DecimalField()), Decimal("0.00")
                )
            )["total"]

            serializer = ClassDetailSerializer(
                {
                    "id": cls.id,
                    "name": cls.name,
                    "day": cls.day,
                    "period": cls.period,
                    "start_time": cls.start_time,
                    "teachers": list(
                        cls.teachers.values("id", "first_name", "last_name")
                    ),
                    "student_count": student_count,
                    "discount_student_count": discount_student_count,
                    "total_course_fee": total_course_fee,
                    "total_paid_amount": total_paid_amount,
                    "total_remaining": total_remaining,
                    "enrollments": cls.enrollments.all(),
                }
            )
            return Response(serializer.data)
        except StudentClasses.DoesNotExist:
            return Response({"detail": "Class not found"}, status=404)


class TeacherClassesView(APIView):
    def get(self, request, teacher_id):
        # Get month from query params
        jalali_month = request.query_params.get("jalali_month", None)

        try:
            teacher = Employee.objects.get(id=teacher_id, role=1)
        except Employee.DoesNotExist:
            return Response({"detail": "Teacher not found"}, status=404)

        # Filter classes by teacher and optionally by month
        classes = StudentClasses.objects.filter(teachers=teacher)
        if jalali_month:
            classes = classes.filter(jalali_month=jalali_month)

        course_count = classes.count()
        class_data = []

        for cls in classes:
            enrollments = cls.enrollments.all()
            student_count = enrollments.count()
            discount_student_count = enrollments.filter(
                student__is_discount=True
            ).count()
            total_course_fee = sum(e.total_fee for e in enrollments)
            total_paid_amount = sum(e.paid_amount for e in enrollments)
            total_remaining = total_course_fee - total_paid_amount

            class_data.append(
                {
                    "id": cls.id,
                    "name": cls.name,
                    "day": cls.day,
                    "period": cls.period,
                    "start_time": cls.start_time,
                    "teachers": [
                        f"{t.first_name} {t.last_name}" for t in cls.teachers.all()
                    ],
                    "student_count": student_count,
                    "discount_student_count": discount_student_count,
                    "total_course_fee": total_course_fee,
                    "total_paid_amount": total_paid_amount,
                    "total_remaining": total_remaining,
                    "course_count": course_count,
                    "enrollments": [
                        {
                            "student_name": e.student.name,
                            "father_name": e.student.father_name,
                            "paid_amount": e.paid_amount,
                            "total_fee": e.total_fee,
                            "remaining_fee": e.re_amount,
                        }
                        for e in enrollments
                    ],
                }
            )

        return Response(class_data)
