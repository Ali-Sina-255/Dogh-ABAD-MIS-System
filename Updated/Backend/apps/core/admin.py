from apps.core import models
from django.contrib import admin

admin.site.register(models.CategoryType)
admin.site.register(models.Patient)
admin.site.register(models.StaffType)
admin.site.register(models.Staff)
admin.site.register(models.Stock)
admin.site.register(models.Pharmaceutical)
admin.site.register(models.DailyExpense)
admin.site.register(models.TakenPrice)
