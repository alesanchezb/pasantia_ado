from django.urls import path
from . import views

urlpatterns = [
    path("auth/dev-login/", views.DevelopmentLoginView.as_view(), name="dev_login"),
    
    path("me/", views.ProfileMeView.as_view(), name="profile_me"),
    path("me/evidences/", views.EvidenceView.as_view(), name="evidences_me"),
    path("me/evidences/<int:evidence_id>/", views.EvidenceDetailView.as_view(), name="evidence_delete"),
]
