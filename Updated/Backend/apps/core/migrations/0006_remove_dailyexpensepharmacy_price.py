# Generated by Django 5.1.2 on 2024-12-12 11:24

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0005_dailyexpensepharmacy'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='dailyexpensepharmacy',
            name='price',
        ),
    ]