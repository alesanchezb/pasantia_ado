from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import Evaluation, EvaluationScore

User = get_user_model()

class EvaluationAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.evaluator = User.objects.create_user(username='evaluator', password='password')
        self.applicant = User.objects.create_user(username='applicant', password='password')
        self.client.force_authenticate(user=self.evaluator)

    def test_save_evaluation(self):
        url = '/api/evaluation/save/'
        data = {
            'applicant_id': self.applicant.id,
            'status': 'COMPLETED',
            'scores': {
                'I._1_col_A': 10,
                'radio_1': 1
            }
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify db
        evaluation = Evaluation.objects.get(evaluator=self.evaluator, applicant=self.applicant)
        self.assertEqual(evaluation.status, 'COMPLETED')
        self.assertEqual(evaluation.scores.count(), 2)
        self.assertEqual(evaluation.scores.get(unique_key='I._1_col_A').value, 10)

    def test_get_evaluation(self):
        # Create initial evaluation
        evaluation = Evaluation.objects.create(
            evaluator=self.evaluator,
            applicant=self.applicant,
            status='DRAFT'
        )
        EvaluationScore.objects.create(evaluation=evaluation, unique_key='test_key', value=5)

        url = f'/api/evaluation/get/{self.applicant.id}/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['scores']), 1)
        self.assertEqual(response.data['scores'][0]['unique_key'], 'test_key')
