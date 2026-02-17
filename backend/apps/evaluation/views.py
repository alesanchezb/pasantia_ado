from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.db import transaction
from django.shortcuts import get_object_or_404
from .models import Evaluation, EvaluationScore, Contest, Application
from .serializers import (
    EvaluationSerializer, SaveEvaluationSerializer, 
    ContestSerializer, ApplicationSerializer, CreateEvaluatorSerializer
)
from apps.profiles.models import Evidence, Profile
from apps.profiles.serializers import EvidenceSerializer
from django.contrib.auth import get_user_model
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

User = get_user_model()

@method_decorator(csrf_exempt, name='dispatch')
class SaveEvaluationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        applicant_id = request.data.get('applicant_id')
        contest_id = request.data.get('contest_id')
        scores_data = request.data.get('scores', {})
        status_val = request.data.get('status', Evaluation.STATUS_DRAFT)

        if not applicant_id:
            return Response({"error": "applicant_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Buscar o crear la evaluación
        # unique_together es (evaluator, applicant, contest)
        # Si contest_id es None, busca donde contest es None
        
        evaluation, created = Evaluation.objects.get_or_create(
            evaluator=request.user,
            applicant_id=applicant_id,
            contest_id=contest_id
        )

        evaluation.status = status_val
        evaluation.save()

        # Guardar los puntajes
        # Estrategia: Borrar los anteriores y crear nuevos, o update_or_create uno por uno.
        # Dado que pueden ser muchos, update_or_create es más seguro pero más lento.
        # Si asumimos que manda TODO el estado, podríamos borrar y recrear.
        # Vamos con update_or_create para ser amigables con parciales.

        with transaction.atomic():
            for key, val in scores_data.items():
                EvaluationScore.objects.update_or_create(
                    evaluation=evaluation,
                    unique_key=key,
                    defaults={'value': val}
                )

        return Response(EvaluationSerializer(evaluation).data)

class GetEvaluationView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = EvaluationSerializer

    def get(self, request, applicant_id):
        contest_id = request.query_params.get('contest_id')
        
        # Filtro base
        filters = {
            "evaluator": request.user,
            "applicant_id": applicant_id
        }
        if contest_id:
            filters["contest_id"] = contest_id
        else:
             filters["contest__isnull"] = True # Opcional: si no manda contest_id, busca la "general" o la primera?
             # Mejor: si contest_id viene, se usa. Si no, busca cualquiera o la null.
             # Para mantener compatibilidad con lo anterior (sin concursos), podemos quitar el filtro estricto contest__isnull=True 
             # si queremos que "sin contest_id" traiga la primera que encuentre. 
             # Pero dado el nuevo modelo, deberíamos ser estrictos. 
             # Asumiremos que si no hay contest_id, buscamos la que tenga contest=None.
             pass

        evaluation = Evaluation.objects.filter(**filters).first()
        
        # Obtener evidencias del postulante (las evidencias son globales del perfil por ahora)
        evidences = Evidence.objects.filter(profile__user_id=applicant_id)
        evidences_data = EvidenceSerializer(evidences, many=True).data

        # Serializar evaluación si existe
        if evaluation:
            evaluation_data = self.get_serializer(evaluation).data
        else:
            evaluation_data = {
                "status": Evaluation.STATUS_DRAFT,
                "scores": []
            }
        
        # Combinar respuesta
        return Response({
            **evaluation_data,
            "evidences": evidences_data
        })

# --- Admin Views ---

class CreateEvaluatorView(APIView):
    # TODO: Add specific permission IsAdmin
    permission_classes = [IsAuthenticated] 

    def post(self, request):
        serializer = CreateEvaluatorSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Evaluador creado correctamente"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ContestListCreateView(generics.ListCreateAPIView):
    # Admin creates, everyone can list? No, split logic or permissions
    # For MVP: Authenticated can list, but we want specific filters.
    permission_classes = [IsAuthenticated]
    queryset = Contest.objects.all().order_by('-created_at')
    serializer_class = ContestSerializer

class EvaluatorListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # List users with role EVALUATOR
        evaluators = User.objects.filter(profile__role=Profile.ROLE_EVALUATOR)
        return Response([{"id": u.id, "username": u.username, "full_name": u.profile.full_name} for u in evaluators])

# --- Applicant Views ---

class AvailableContestsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ContestSerializer

    def get_queryset(self):
        # Concursos activos
        return Contest.objects.filter(active=True).order_by('-created_at')

class MyApplicationsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ApplicationSerializer

    def get_queryset(self):
        return Application.objects.filter(applicant=self.request.user).order_by('-created_at')

class ApplyContestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, contest_id):
        contest = get_object_or_404(Contest, id=contest_id)
        # Check if already applied
        if Application.objects.filter(applicant=request.user, contest=contest).exists():
            return Response({"error": "Ya te has postulado a este concurso"}, status=status.HTTP_400_BAD_REQUEST)
        
        
        Application.objects.create(applicant=request.user, contest=contest)
        return Response({"message": "Postulación exitosa"}, status=status.HTTP_201_CREATED)

# --- Evaluator Views ---

class EvaluatorContestsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ContestSerializer

    def get_queryset(self):
        # Concursos donde soy evaluador
        return self.request.user.contests_evaluated.filter(active=True).order_by('-created_at')

class ContestApplicationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, contest_id):
        # Verificar que el usuario es evaluador de este concurso
        contest = get_object_or_404(Contest, id=contest_id)
        if not contest.evaluators.filter(id=request.user.id).exists():
             return Response({"error": "No eres evaluador de este concurso"}, status=status.HTTP_403_FORBIDDEN)
        
        applications = Application.objects.filter(contest=contest)
        
        # Serializamos manualmente o usamos serializer
        # Queremos info del aplicante y el estado de LA EVALUACION que este evaluador ha hecho (si existe)
        data = []
        for app in applications:
            evaluation = Evaluation.objects.filter(
                evaluator=request.user, 
                applicant=app.applicant, 
                contest=contest
            ).first()
            
            data.append({
                "application_id": app.id,
                "applicant_id": app.applicant.id,
                "applicant_name": app.applicant.profile.full_name or app.applicant.username,
                "department": app.applicant.profile.department,
                "status": evaluation.status if evaluation else "PENDING",
                "evaluation_id": evaluation.id if evaluation else None
            })
            
        return Response(data)
