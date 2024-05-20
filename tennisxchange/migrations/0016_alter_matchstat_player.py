# Generated by Django 5.0.4 on 2024-05-12 08:05

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tennisxchange', '0015_alter_matchstat_stat_type_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='matchstat',
            name='player',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='stats', to='tennisxchange.giocatore', verbose_name='Giocatore'),
        ),
    ]
