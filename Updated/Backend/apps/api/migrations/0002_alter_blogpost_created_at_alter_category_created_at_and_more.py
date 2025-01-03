# Generated by Django 5.1.2 on 2024-11-28 10:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='blogpost',
            name='created_at',
            field=models.DateField(auto_now_add=True, verbose_name='Blog Post Created Date'),
        ),
        migrations.AlterField(
            model_name='category',
            name='created_at',
            field=models.DateField(auto_now_add=True, verbose_name='Category Created Date'),
        ),
        migrations.AlterField(
            model_name='order',
            name='created_at',
            field=models.DateField(auto_now_add=True, verbose_name='Order Created Date'),
        ),
        migrations.AlterField(
            model_name='postcategory',
            name='created_at',
            field=models.DateField(auto_now_add=True, verbose_name='Category Created Date'),
        ),
    ]
