from datetime import timedelta
from django.utils import timezone

today = timezone.now().date()

daily_start = today
weekly_start = today - timedelta(days=7)
monthly_start = today.replace(day=1)
