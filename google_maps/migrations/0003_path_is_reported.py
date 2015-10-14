# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('google_maps', '0002_report_pub_date'),
    ]

    operations = [
        migrations.AddField(
            model_name='path',
            name='is_reported',
            field=models.BooleanField(default=False),
        ),
    ]
