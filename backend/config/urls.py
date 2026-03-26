from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings
from django.http import JsonResponse
from core.views import criterios_evaluation


def home(_request):
    return JsonResponse({
        "ok": True,
        "message": "Backend activo",
        "endpoints": [
            "/api/evaluation/criterios/",
            "/api/profile/me/",
            "/api/profile/me/evidences/",
        ]
    })


urlpatterns = [
    path("", home),
    path("admin/", admin.site.urls),
    path("api/evaluation/criterios/", criterios_evaluation),
    path("api/evaluation/", include("apps.evaluation.urls")),
    path("api/", include("apps.profiles.urls")),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)