import re
from decimal import Decimal

import jdatetime
from apps.employees.models import Employee
from rest_framework import serializers

from .jalali_date import PERSIAN_MONTHS, jalali_month_name
from .models import (
    Book,
    Card,
    Certificate,
    Enrollment,
    EnrollmentPayment,
    Student,
    StudentClasses,
)
from .utils import get_jalali_month_from_date

DISCOUNT_PERCENT = Decimal("0.0")


class BookSerializer(serializers.ModelSerializer):
    book_type_label = serializers.CharField(
        source="get_book_type_display", read_only=True
    )

    class Meta:
        model = Book
        fields = [
            "id",
            "name",
            "level",
            "book_type_label",
            "book_type",
            "price",
            "image",
            "created_at",
        ]


class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ["id", "first_name", "last_name"]


class CardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Card
        fields = [
            "id",
            "card_id",
            "price",
            "start_date",
            "expiry_date",
            "created_at",
            "jalali_month",
        ]
        read_only_fields = ["card_id", "expiry_date", "created_at"]


class StudentSerializer(serializers.ModelSerializer):
    jalali_month = serializers.CharField(read_only=True)

    created_at = serializers.CharField(read_only=True)

    class Meta:
        model = Student
        fields = [
            "id",
            "name",
            "father_name",
            "is_discount",
            "discount_percent",
            "phone_number",
            "created_at",
            "jalali_month",
        ]

    def validate_phone_number(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError("Phone number is required.")

        if not re.match(r"^\+?\d{10,13}$", value):
            raise serializers.ValidationError(
                "Phone number must be 10–13 digits and may start with +"
            )

        return value


class EnrollmentSerializer(serializers.ModelSerializer):
    student_info = StudentSerializer(source="student", read_only=True)
    card_info = CardSerializer(source="card", read_only=True)

    books = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Book.objects.all(),
        required=False,
    )

    book_display = serializers.SerializerMethodField()

    remaining_fee = serializers.DecimalField(
        source="re_amount",
        max_digits=12,
        decimal_places=2,
        read_only=True,
    )

    class_name = serializers.SerializerMethodField()
    class_time = serializers.CharField(
        source="student_class.start_time", read_only=True
    )
    teachers = serializers.SerializerMethodField()
    jalali_month = serializers.CharField(read_only=True)

    class Meta:
        model = Enrollment
        fields = [
            "id",
            "student",
            "student_info",
            "student_class",
            "class_name",
            "teachers",
            "books",
            "class_time",
            "book_display",
            "card",
            "card_info",
            "course_fee",
            "total_fee",
            "paid_amount",
            "remaining_fee",
            "status",
            "note",
            "jalali_month",
            "start_month",
        ]

        read_only_fields = [
            "card",
            "course_fee",
            "total_fee",
            "remaining_fee",
            "start_month",
        ]

    def get_class_name(self, obj):
        sc = obj.student_class
        return f"{sc.name} | {sc.day} / {sc.period}"

    def get_teachers(self, obj):
        return [
            f"{t.first_name} {t.last_name}".strip()
            for t in obj.student_class.teachers.all()
        ]

    def get_book_display(self, obj):
        if not obj.books.exists():
            return ""
        return ", ".join(f"{b.name} - {b.book_type}" for b in obj.books.all())

    def create(self, validated_data):
        books = validated_data.pop("books", [])
        enrollment = Enrollment.objects.create(**validated_data)

        if books:
            enrollment.books.set(books)

        enrollment.save()
        return enrollment


class StudentSerializer(serializers.ModelSerializer):
    jalali_month = serializers.CharField(read_only=True)

    created_at = serializers.CharField(read_only=True)
    enrollments = EnrollmentSerializer(many=True, read_only=True)

    class Meta:
        model = Student
        fields = [
            "id",
            "name",
            "father_name",
            "enrollments",
            "is_discount",
            "discount_percent",
            "phone_number",
            "created_at",
            "jalali_month",
        ]
        ref_name = "StudentListSerializer"


def get_jalali_month_for_date(gregorian_date):
    jalali_date = jdatetime.date.fromgregorian(date=gregorian_date)
    return PERSIAN_MONTHS[jalali_date.month - 1]


class StudentClassesSerializer(serializers.ModelSerializer):
    teachers = TeacherSerializer(many=True, read_only=True)
    teacher_ids = serializers.PrimaryKeyRelatedField(
        queryset=Employee.objects.filter(role=1),
        many=True,
        write_only=True,
        source="teachers",
        required=False,
    )

    student_count = serializers.SerializerMethodField()
    jalali_month = serializers.CharField(read_only=True)
    enrollments = EnrollmentSerializer(many=True, read_only=True)

    class Meta:
        model = StudentClasses
        fields = [
            "id",
            "name",
            "teachers",
            "teacher_ids",
            "course_fee",
            "day",
            "period",
            "start_time",
            "duration_months",
            "enrollments",
            "is_active",
            "student_count",
            "created_at",
            "jalali_month",
        ]

    def get_student_count(self, obj):
        return obj.enrollments.count()

    def create(self, validated_data):
        teachers = validated_data.pop("teachers", [])
        duration_months = validated_data.pop("duration_months", 1)

        # 🔹 START FROM CURRENT JALALI MONTH (NOT GREGORIAN)
        today_j = jdatetime.date.today().replace(day=1)

        created_instances = []

        for i in range(duration_months):
            j_month = today_j + jdatetime.timedelta(days=30 * i)

            cls = StudentClasses.objects.create(
                **validated_data,
                duration_months=duration_months,
                created_at=j_month,  # ✅ PURE JALALI DATE (NO DOUBLE CONVERSION)
                jalali_month=jalali_month_name(j_month),
            )

            cls.teachers.set(teachers)
            created_instances.append(cls)

        return created_instances[0]

    def update(self, instance, validated_data):
        teachers = validated_data.pop("teachers", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        if teachers is not None:
            instance.teachers.set(teachers)

        return instance


class CertificateSerializer(serializers.ModelSerializer):
    student = serializers.PrimaryKeyRelatedField(queryset=Enrollment.objects.all())

    student_name = serializers.SerializerMethodField()

    class Meta:
        model = Certificate
        fields = [
            "id",
            "student",
            "student_name",
            "price",
            "jalali_month",
            "created_at",
        ]

    def get_student_name(self, obj):
        return obj.student.student.name


class EnrollmentPaymentSerializer(serializers.ModelSerializer):
    remaining_fee = serializers.SerializerMethodField()
    jalali_month = serializers.CharField(read_only=True)

    class Meta:
        model = EnrollmentPayment
        fields = [
            "id",
            "enrollment",
            "amount",
            "note",
            "remaining_fee",
            "created_at",
            "jalali_month",
        ]
        read_only_fields = ["created_at", "remaining_fee"]

    def validate(self, attrs):
        enrollment = attrs["enrollment"]
        amount = Decimal(attrs["amount"])

        if amount <= 0:
            raise serializers.ValidationError({"amount": "Amount must be positive"})

        if amount > enrollment.re_amount:
            raise serializers.ValidationError(
                {"amount": f"Remaining fee is {enrollment.re_amount}"}
            )

        return attrs

    def get_remaining_fee(self, obj):
        return obj.enrollment.re_amount


class EnrollmentMonthlySerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.name", read_only=True)
    paid_amount = serializers.SerializerMethodField()
    remaining_fee = serializers.SerializerMethodField()
    teachers = serializers.SerializerMethodField()
    class_name = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    jalali_month = serializers.SerializerMethodField()

    class Meta:
        model = Enrollment
        fields = [
            "id",
            "student_name",
            "class_name",
            "teachers",
            "course_fee",
            "paid_amount",
            "remaining_fee",
            "status",
            "jalali_month",
            "start_month",
        ]

    def get_class_name(self, obj):
        sc = obj.student_class
        if not sc:
            return ""
        return f"{sc.name} | {sc.day} / {sc.period} @ {sc.start_time.strftime('%H:%M')}"

    def get_teachers(self, obj):
        sc = obj.student_class
        if not sc:
            return []
        return [f"{t.first_name} {t.last_name}".strip() for t in sc.teachers.all()]

    def get_paid_amount(self, obj):
        return float(obj.paid_amount)

    def get_remaining_fee(self, obj):
        return float(obj.re_amount)

    def get_status(self, obj):
        if obj.re_amount <= 0:
            return "PAID"
        elif obj.paid_amount > 0:
            return "PARTIAL"
        return "UNPAID"

    def get_jalali_month(self, obj):
        if not obj.start_month:
            return ""
        return get_jalali_month_from_date(obj.start_month)


class MonthlyDashboardSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.name", read_only=True)
    father_name = serializers.CharField(source="student.father_name", read_only=True)
    class_name = serializers.SerializerMethodField()
    remaining_fee = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        source="re_amount",
        read_only=True,
    )
    jalali_month = serializers.SerializerMethodField()

    class Meta:
        model = Enrollment
        fields = [
            "id",
            "student_name",
            "father_name",
            "class_name",
            "course_fee",
            "paid_amount",
            "remaining_fee",
            "status",
            "jalali_month",
        ]

    def get_class_name(self, obj):
        sc = obj.student_class
        if not sc:
            return ""
        return f"{sc.name} | {sc.day} / {sc.period}"

    def get_jalali_month(self, obj):
        if not obj.start_month:
            return ""
        return get_jalali_month_from_date(obj.start_month)


class EnrollmentCreateSerializer(serializers.ModelSerializer):
    # ✅ virtual field (not in DB)
    book_ids = serializers.ListField(
        child=serializers.IntegerField(), required=False, write_only=True
    )

    # ✅ DISCOUNT FIELDS (BELONG TO STUDENT, NOT ENROLLMENT)
    is_discount = serializers.BooleanField(required=False)
    discount_percent = serializers.IntegerField(required=False)

    start_month = serializers.DateField(required=True)

    paid_amount = serializers.DecimalField(
        max_digits=12, decimal_places=2, required=False, default=0
    )

    class Meta:
        model = Enrollment
        fields = [
            "student",
            "student_class",
            "book_ids",
            "start_month",
            "paid_amount",
            "is_discount",
            "discount_percent",
        ]

    # ✅ VALIDATE BOOK IDs
    def validate_book_ids(self, value):
        if not value:
            return []

        books_count = Book.objects.filter(id__in=value).count()
        if books_count != len(value):
            raise serializers.ValidationError("One or more selected books are invalid")

        return value


class ClassReportSerializer(serializers.ModelSerializer):
    student_count = serializers.IntegerField()
    discount_student_count = serializers.IntegerField()
    total_course_fee = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_paid_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_remaining = serializers.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        model = StudentClasses
        fields = [
            "id",
            "name",
            "day",
            "period",
            "student_count",
            "discount_student_count",
            "total_course_fee",
            "total_paid_amount",
            "total_remaining",
        ]


class EnrollmentClassSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.name")
    father_name = serializers.CharField(source="student.father_name")
    is_discount = serializers.BooleanField(source="student.is_discount")
    discount_percent = serializers.IntegerField(source="student.discount_percent")

    class Meta:
        model = Enrollment
        fields = [
            "id",
            "student_name",
            "father_name",
            "is_discount",
            "discount_percent",
            "total_fee",
            "paid_amount",
            "re_amount",
        ]


class ClassDetailSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    day = serializers.CharField()
    period = serializers.CharField()
    start_time = serializers.TimeField()
    teachers = serializers.ListField()
    student_count = serializers.IntegerField()
    discount_student_count = serializers.IntegerField()
    total_course_fee = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_paid_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_remaining = serializers.DecimalField(max_digits=12, decimal_places=2)
    enrollments = EnrollmentSerializer(many=True)
