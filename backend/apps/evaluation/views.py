from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.db import transaction
from django.shortcuts import get_object_or_404
from .models import Evaluation, EvaluationScore
from .serializers import EvaluationSerializer

class SaveEvaluationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        applicant_id = request.data.get('applicant_id')
        scores_data = request.data.get('scores', {})
        status_val = request.data.get('status', Evaluation.STATUS_DRAFT)

        if not applicant_id:
            return Response({"error": "applicant_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Buscar o crear la evaluación
        evaluation, created = Evaluation.objects.get_or_create(
            evaluator=request.user,
            applicant_id=applicant_id
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

    def get_object(self):
        applicant_id = self.kwargs.get('applicant_id')
        return get_object_or_404(Evaluation, evaluator=self.request.user, applicant_id=applicant_id)
