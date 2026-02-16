from django.urls import path
from .views import SaveEvaluationView, GetEvaluationView

urlpatterns = [
    path('save/', SaveEvaluationView.as_view(), name='save_evaluation'),
    path('get/<int:applicant_id>/', GetEvaluationView.as_view(), name='get_evaluation'),
]
