from django.db import models
from django.conf import settings

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
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_DRAFT
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('evaluator', 'applicant')

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
