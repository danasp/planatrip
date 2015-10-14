# -*- coding: utf-8 -*-
from django import forms
from django.forms import ModelForm
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm

from google_maps.models import Path, Report


class Join(UserCreationForm):

    class Meta:
        model = User
        exclude = [
                    'is_staff',
                    'is_active',
                    'date_joined',
                    'last_login',
                    'is_superuser',
                    'first_name',
                    'last_name',
                    'groups',
                    'user_permissions',
                    'password',

                  ]

class Login(AuthenticationForm):
    pass