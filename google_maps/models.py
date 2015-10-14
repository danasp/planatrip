# -*- coding: utf-8 -*-
from django.db import models
from django.contrib.auth.models import User


class Path(models.Model):

    user = models.ForeignKey(User)
    name = models.CharField(max_length='200')
    route_data = models.TextField()
    #route_text_disp = models.TextField()
    is_reported = models.BooleanField(default=False)

    def __unicode__(self):
        return self.name


class Report(models.Model):

    path = models.ForeignKey(Path)
    title = models.CharField(max_length='200')
    report = models.TextField()
    pub_date = models.DateField(auto_now_add=True)

    def __unicode__(self):
        return self.title