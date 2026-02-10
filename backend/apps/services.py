import csv
from pathlib import Path
from django.conf import settings
from .profiles.models import Profile, Evidence


def load_criterios():
    path = Path(settings.BASE_DIR) / "static/evaluation/criterios.csv"
    with open(path, encoding="utf-8") as f:
        return list(csv.DictReader(f))


class ProfileService:
    @staticmethod
    def get_or_create_profile(user):
        """
        Retrieves a user's profile, creating one if it doesn't exist.
        """
        profile, _ = Profile.objects.get_or_create(user=user)
        return profile


class EvidenceService:
    @staticmethod
    def get_evidences_for_profile(profile: Profile):
        """
        Retrieves all evidences for a given profile.
        """
        return Evidence.objects.filter(profile=profile).order_by("-created_at")

    @staticmethod
    def create_evidence(profile: Profile, name: str, kind: str, file) -> Evidence:
        """
        Creates a new evidence for a profile.
        """
        return Evidence.objects.create(profile=profile, name=name, kind=kind, file=file)

    @staticmethod
    def delete_evidence(profile: Profile, evidence_id: int) -> bool:
        """
        Deletes an evidence record and its associated file.
        Returns True if deleted, False otherwise.
        """
        try:
            evidence = Evidence.objects.get(id=evidence_id, profile=profile)
            evidence.file.delete(save=False)  # Delete file from storage
            evidence.delete()  # Delete the model instance
            return True
        except Evidence.DoesNotExist:
            return False
