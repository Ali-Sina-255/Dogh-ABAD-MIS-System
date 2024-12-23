# Generated by Django 5.1.2 on 2024-12-07 12:13

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('group', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='attributevalue',
            name='name',
        ),
        migrations.AddField(
            model_name='attributevalue',
            name='attribute',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to='group.attributetype'),
        ),
        migrations.AddField(
            model_name='attributevalue',
            name='type',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='group.attributechoice'),
        ),
        migrations.AlterField(
            model_name='attributevalue',
            name='attribute_value',
            field=models.CharField(max_length=255),
        ),
    ]
