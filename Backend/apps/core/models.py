import django_jalali.db.models as jmodels
from apps.courses.jalali_date import get_current_jalali_month
from apps.employees.models import Employee
from django.contrib.auth import get_user_model
from django.db import models


class CategoryType(models.Model):
    User = get_user_model()
    name = models.CharField(max_length=300)
    created_at = jmodels.jDateField(auto_now_add=True)

    def __str__(self) -> str:
        return self.name


class StaffType(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    created_at = jmodels.jDateField(auto_now_add=True)

    def __str__(self) -> str:
        return self.name


class Stock(models.Model):
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    percentage = models.DecimalField(max_digits=12, decimal_places=2)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    amount = models.IntegerField(default=0.00)
    daily_used = models.IntegerField(null=True, blank=True)
    created_at = jmodels.jDateField(auto_now_add=True)
    updated_at = jmodels.jDateField(auto_now=True)
    jalali_month = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):

        # Always save current Jalali month
        self.jalali_month = get_current_jalali_month()

        super().save(*args, **kwargs)


class Pharmaceutical(models.Model):

    doctor_name = models.ForeignKey(
        Employee, on_delete=models.SET_NULL, null=True, blank=True
    )
    patient_name = models.ForeignKey("Patient", on_delete=models.CASCADE)

    # NEW: Link drug (stock item)
    drugs = models.ManyToManyField("Stock", through="PharmaceuticalDrug")

    # NEW: how many used for this prescription
    amount_used = models.IntegerField(default=1)

    copy = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    created_at = jmodels.jDateField(auto_now_add=True)
    updated_at = jmodels.jDateField(auto_now=True)
    jalali_month = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return self.patient_name.name

    def save(self, *args, **kwargs):

        # Always save current Jalali month
        self.jalali_month = get_current_jalali_month()

        super().save(*args, **kwargs)


class PharmaceuticalDrug(models.Model):
    pharmaceutical = models.ForeignKey(Pharmaceutical, on_delete=models.CASCADE)
    drug = models.ForeignKey("Stock", on_delete=models.CASCADE)
    amount_used = models.IntegerField(default=1)
    created_at = jmodels.jDateField(auto_now_add=True)

    def __str__(self):
        return f"{self.drug.name} x {self.amount_used}"

    jalali_month = models.CharField(max_length=20, blank=True)

    def save(self, *args, **kwargs):

        # Always save current Jalali month
        self.jalali_month = get_current_jalali_month()

        super().save(*args, **kwargs)


class Patient(models.Model):
    name = models.CharField(max_length=255)
    age = models.IntegerField(null=True, blank=True)
    fee = models.DecimalField(max_digits=12, decimal_places=1, null=True, blank=True)
    patient_type = models.CharField(max_length=255)
    category = models.ForeignKey(CategoryType, on_delete=models.SET_NULL, null=True)
    created_at = jmodels.jDateField(auto_now_add=True)
    jalali_month = models.CharField(max_length=20, blank=True)

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs):

        # Always save current Jalali month
        self.jalali_month = get_current_jalali_month()

        super().save(*args, **kwargs)


class TestType(models.Model):
    name = models.CharField(max_length=500)

    date = jmodels.jDateField(auto_now_add=True)
    jalali_month = models.CharField(max_length=20, blank=True)

    def save(self, *args, **kwargs):

        # Always save current Jalali month
        self.jalali_month = get_current_jalali_month()

        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.name


class LabTest(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.SET_NULL, null=True)
    test_type = models.ForeignKey(TestType, on_delete=models.SET_NULL, null=True)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    refer_to = models.CharField(max_length=300)

    date = jmodels.jDateField(auto_now_add=True)

    jalali_month = models.CharField(max_length=20, blank=True)

    def save(self, *args, **kwargs):

        # Always save current Jalali month
        self.jalali_month = get_current_jalali_month()

        super().save(*args, **kwargs)

    def __str__(self):
        patient = self.patient.name if self.patient else "Unknown Patient"
        test = self.test_type.name if self.test_type else "Unknown Test"
        return f"{patient} - {test}"
