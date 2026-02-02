from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions

schema_view = get_schema_view(
    openapi.Info(
        title="Hadaf Educationl MIS system Backend APIs",
        default_version="v1",
        description=(
            "This is the API documentation for Hadaf LMS project APIs.\n\n"
            "Contacts:\n"
            "- Ali Sina Sultani: alisinasultani@gmail.com\n"
        ),
        contact=openapi.Contact(email="alisinasultani@gmail.com"),
        license=openapi.License(name="MIT"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)


urlpatterns = [
    path(
        "swagger<format>/", schema_view.without_ui(cache_timeout=0), name="schema-json"
    ),
    path("", schema_view.with_ui("swagger", cache_timeout=0), name="schema-swagger-ui"),
    path("redoc/", schema_view.with_ui("redoc", cache_timeout=0), name="schema-redoc"),
    path(settings.ADMIN_URL, admin.site.urls),
    path("users/", include("apps.users.urls")),
    path("employee/", include("apps.employees.urls")),
    path("courses/", include("apps.courses.urls")),
    path("payment/", include("apps.finance.urls")),
    path("core/", include("apps.core.urls")),
]
admin.site.site_header = "Hadaf Admin"
admin.site.site_title = "Hadaf Admin Area."
admin.site.index_title = "Welcome to the Hadaf administration "

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
