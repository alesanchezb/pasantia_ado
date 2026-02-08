from django.urls import path
from . import views, auth_views

urlpatterns = [
    path("auth/csrf/", auth_views.csrf),
    path("auth/login/", auth_views.api_login),
    path("auth/logout/", auth_views.api_logout),

    path("profile/me/", views.profile_me),
    path("profile/me/evidences/", views.evidences_me),
    path("profile/me/evidences/<int:evidence_id>/", views.evidence_delete),
]
