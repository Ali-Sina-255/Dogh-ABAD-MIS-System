from decimal import Decimal

from django.db.models import Sum
from django.db.models.signals import m2m_changed
from django.dispatch import receiver

from .models import Enrollment


@receiver(m2m_changed, sender=Enrollment.books.through)
def update_total_fee(sender, instance, action, **kwargs):
    if action in ("post_add", "post_remove", "post_clear"):
        books_total = instance.books.aggregate(total=Sum("price"))["total"] or Decimal(
            "0.00"
        )

        card_price = instance.card.price if instance.card else Decimal("0.00")

        instance.total_fee = (
            card_price + books_total + (instance.course_fee or Decimal("0.00"))
        )

        instance.save(update_fields=["total_fee"])
