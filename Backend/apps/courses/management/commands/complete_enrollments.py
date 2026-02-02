from apps.courses.services.enrollment_service import complete_finished_enrollments
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Complete finished enrollments"

    def handle(self, *args, **kwargs):
        complete_finished_enrollments()
        self.stdout.write(self.style.SUCCESS("Enrollments updated successfully"))
