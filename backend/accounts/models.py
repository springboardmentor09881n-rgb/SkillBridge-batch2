from django.contrib.auth.models import AbstractUser
from django.db import models
from django_mongodb_backend.fields import ObjectIdAutoField

class User(AbstractUser):
    id = ObjectIdAutoField(primary_key=True)

    ROLE_CHOICES = (
        ('Volunteer', 'Volunteer'),
        ('NGO / Organization', 'NGO / Organization'),
    )

    full_name = models.CharField(max_length=255, blank=True, null=True)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES)
    location = models.CharField(max_length=255, blank=True, null=True)
    organization_name = models.CharField(max_length=255, blank=True, null=True)
    organization_description = models.TextField(blank=True, null=True)
    website_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.username
