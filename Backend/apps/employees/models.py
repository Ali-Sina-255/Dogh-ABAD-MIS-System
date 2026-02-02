from decimal import Decimal

import django_jalali.db.models as jmodels
from apps.courses.jalali_date import get_current_jalali_month
from django.db import models
from django.utils import timezone


class TeacherLevel(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class TeacherSalaryRule(models.Model):
    teacher_level = models.ForeignKey(
        TeacherLevel,
        on_delete=models.CASCADE,
        related_name="salary_rules",
    )

    min_students = models.PositiveSmallIntegerField()
    max_students = models.PositiveSmallIntegerField()

    salary_amount = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        unique_together = ("teacher_level", "min_students", "max_students")
        ordering = ["min_students"]

    def __str__(self):
        return f"{self.teacher_level} | {self.min_students}-{self.max_students} → {self.salary_amount}"


class Employee(models.Model):

    class Role(models.IntegerChoices):
        OTHER = 0, "Other"
        Doctor = 1, "Doctor"
        Reception = 2, "Reception"
        COOKER = 3, "Cooker"
        GUARD = 4, "Guard"

    class ContractType(models.TextChoices):
        FIX = "fix", "Fixed"
        PERCENTAGE = "percentage", "Percentage"

    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255, default="Unknown")
    email = models.EmailField(unique=True)

    role = models.PositiveSmallIntegerField(choices=Role.choices, default=Role.OTHER)
    identity_card = models.CharField(max_length=20, blank=True, null=True)
    contract_duration = models.CharField(max_length=255, null=True, blank=True)

    contract_type = models.CharField(
        max_length=20, choices=ContractType.choices, default=ContractType.FIX
    )
    teacher_level = models.ForeignKey(
        "TeacherLevel",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Used for variable-salary teachers",
    )
    is_fixed_salary = models.BooleanField(default=False)
    salary = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Fixed amount or percentage for teachers",
    )
    started_date = models.DateTimeField(auto_now_add=True)
    created_at = jmodels.jDateField(default=timezone.localdate)
    jalali_month = models.CharField(
        max_length=20, blank=True, help_text="Current month in Jalali calendar"
    )

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}".title()

    def calculate_salary(self, student_count: int) -> Decimal:
        """Calculate salary based on student count and salary rules"""
        # Fixed salary
        if self.contract_type == self.ContractType.FIX:
            return self.salary or Decimal("0.00")

        # Percentage-based salary (teachers only)
        if not self.teacher_level:
            return Decimal("0.00")

        rule = self.teacher_level.salary_rules.filter(
            min_students__lte=student_count,
            max_students__gte=student_count,
        ).first()

        return rule.salary_amount if rule else Decimal("0.00")

    def save(self, *args, **kwargs):
        if self.role != self.Role.Doctor:
            self.contract_type = self.ContractType.FIX
            self.is_fixed_salary = True

        if not self.jalali_month and self.created_at:
            self.jalali_month = get_current_jalali_month()

        super().save(*args, **kwargs)
