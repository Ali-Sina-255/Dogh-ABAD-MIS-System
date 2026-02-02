import jdatetime
from django.utils import timezone

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


def get_current_jalali_month():
    today_gregorian = timezone.localdate()
    today_jalali = jdatetime.date.fromgregorian(date=today_gregorian)
    return PERSIAN_MONTHS[today_jalali.month - 1]


def get_next_jalali_month(current_month):
    idx = PERSIAN_MONTHS.index(current_month)
    return PERSIAN_MONTHS[(idx + 1) % 12]


def jalali_month_from_jdate(jalali_date):
    """
    jalali_date: jdatetime.date
    """
    return PERSIAN_MONTHS[jalali_date.month - 1]


def add_jalali_months(jdate, months):
    year = jdate.year + (jdate.month - 1 + months) // 12
    month = (jdate.month - 1 + months) % 12 + 1
    return jdatetime.date(year, month, 1)


JALALI_MONTHS_FA = {
    1: "حمل",
    2: "ثور",
    3: "جوزا",
    4: "سرطان",
    5: "اسد",
    6: "سنبله",
    7: "میزان",
    8: "عقرب",
    9: "قوس",
    10: "جدی",
    11: "دلو",
    12: "حوت",
}


def jalali_month_name(jdate):
    return PERSIAN_MONTHS[jdate.month - 1]
