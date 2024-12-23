from django.contrib.auth import get_user_model
from django.db import models

class CategoryType(models.Model):
    User = get_user_model()
    name = models.CharField(max_length=300)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.name


class StaffType(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.name


class Stock(models.Model):
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    percentage = models.DecimalField(max_digits=12, decimal_places=2)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    amount = models.IntegerField(default=0.00)
    daily_used = models.IntegerField(default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Pharmaceutical(models.Model):
    User = get_user_model()
    doctor_name = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True
    )
    patient_name = models.ForeignKey("Patient", on_delete=models.CASCADE)
    copy = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.patient_name.name


class Patient(models.Model):
    name = models.CharField(max_length=255)
    age = models.IntegerField(null=True, blank=True)
    patient_type = models.CharField(max_length=255)
    category = models.ForeignKey(CategoryType, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.name


class Staff(models.Model):
    Other = 0
    Doctor = 1
    Reception = 2
    ROLE_CHOICES = (
        (Doctor, "Doctor"),
        (Reception, "Reception"),
        (Other, "Other"))
    
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255, default='Unknown')  # Default 'Unknown' for last_name
    email = models.EmailField(max_length=255, unique=True, default='noemail@domain.com')  # Default email
    role = models.PositiveSmallIntegerField(choices=ROLE_CHOICES, blank=True, null=True)
    phone_number = models.CharField(max_length=13, blank=True, null=True)
    position = models.ForeignKey(CategoryType, on_delete=models.SET_NULL, null=True)
    salary = models.DecimalField(max_digits=10, decimal_places=2)
    stared_date = models.DateTimeField(auto_now_add=True)
 
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.first_name + ' ' + self.last_name


class DailyExpense(models.Model):
    name = models.CharField(max_length=255)
    salary = models.DecimalField(max_digits=10, decimal_places=2)
    who = models.CharField(max_length=255)
    totla_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.name


class TakenPrice(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - ({self.description[:50]}"


class DailyExpensePharmacy(models.Model):
    name = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)