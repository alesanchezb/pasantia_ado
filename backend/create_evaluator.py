import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from apps.profiles.models import Profile

def create_evaluator():
    username = "evaluador1"
    password = "password123"
    
    if User.objects.filter(username=username).exists():
        print(f"User {username} already exists.")
        user = User.objects.get(username=username)
    else:
        print(f"Creating user {username}...")
        user = User.objects.create_user(username=username, password=password)
    
    profile, created = Profile.objects.get_or_create(user=user)
    
    if profile.role != Profile.ROLE_EVALUATOR:
        print(f"Updating role for {username} to EVALUATOR...")
        profile.role = Profile.ROLE_EVALUATOR
        profile.save()
    else:
        print(f"User {username} is already an EVALUATOR.")
        
    print(f"Done. Credentials: {username} / {password}")

if __name__ == "__main__":
    create_evaluator()
