from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Evaluation, EvaluationScore, Contest, Application
from apps.profiles.serializers import ProfileSerializer

User = get_user_model()

class EvaluationScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvaluationScore
        fields = ['unique_key', 'value']

class EvaluationSerializer(serializers.ModelSerializer):
    scores = EvaluationScoreSerializer(many=True, read_only=True)
    contest_title = serializers.CharField(source='contest.title', read_only=True)
    
    class Meta:
        model = Evaluation
        fields = ['id', 'evaluator', 'applicant', 'status', 'created_at', 'updated_at', 'scores', 'contest_title']
        read_only_fields = ['evaluator', 'created_at', 'updated_at']

class SaveEvaluationSerializer(serializers.Serializer):
    applicant_id = serializers.IntegerField()
    contest_id = serializers.IntegerField(required=False, allow_null=True)
    status = serializers.ChoiceField(choices=Evaluation.STATUS_CHOICES, default=Evaluation.STATUS_DRAFT)
    scores = serializers.DictField(
        child=serializers.FloatField(),
        help_text="Un diccionario donde las claves son los IDs únicos del frontend y los valores son los puntajes."
    )

class ContestSerializer(serializers.ModelSerializer):
    evaluators_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Contest
        fields = ['id', 'title', 'description', 'created_at', 'active', 'evaluators', 'evaluators_details']
        read_only_fields = ['created_at', 'evaluators_details']
        extra_kwargs = {
            'evaluators': {'write_only': True}
        }

    def get_evaluators_details(self, obj):
        # Retorna info básica de los evaluadores
        users = obj.evaluators.all()
        return [{"id": u.id, "username": u.username, "email": u.email} for u in users]

class ApplicationSerializer(serializers.ModelSerializer):
    contest_title = serializers.CharField(source='contest.title', read_only=True)
    applicant_name = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = ['id', 'contest', 'contest_title', 'applicant', 'applicant_name', 'created_at']
        read_only_fields = ['created_at']

    def get_applicant_name(self, obj):
        # Intenta obtener el nombre completo del perfil, o usa el username
        try:
            return obj.applicant.profile.full_name or obj.applicant.username
        except:
            return obj.applicant.username

class CreateEvaluatorSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=False)
    full_name = serializers.CharField(required=False)

    def create(self, validated_data):
        username = validated_data['username']
        password = validated_data['password']
        email = validated_data.get('email', '')
        full_name = validated_data.get('full_name', '')

        # Crear Usuario
        user = User.objects.create_user(username=username, email=email, password=password)
        
        # Crear/Actualizar Perfil con rol evaluator
        # Asumiendo que Profile se crea por señal, lo buscamos.
        # Si no, lo creamos.
        from apps.profiles.models import Profile
        profile, _ = Profile.objects.get_or_create(user=user)
        profile.role = Profile.ROLE_EVALUATOR
        profile.full_name = full_name
        profile.save()
        
        return user
