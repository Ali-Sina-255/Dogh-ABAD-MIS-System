from django.contrib import admin

from .models import (
    CategoryType,
    LabTest,
    Patient,
    Pharmaceutical,
    PharmaceuticalDrug,
    StaffType,
    Stock,
    TestType,
)


# -------------------------------
# CategoryType Admin
# -------------------------------
@admin.register(CategoryType)
class CategoryTypeAdmin(admin.ModelAdmin):
    list_display = ("name", "created_at")
    search_fields = ("name",)
    ordering = ("-created_at",)


# -------------------------------
# StaffType Admin
# -------------------------------
@admin.register(StaffType)
class StaffTypeAdmin(admin.ModelAdmin):
    list_display = ("name", "created_at")
    search_fields = ("name",)


# -------------------------------
# Stock Admin
# -------------------------------
@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "price",
        "percentage",
        "total_price",
        "amount",
        "daily_used",
        "created_at",
    )
    search_fields = ("name",)
    list_filter = ("created_at",)
    ordering = ("-created_at",)


# -------------------------------
# PharmaceuticalDrug Inline (for Pharmaceutical)
# -------------------------------
class PharmaceuticalDrugInline(admin.TabularInline):
    model = PharmaceuticalDrug
    extra = 1


# -------------------------------
# Pharmaceutical Admin
# -------------------------------
@admin.register(Pharmaceutical)
class PharmaceuticalAdmin(admin.ModelAdmin):
    list_display = ("patient_name", "doctor_name", "price", "created_at")
    search_fields = ("patient_name__name", "doctor_name__username")
    list_filter = ("created_at",)
    inlines = [PharmaceuticalDrugInline]


# -------------------------------
# Patient Admin
# -------------------------------
@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ("name", "age", "patient_type", "category", "created_at")
    search_fields = ("name", "patient_type")
    list_filter = ("category", "created_at")


# -------------------------------
# TestType Admin
# -------------------------------
@admin.register(TestType)
class TestTypeAdmin(admin.ModelAdmin):
    list_display = ("name", "date")
    search_fields = ("name",)


# -------------------------------
# LabTest Admin
# -------------------------------
@admin.register(LabTest)
class LabTestAdmin(admin.ModelAdmin):
    list_display = ("patient", "test_type", "price", "refer_to", "date")
    search_fields = ("patient__name", "refer_to")
    list_filter = ("test_type", "date")
