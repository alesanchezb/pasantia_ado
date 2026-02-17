from django.urls import path
from .views import (
    SaveEvaluationView, GetEvaluationView,
    CreateEvaluatorView, ContestListCreateView, EvaluatorListView,
    AvailableContestsView, MyApplicationsView, ApplyContestView,
    EvaluatorContestsView, ContestApplicationsView
)

urlpatterns = [
    path('save/', SaveEvaluationView.as_view(), name='save_evaluation'),
    path('get/<int:applicant_id>/', GetEvaluationView.as_view(), name='get_evaluation'),
    
    # Admin URLs
    path('admin/create-evaluator/', CreateEvaluatorView.as_view(), name='create_evaluator'),
    path('admin/contests/', ContestListCreateView.as_view(), name='list_create_contests'),
    path('admin/evaluators/', EvaluatorListView.as_view(), name='list_evaluators'),

    # Applicant URLs
    path('applicant/contests/available/', AvailableContestsView.as_view(), name='available_contests'),
    path('applicant/applications/', MyApplicationsView.as_view(), name='my_applications'),
    path('applicant/apply/<int:contest_id>/', ApplyContestView.as_view(), name='apply_contest'),

    # Evaluator URLs
    path('evaluator/contests/', EvaluatorContestsView.as_view(), name='evaluator_contests'),
    path('evaluator/contest/<int:contest_id>/applications/', ContestApplicationsView.as_view(), name='contest_applications'),
]
