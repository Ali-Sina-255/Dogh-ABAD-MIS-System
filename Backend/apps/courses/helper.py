from datetime import date

import jdatetime

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


def get_jalali_month_from_dates(gregorian_date):
    if not gregorian_date:
        return ""
    jalali_date = jdatetime.date.fromgregorian(date=gregorian_date)
    return PERSIAN_MONTHS[jalali_date.month - 1]


def jalali_to_gregorian_start(j_year, j_month):
    j_date = jdatetime.date(j_year, j_month, 1)
    g_date = j_date.togregorian()
    return date(g_date.year, g_date.month, g_date.day)
