from rest_framework import serializers
from .models import Evaluation, EvaluationScore
from apps.profiles.serializers import ProfileSerializer # Asumiendo que existe, sino usaremos User

class EvaluationScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvaluationScore
        fields = ['unique_key', 'value']

class EvaluationSerializer(serializers.ModelSerializer):
    scores = EvaluationScoreSerializer(many=True, read_only=True)
    
    class Meta:
        model = Evaluation
        fields = ['id', 'evaluator', 'applicant', 'status', 'created_at', 'updated_at', 'scores']
        read_only_fields = ['evaluator', 'created_at', 'updated_at']

class SaveEvaluationSerializer(serializers.Serializer):
    applicant_id = serializers.IntegerField()
    status = serializers.ChoiceField(choices=Evaluation.STATUS_CHOICES, default=Evaluation.STATUS_DRAFT)
    scores = serializers.DictField(
        child=serializers.FloatField(),
        help_text="Un diccionario donde las claves son los IDs únicos del frontend y los valores son los puntajes."
    )
