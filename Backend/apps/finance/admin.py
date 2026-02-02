from django.contrib import admin

from .models import DailyExpense, Fine, Payroll, SalaryPayment

admin.site.register(Payroll)
admin.site.register(SalaryPayment)
admin.site.register(DailyExpense)


@admin.register(Fine)
class FineAdmin(admin.ModelAdmin):
    list_display = ("person", "note", "amount_paid", "created_at", "jalali_month")
    search_fields = ("person", "note", "jalali_month")
    list_filter = ("jalali_month", "created_at")
    ordering = ("-created_at",)


class FineInline(admin.TabularInline):
    model = Fine
    extra = 1  # Number of empty forms shown
    fields = ("person", "note", "amount_paid", "created_at", "jalali_month")
    readonly_fields = ("created_at", "jalali_month")  # Auto-calculated fields
    show_change_link = True
