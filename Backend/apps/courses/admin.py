from django.contrib import admin

from .models import (
    Book,
    Card,
    CardConfig,
    Certificate,
    Enrollment,
    EnrollmentPayment,
    Student,
    StudentClasses,
)

admin.site.register(Book)
admin.site.register(Card)
admin.site.register(Certificate)
admin.site.register(EnrollmentPayment)

admin.site.register(Student)


# admin.py


@admin.register(StudentClasses)
class StudentClassesAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "display_teachers",
        "course_fee",
        "day",
        "period",
        "start_time",
        "duration_months",
        "is_active",
        "jalali_month",
        "student_count",
    )
    list_filter = ("day", "period", "is_active", "duration_months")
    search_fields = ("name", "teachers__first_name", "teachers__last_name")

    filter_horizontal = ("teachers",)  # makes ManyToMany selection easier

    def display_teachers(self, obj):
        return ", ".join([f"{t.first_name} {t.last_name}" for t in obj.teachers.all()])

    display_teachers.short_description = "Teachers"

    def student_count(self, obj):
        return obj.student_count()

    student_count.short_description = "Number of Students"


class EnrollmentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "student",
        "student_class",
        "course_fee",
        "total_fee",
        "paid_amount",
        "re_amount",
        "status",
        "jalali_month",
    )
    list_filter = ("status", "student_class", "jalali_month")
    search_fields = ("student__name", "student__father_name", "note")
    readonly_fields = ("course_fee", "total_fee")

    filter_horizontal = ("books",)  # allows selecting multiple books easily

    fieldsets = (
        (
            "Student & Class Info",
            {"fields": ("student", "student_class", "status", "jalali_month")},
        ),
        (
            "Financial Info",
            {"fields": ("course_fee", "total_fee", "paid_amount", "re_amount", "card")},
        ),
        ("Books & Notes", {"fields": ("books", "note")}),
        ("Dates", {"fields": ("start_month",)}),
    )

    def save_model(self, request, obj, form, change):
        """
        Ensure fees are recalculated when saving in admin.
        """
        if not change:  # only on create
            if obj.card is None:
                obj.card = Card.objects.create()
        super().save_model(request, obj, form, change)


# Register
admin.site.register(Enrollment, EnrollmentAdmin)


@admin.register(CardConfig)
class CardConfigAdmin(admin.ModelAdmin):
    list_display = ("price", "updated_at")

    def has_add_permission(self, request):
        return not CardConfig.objects.exists()
