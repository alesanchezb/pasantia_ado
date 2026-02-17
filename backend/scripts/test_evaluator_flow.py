
import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from apps.profiles.models import Profile
from apps.evaluation.models import Contest

User = get_user_model()

def run():
    # 1. Setup Admin
    admin_user, _ = User.objects.get_or_create(username="admin_test")
    Profile.objects.update_or_create(user=admin_user, defaults={"role": "ADMIN"})
    
    client = APIClient()
    client.force_authenticate(user=admin_user)

    # 2. Create Evaluator via API
    print("Creating Evaluator...")
    eval_data = {
        "username": "evaluator_test",
        "password": "password123",
        "email": "evaluator@test.com",
        "full_name": "Test Evaluator"
    }
    # Clean up first
    User.objects.filter(username="evaluator_test").delete()
    
    response = client.post("/api/evaluation/admin/create-evaluator/", eval_data)
    if response.status_code != 201:
        print(f"Failed to create evaluator: {response.content}")
        return
    
    evaluator_user = User.objects.get(username="evaluator_test")
    print(f"Evaluator created. Role: {evaluator_user.profile.role}")

    # 3. Create Contest and Assign Evaluator
    print("Creating Contest...")
    contest_data = {
        "title": "Test Contest",
        "description": "Description",
        "active": True,
        "evaluators": [evaluator_user.id] # Passing list of IDs
    }
    
    response = client.post("/api/evaluation/admin/contests/", contest_data)
    if response.status_code != 201:
        print(f"Failed to create contest: {response.content}")
        return
    
    contest_id = response.data['id']
    print(f"Contest created with ID: {contest_id}")
    
    contest = Contest.objects.get(id=contest_id)
    print(f"Evaluators assigned in DB: {list(contest.evaluators.all())}")

    # 4. List Contests as Evaluator
    print("Listing Contests as Evaluator...")
    client.force_authenticate(user=evaluator_user)
    response = client.get("/api/evaluation/evaluator/contests/")
    
    if response.status_code == 200:
        print(f"Contests found for evaluator: {response.data}")
    else:
        print(f"Failed to list contests: {response.content}")

if __name__ == "__main__":
    run()
