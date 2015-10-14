# -*- coding: utf-8 -*-
from django.conf.urls import include, url, patterns
from django.contrib import admin

import views

urlpatterns = [
    
    url(r'^add_path/$', views.add_path, name='add_path'),
    url(r'^my_paths/$', views.my_paths, name='my_paths'),
    url(r'^retrieve_path/(?P<user>\w+)/(?P<pathId>\d+)/$', views.retrieve_path, name='retrieve_path'),
    url(r'^add_report/(?P<pathId>\d+)/$', views.add_report, name='add_report'),
    url(r'^get_report/(?P<pathId>\d+)/$', views.get_report, name='get_report'),
    url(r'^info/$', views.info, name='info'),
    url(r'^$', views.index, name='index'),
]
