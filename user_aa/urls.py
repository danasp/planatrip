from django.conf.urls import include, url, patterns
from django.contrib import admin
#from django.contrib.auth import views as auth_views
from django.core.urlresolvers import reverse

import views

urlpatterns = [

    url(r'^signin/$', views.login, name='login'),
    url(r'^signout/$', views.logout, name='logout'),
    url(r'^join/$', views.join, name='join'),
    #url('^', include('django.contrib.auth.urls')),
]