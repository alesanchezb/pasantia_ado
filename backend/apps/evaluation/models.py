from django.db import models
from django.conf import settings

class Contest(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    active = models.BooleanField(default=True)
    
    # Evaluadores asignados a este concurso
    evaluators = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='contests_evaluated',
        blank=True
    )

    def __str__(self):
        return self.title


class Application(models.Model):
    contest = models.ForeignKey(Contest, on_delete=models.CASCADE, related_name='applications')
    applicant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='applications')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('contest', 'applicant')

    def __str__(self):
        return f"{self.applicant} - {self.contest}"

class Evaluation(models.Model):
    STATUS_DRAFT = 'DRAFT'
    STATUS_COMPLETED = 'COMPLETED'
    STATUS_CHOICES = [
        (STATUS_DRAFT, 'Borrador'),
        (STATUS_COMPLETED, 'Completada'),
    ]

    evaluator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='evaluations_made'
    )
    applicant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='evaluations_received'
    )
    contest = models.ForeignKey(
        Contest,
        on_delete=models.CASCADE,
        related_name='evaluations',
        null=True, 
        blank=True 
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_DRAFT
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('evaluator', 'applicant', 'contest')

    def __str__(self):
        return f"Evaluación de {self.evaluator} a {self.applicant}"


class EvaluationScore(models.Model):
    evaluation = models.ForeignKey(
        Evaluation,
        on_delete=models.CASCADE,
        related_name='scores'
    )
    # unique_key corresponde a lo que el frontend manda como "I._1_col_A"
    unique_key = models.CharField(max_length=100)
    
    # El valor numérico. Si es radio, será 0 o 1. Si es input number, el valor.
    value = models.FloatField(default=0)

    class Meta:
        # Evitar duplicados para la misma celda en la misma evaluación
        unique_together = ('evaluation', 'unique_key')

    def __str__(self):
        return f"{self.unique_key}: {self.value}"
