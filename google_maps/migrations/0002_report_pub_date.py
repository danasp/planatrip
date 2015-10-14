# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import datetime
from django.utils.timezone import utc


class Migration(migrations.Migration):

    dependencies = [
        ('google_maps', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='report',
            name='pub_date',
            field=models.DateField(default=datetime.datetime(2015, 7, 13, 19, 10, 40, 759199, tzinfo=utc), auto_now_add=True),
            preserve_default=False,
        ),
    ]
