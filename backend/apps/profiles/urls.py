from django.urls import path
from . import views

urlpatterns = [
    path("me/", views.profile_me, name="profile_me"),
    path("me/evidences/", views.evidences_me, name="evidences_me"),
    path("me/evidences/<int:evidence_id>/", views.evidence_delete, name="evidence_delete"),
]
