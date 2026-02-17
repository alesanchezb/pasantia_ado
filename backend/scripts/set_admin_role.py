
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.contrib.auth import get_user_model
from apps.profiles.models import Profile

User = get_user_model()

try:
    user = User.objects.get(username="admin")
    profile = user.profile
    profile.role = Profile.ROLE_ADMIN
    profile.save()
    print(f"Updated user 'admin' with role: {profile.role}")

except Exception as e:
    print(f"Error: {e}")
