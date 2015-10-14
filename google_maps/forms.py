# -*- coding: utf-8 -*-
from django import forms
from django.forms import ModelForm

from google_maps.models import Path, Report


class AddPath(ModelForm):

    class Meta:
        model = Path
        exclude = [
                    'user',
                  ]


class AddReport(ModelForm):

    class Meta:
        model = Report
        exclude = [
                    'path',
                    'pub_date',
                    'is_reported',
                  ]
