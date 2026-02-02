from datetime import date

import jdatetime
from dateutil.relativedelta import relativedelta
from django.utils import timezone

AFGHAN_MONTHS_DICT = [
    (1, "حمل"),
    (2, "ثور"),
    (3, "جوزا"),
    (4, "سرطان"),
    (5, "اسد"),
    (6, "سنبله"),
    (7, "میزان"),
    (8, "عقرب"),
    (9, "قوس"),
    (10, "جدی"),
    (11, "دلو"),
    (12, "حوت"),
]


PERSIAN_MONTHS = [
    "حمل",
    "ثور",
    "جوزا",
    "سرطان",
    "اسد",
    "سنبله",
    "میزان",
    "عقرب",
    "قوس",
    "جدی",
    "دلو",
    "حوت",
]


def get_jalali_month_from_date(gregorian_date):
    """
    Converts a Gregorian date to its Jalali month in Persian script.

    Usage:
        get_jalali_month_from_date(enrollment.start_month)
    """
    if not gregorian_date:
        return ""
    jalali_date = jdatetime.date.fromgregorian(date=gregorian_date)
    return PERSIAN_MONTHS[jalali_date.month - 1]


def get_jalali_month_for_enrollment(enrollment):
    """
    Returns the Jalali month name for a given Enrollment instance.

    Usage:
        get_jalali_month_for_enrollment(enrollment)
    """
    return get_jalali_month_from_date(enrollment.start_month)


def get_next_month_date(reference_date=None):
    """
    Returns the first day of the next month based on reference_date.
    If reference_date is None, uses today.
    """
    today = reference_date or date.today()
    if today.month == 12:
        return date(today.year + 1, 1, 1)
    else:
        return date(today.year, today.month + 1, 1)


def complete_expired_enrollments():
    today = timezone.localdate()

    active_enrollments = Enrollment.objects.filter(status="active")  # noqa: F821

    for e in active_enrollments:
        end_date = e.start_month + relativedelta(months=e.student_class.duration_months)
        if end_date <= today:
            e.status = "completed"
            e.save(update_fields=["status"])
