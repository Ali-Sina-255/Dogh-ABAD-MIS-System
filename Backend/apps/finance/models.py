import django_jalali.db.models as jmodels
from apps.common.models import TimeStampedUUIDModel
from apps.courses.jalali_date import get_current_jalali_month
from apps.employees.models import Employee
from django.db import models
from django.utils import timezone


# Create your models here.
class DailyExpense(TimeStampedUUIDModel):
    name = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(null=True, blank=True)
    date = models.DateTimeField(auto_now_add=True)

    created_at = jmodels.jDateField(default=timezone.localdate)
    jalali_month = models.CharField(
        max_length=20,
        blank=True,
        help_text="Current month in Jalali calendar",
    )

    def save(self, *args, **kwargs):
        """
        Safety rule:
        Non-teachers must always have fixed salary
        """
        if not self.jalali_month and self.created_at:
            self.jalali_month = get_current_jalali_month()
        super().save(*args, **kwargs)


class Payroll(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    year = models.PositiveIntegerField()
    month = models.PositiveSmallIntegerField()
    base_amount = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = jmodels.jDateField(default=timezone.localdate)
    jalali_month = models.CharField(
        max_length=20, blank=True, help_text="Current month in Jalali calendar"
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["employee", "year", "month"],
                name="unique_employee_month_payroll",
            )
        ]

    def __str__(self):
        return f"{self.employee} - {self.month}/{self.year}"

    @property
    def total_paid(self):
        return (
            self.salarypayment_set.aggregate(total=models.Sum("amount_paid"))["total"]
            or 0
        )

    @property
    def remaining_amount(self):
        return self.total_amount - self.total_paid

    def save(self, *args, **kwargs):
        if not self.jalali_month and self.created_at:
            self.jalali_month = get_current_jalali_month()
        super().save(*args, **kwargs)


class SalaryPayment(models.Model):
    payroll = models.ForeignKey(Payroll, on_delete=models.CASCADE)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    paid_at = models.DateTimeField(auto_now_add=True)
    note = models.TextField(blank=True, null=True)
    jalali_month = models.CharField(max_length=20, blank=True)
    # removed extra created_at from this model, we use paid_at

    def __str__(self):
        return f"{self.payroll.employee} - {self.amount_paid}"

    def save(self, *args, **kwargs):
        if not self.jalali_month:
            self.jalali_month = get_current_jalali_month()
        super().save(*args, **kwargs)


class Fine(models.Model):
    person = models.CharField(max_length=255, null=True, blank=True)
    note = models.TextField(blank=True, null=True)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = jmodels.jDateField(default=timezone.localdate)
    jalali_month = models.CharField(
        max_length=20,
        blank=True,
        help_text="Current month in Jalali calendar",
    )

    def __str__(self):
        return f"{self.note} - {self.amount_paid}"

    def save(self, *args, **kwargs):
        """
        Safety rule:
        Non-teachers must always have fixed salary
        """
        if not self.jalali_month and self.created_at:
            self.jalali_month = get_current_jalali_month()
        super().save(*args, **kwargs)
