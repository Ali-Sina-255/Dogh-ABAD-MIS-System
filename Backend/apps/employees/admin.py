from django.contrib import admin

from .models import Employee, TeacherLevel, TeacherSalaryRule

admin.site.register(Employee)


@admin.register(TeacherLevel)
class TeacherLevelAdmin(admin.ModelAdmin):
    list_display = ("id", "name")


@admin.register(TeacherSalaryRule)
class TeacherSalaryRuleAdmin(admin.ModelAdmin):
    list_display = (
        "teacher_level",
        "min_students",
        "max_students",
        "salary_amount",
    )
    list_filter = ("teacher_level",)
