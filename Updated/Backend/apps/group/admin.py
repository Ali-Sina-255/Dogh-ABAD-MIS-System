from django.contrib import admin

from .models import AttributeChoice, AttributeType, AttributeValue, Category

admin.site.register(AttributeChoice)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "created_at",
        "updated_at",
    )
    search_fields = (
        "name",
        "category_type",
    )


@admin.register(AttributeType)
class AttributeTypeAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "attribute_type", "created_at", "updated_at")
    search_fields = ("name", "category__name")


@admin.register(AttributeValue)
class AttributeValueAdmin(admin.ModelAdmin):
    list_display = ("attribute_value", "attribute", "created_at", "updated_at")
    search_fields = ("name", "attribute_value__name")
