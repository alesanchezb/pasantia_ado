from django.conf import settings
from django.db import models


class Profile(models.Model):
    ROLE_APPLICANT = "APPLICANT"
    ROLE_EVALUATOR = "EVALUATOR"
    ROLE_ADMIN = "ADMIN"

    ROLE_CHOICES = [
        (ROLE_APPLICANT, "Solicitante"),
        (ROLE_EVALUATOR, "Evaluador"),
        (ROLE_ADMIN, "Administrador"),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_APPLICANT)
    full_name = models.CharField(max_length=255, blank=True, default="")
    phone = models.CharField(max_length=50, blank=True, default="")
    department = models.CharField(max_length=255, blank=True, default="")
    summary = models.TextField(blank=True, default="")

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user_id} - {self.full_name or self.user.username}"


def evidence_upload_to(instance, filename: str) -> str:
    return f"evidences/user_{instance.profile.user_id}/{filename}"


class Evidence(models.Model):
    # --- NUEVO: Opciones para el origen del documento ---
    SOURCE_UPLOAD = "UPLOAD"
    SOURCE_PORTAL = "PORTAL"
    SOURCE_CHOICES = [
        (SOURCE_UPLOAD, "Subido por usuario"),
        (SOURCE_PORTAL, "Documento del portal"),
    ]

    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="evidences")
    name = models.CharField(max_length=255)
    kind = models.CharField(max_length=80, blank=True, default="")  # ej: "titulo", "constancia", etc.
    file = models.FileField(upload_to=evidence_upload_to)
    
    source = models.CharField(
        max_length=20, 
        choices=SOURCE_CHOICES, 
        default=SOURCE_UPLOAD
    )

    # --- NUEVOS CAMPOS PARA ESTADO DE REVISIÓN ---
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, # Si se borra el evaluador, no se borra la evidencia
        null=True,
        blank=True,
        related_name="reviewed_evidences"
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    # --- FIN DE NUEVOS CAMPOS ---

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.profile_id} - {self.name}"
