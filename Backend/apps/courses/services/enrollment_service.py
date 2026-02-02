# courses/services/enrollment_service.py

from apps.courses.models import Enrollment
from dateutil.relativedelta import relativedelta
from django.utils import timezone


def complete_finished_enrollments():
    today = timezone.localdate()
    enrollments = Enrollment.objects.filter(status="active")

    for e in enrollments:
        end_date = e.start_month + relativedelta(months=e.student_class.duration_months)
        if end_date <= today:
            e.status = "completed"
            e.save(update_fields=["status"])
