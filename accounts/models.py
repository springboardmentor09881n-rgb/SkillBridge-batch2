from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('Volunteer', 'Volunteer'),
        ('ngo', 'NGO'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    skills = models.JSONField(blank=True, null=True)
    location = models.CharField(max_length=100, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)

    organization_name = models.CharField(max_length=255, blank=True, null=True)
    organization_description = models.TextField(blank=True, null=True)
    website_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.username