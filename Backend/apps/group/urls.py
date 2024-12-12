from django.urls import path

from .views import (
    AttributeChoiceDetailView,
    AttributeChoiceListCreateView,
    AttributeTypeDetailView,
    AttributeTypeListCreateView,
    AttributeValueDetailView,
    AttributeValueListCreateView,
    CategoryAttributeView,
    CategoryDetailView,
    CategoryListCreateView,
)

urlpatterns = [
    path("categories/", CategoryListCreateView.as_view(), name="category-list-create"),
    path("categories/<int:pk>/", CategoryDetailView.as_view(), name="category-detail"),
    path(
        "attribute-values/",
        AttributeValueListCreateView.as_view(),
        name="attribute-value-list-create",
    ),
    path(
        "attribute-values/<int:pk>/",
        AttributeValueDetailView.as_view(),
        name="attribute-value-detail",
    ),
    path(
        "attribute-choices/",
        AttributeChoiceListCreateView.as_view(),
        name="attribute-choice-list-create",
    ),
    path(
        "attribute-choices/<int:pk>/",
        AttributeChoiceDetailView.as_view(),
        name="attribute-choice-detail",
    ),
    path(
        "attribute-types/",
        AttributeTypeListCreateView.as_view(),
        name="attribute-type-list-create",
    ),
    path(
        "attribute-types/<int:pk>/",
        AttributeTypeDetailView.as_view(),
        name="attribute-type-detail",
    ),
    path(
        "category/attribute/<int:category_id>/",
        CategoryAttributeView.as_view(),
        name="category-attributes",
    ),
]
