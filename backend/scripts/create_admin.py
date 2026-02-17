
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.contrib.auth import get_user_model
from apps.profiles.models import Profile

User = get_user_model()

try:
    if not User.objects.filter(username="admin").exists():
        print("Creating superuser 'admin' with password 'admin'...")
        user = User.objects.create_superuser("admin", "admin@example.com", "admin")
        
        # Ensure profile exists and has role
        profile, created = Profile.objects.get_or_create(user=user)
        # Assuming we might want a ROLE_ADMIN in the future, but for now Profile might not have it or it defaults.
        # Let's check Profile model to see available roles.
        print(f"User admin created. Profile role: {profile.role}")
    else:
        print("User 'admin' already exists.")

except Exception as e:
    print(f"Error: {e}")
