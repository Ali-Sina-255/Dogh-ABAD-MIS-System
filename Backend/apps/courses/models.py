import re
from datetime import date
from decimal import Decimal

import django_jalali.db.models as jmodels
from apps.employees.models import Employee
from dateutil.relativedelta import relativedelta
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Sum
from django.utils import timezone

from .jalali_date import get_current_jalali_month
from .utils import get_jalali_month_from_date

CARD_PRICE = getattr(settings, "CARD_PRICE", 50)


class Book(models.Model):
    class Level(models.TextChoices):
        BASIC = "BASIC", "Basic Class"
        INTERMEDIATE = "INTERMEDIATE", "Intermediate"
        ADVANCED = "ADVANCED", "Advanced"
        SPECIAL = "SPECIAL", "Special Class"

    class BookType(models.TextChoices):
        LISTENING_READING = "LR", "Listening & Reading"
        READING_WRITING = "RW", "Reading & Writing"

    name = models.CharField(max_length=255)
    level = models.CharField(max_length=20, choices=Level.choices)
    image = models.ImageField(upload_to="books", null=True, blank=True)

    book_type = models.CharField(
        max_length=7,
        choices=BookType.choices,
        blank=True,
        null=True,
    )

    price = models.DecimalField(max_digits=8, decimal_places=2)
    created_at = jmodels.jDateField(auto_now_add=True)

    class Meta:
        unique_together = ("name", "level", "book_type")

    def __str__(self):
        type_display = self.get_book_type_display() if self.book_type else "No Type"
        return f"{self.name} ({self.level} - {type_display})"


def generate_card_id():
    today = date.today()
    year = str(today.year)[-2:]
    month = f"{today.month:02d}"
    prefix = f"{year}{month}"

    last_card = (
        Card.objects.filter(card_id__startswith=prefix).order_by("-card_id").first()
    )

    if last_card:
        seq_part = last_card.card_id[len(prefix) :]
        last_number = int(seq_part) if seq_part else 0
        new_number = last_number + 1
    else:
        new_number = 1

    return f"{prefix}{new_number:03d}"


class StudentClasses(models.Model):
    name = models.CharField(max_length=400)
    teachers = models.ManyToManyField(
        Employee,
        limit_choices_to={"role": Employee.Role.Doctor},
        related_name="student_classes",
        help_text="One or more teachers for this class",
    )
    course_fee = models.DecimalField(max_digits=12, decimal_places=2)
    day = models.CharField(
        max_length=3,
        choices=[
            ("SAT", "Saturday"),
            ("SUN", "Sunday"),
            ("MON", "Monday"),
            ("TUE", "Tuesday"),
            ("WED", "Wednesday"),
            ("THU", "Thursday"),
            ("FRI", "Friday"),
        ],
    )
    period = models.CharField(
        max_length=2,
        choices=[
            ("AM", "AM"),
            ("PM", "PM"),
        ],
    )

    start_time = models.TimeField(help_text="Class duration is fixed: 1 hour")
    duration_months = models.PositiveSmallIntegerField(default=1)
    is_active = models.BooleanField(default=True)

    created_at = jmodels.jDateField(default=timezone.localdate)
    jalali_month = models.CharField(
        max_length=20, blank=True, help_text="Current month in Jalali calendar"
    )

    class Meta:
        verbose_name = "Student Class"
        verbose_name_plural = "Student Classes"

    def __str__(self):
        teacher_names = ", ".join(
            [f"{t.first_name} {t.last_name}" for t in self.teachers.all()]
        )
        return f"{self.name} | Teachers: {teacher_names} | {self.day} {self.start_time}"

    def student_count(self):
        return self.enrollments.filter(status="active").count()

    def calculate_teachers_salary(self):
        count = self.student_count()
        return [
            {"teacher": teacher.full_name, "salary": teacher.calculate_salary(count)}
            for teacher in self.teachers.all()
        ]


class CardConfig(models.Model):
    price = models.DecimalField(max_digits=6, decimal_places=2)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Card Price: {self.price}"

    class Meta:
        verbose_name = "Card Configuration"
        verbose_name_plural = "Card Configuration"


class Card(models.Model):
    card_id = models.CharField(max_length=12, unique=True, editable=False)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    start_date = models.DateField(default=timezone.localdate)
    expiry_date = models.DateField(editable=False)
    created_at = models.DateField(auto_now_add=True)
    jalali_month = models.CharField(max_length=20, blank=True)

    def save(self, *args, **kwargs):
        is_new = self.pk is None

        if not self.card_id:
            self.card_id = generate_card_id()

        if not self.expiry_date:
            self.expiry_date = self.start_date + relativedelta(months=6)

        # 🎯 Set dynamic price ONLY on creation
        if is_new and not self.price:
            config = CardConfig.objects.order_by("-updated_at").first()
            if not config:
                raise ValueError("CardConfig is not set. Please define card price.")
            self.price = config.price

        super().save(*args, **kwargs)

        if is_new and self.created_at:
            self.jalali_month = get_jalali_month_from_date(self.created_at)
            super().save(update_fields=["jalali_month"])

    def __str__(self):
        return self.card_id


class Student(models.Model):
    name = models.CharField(max_length=255)
    father_name = models.CharField(max_length=255)
    is_discount = models.BooleanField(default=False)
    discount_percent = models.PositiveIntegerField(
        default=0, help_text="Discount percentage (e.g. 50 for 50%)"
    )
    phone_number = models.CharField(max_length=13)

    created_at = jmodels.jDateField(default=timezone.localdate)
    jalali_month = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return f"{self.name} {self.father_name}"

    def clean(self):
        if not self.phone_number:
            raise ValidationError({"phone_number": "Phone number is required."})

        if not re.match(r"^\+?\d{10,13}$", self.phone_number):
            raise ValidationError(
                {
                    "phone_number": "Phone number must be 10–13 digits and may start with +"
                }
            )

    def save(self, *args, **kwargs):
        self.full_clean()

        # Always save current Jalali month
        self.jalali_month = get_current_jalali_month()

        super().save(*args, **kwargs)


class Enrollment(models.Model):
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="enrollments"
    )
    student_class = models.ForeignKey(
        StudentClasses, on_delete=models.CASCADE, related_name="enrollments"
    )
    card = models.ForeignKey(Card, on_delete=models.CASCADE)
    books = models.ManyToManyField("Book", blank=True)

    course_fee = models.DecimalField(max_digits=12, decimal_places=2)
    total_fee = models.DecimalField(max_digits=12, decimal_places=2)
    paid_amount = models.DecimalField(
        max_digits=12, decimal_places=2, default=Decimal("0.00")
    )
    re_amount = models.DecimalField(max_digits=12, decimal_places=2)
    card_charged = models.BooleanField(default=False)
    status = models.CharField(
        max_length=20,
        choices=[
            ("active", "Active"),
            ("completed", "Completed"),
            ("cancelled", "Cancelled"),
        ],
        default="active",
    )

    note = models.TextField(blank=True, null=True)

    start_month = jmodels.jDateField(default=timezone.localdate)
    jalali_month = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return f"{self.student.name} {self.student_class.name}"

    # =========================================================
    # 💰 FEE CALCULATION
    # =========================================================
    def calculate_fees(self):
        base_fee = Decimal(self.student_class.course_fee or 0)

        # ✅ Card fee ONLY if card_charged = True
        card_fee = Decimal("0.00")
        if self.card_charged and self.card:
            card_fee = Decimal(self.card.price or 0)

        books_total = self.books.aggregate(total=Sum("price"))["total"] or Decimal(
            "0.00"
        )

        discount_value = Decimal("0.00")
        if self.student.is_discount and self.student.discount_percent > 0:
            discount_value = (
                base_fee * Decimal(self.student.discount_percent) / Decimal("100")
            )

        discounted_course_fee = max(Decimal("0.00"), base_fee - discount_value)

        total_fee = discounted_course_fee + books_total + card_fee
        remaining = max(Decimal("0.00"), total_fee - self.paid_amount)

        self.course_fee = base_fee
        self.total_fee = total_fee
        self.re_amount = remaining

    # =========================================================
    # 🧠 SAVE LOGIC (SINGLE SOURCE OF TRUTH)
    # =========================================================
    def save(self, *args, **kwargs):
        is_new = self.pk is None
        today = timezone.localdate()

        self.jalali_month = get_current_jalali_month()

        # ❌ No past enrollments
        if is_new and self.start_month and self.start_month < today:
            raise ValidationError("Cannot create enrollment for a past month")

        if is_new:
            # -------------------------------------------------
            # 🔍 Check if student already has a card
            # -------------------------------------------------
            previous_enrollment = Enrollment.objects.filter(
                student=self.student, card__isnull=False
            ).first()

            if previous_enrollment:
                # ✅ Re-enrollment → reuse card, DO NOT charge
                self.card = previous_enrollment.card
                self.card_charged = False
            else:
                # 🔥 First enrollment → create card & charge
                self.card = Card.objects.create()
                self.card_charged = True

            # initialize fields
            self.course_fee = Decimal("0.00")
            self.total_fee = Decimal("0.00")
            self.re_amount = Decimal("0.00")

        super().save(*args, **kwargs)

        # 🔁 calculate AFTER save (books M2M safe)
        self.calculate_fees()
        super().save(update_fields=["course_fee", "total_fee", "re_amount"])


class EnrollmentPayment(models.Model):
    enrollment = models.ForeignKey(
        Enrollment, on_delete=models.CASCADE, related_name="payments"
    )

    amount = models.DecimalField(max_digits=12, decimal_places=2)

    created_at = jmodels.jDateField(default=timezone.localdate)
    note = models.CharField(max_length=255, blank=True, null=True)
    jalali_month = models.CharField(
        max_length=20,
        blank=True,
        help_text="Current month in Jalali calendar",
    )

    def save(self, *args, **kwargs):
        is_new = self.pk is None

        if self.created_at:
            self.jalali_month = get_current_jalali_month()

        super().save(*args, **kwargs)

        if is_new:
            enrollment = self.enrollment
            enrollment.paid_amount += self.amount
            enrollment.re_amount = max(
                Decimal("0.00"), enrollment.total_fee - enrollment.paid_amount
            )
            enrollment.save(update_fields=["paid_amount", "re_amount"])


class Certificate(models.Model):

    student = models.ForeignKey(
        Enrollment, on_delete=models.CASCADE, related_name="certificates"
    )

    price = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)

    created_at = jmodels.jDateField(default=timezone.localdate)
    jalali_month = models.CharField(
        max_length=20,
        blank=True,
        help_text="Current month in Jalali calendar",
    )

    def __str__(self):
        return f"Certificate for {self.student.student.name} "

    def save(self, *args, **kwargs):
        if self.created_at:
            self.jalali_month = get_current_jalali_month()

        super().save(*args, **kwargs)
