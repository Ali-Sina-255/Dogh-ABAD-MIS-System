from django.contrib import admin

from .models import User, UserProfile


class AdminUser(admin.ModelAdmin):
    list_display = ["id", "email"]


admin.site.register(User, AdminUser)
admin.site.register(UserProfile)
