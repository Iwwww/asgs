# Generated by Django 5.0.6 on 2024-09-04 16:15

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0009_alter_productorder_quantity'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='salepoint',
            name='product_orders',
        ),
        migrations.AddField(
            model_name='productorder',
            name='sale_point',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.PROTECT, to='core.salepoint'),
            preserve_default=False,
        ),
    ]
