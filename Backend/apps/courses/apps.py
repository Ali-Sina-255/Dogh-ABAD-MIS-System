from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class CoursesConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.courses"
    verbose_name = _("Courses")

    def ready(self):
        import apps.courses.signals  # noqa: F401
