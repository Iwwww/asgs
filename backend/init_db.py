#!/bin/env python3
import os

from django.core.management import django, call_command

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "asgs.settings")
django.setup()

from django.contrib.auth import get_user_model

ExtendedUser = get_user_model()

# Creating superuser
if not ExtendedUser.objects.filter(is_superuser=True).exists():
    call_command("createsuperuser", "--noinput")
    print("Superuser created successfully.")
else:
    print("Superuser already exists.")
