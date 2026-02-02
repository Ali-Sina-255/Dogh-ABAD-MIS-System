from django_filters.rest_framework import CharFilter, FilterSet

from .models import BlogPost


class BlogFilter(FilterSet):
    title = CharFilter(lookup_expr="icontains")
    description = CharFilter(lookup_expr="exact")
    category_id = CharFilter(field_name="category__id", lookup_expr="exact")
    category_name = CharFilter(
        field_name="category__category_name", lookup_expr="icontains"
    )

    class Meta:
        model = BlogPost
        fields = ["title", "description", "category_id", "category_name"]
