from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):

    user = models.OneToOneField(User, unique=True);
    email = models.EmailField(max_length=254);
