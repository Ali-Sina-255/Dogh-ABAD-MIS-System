from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Pharmaceutical, PharmaceuticalDrug, Stock


@receiver(post_save, sender=Pharmaceutical)
def decrease_stock(sender, instance, created, **kwargs):
    if created:
        # Loop through the related drugs using the through model
        for pd in instance.pharmaceuticaldrug_set.all():
            stock = pd.drug  # Stock instance
            stock.amount -= pd.amount_used
            stock.save()
