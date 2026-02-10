from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from ..services import ProfileService, EvidenceService
from .serializers import ProfileSerializer, EvidenceSerializer

def _evidence_to_dict(e: Evidence, request):
    file_url = e.file.url if e.file else None
    return {
        "id": e.id,
        "name": e.name,
        "kind": e.kind,
        "file_url": file_url,
        "created_at": e.created_at.isoformat() if e.created_at else None,
    }


@require_http_methods(["GET", "POST"])
@csrf_exempt
def evidences_me(request):
    auth = _require_auth(request)
    if auth:
        return auth

    profile = _get_or_create_profile(request.user)

    if request.method == "GET":
        evidences = Evidence.objects.filter(profile=profile).order_by("-created_at")
        return JsonResponse([_evidence_to_dict(e, request) for e in evidences], safe=False)

    upload = request.FILES.get("file")
    name = request.POST.get("name") or (upload.name if upload else None)
    kind = request.POST.get("kind") or ""

    if not upload:
        return JsonResponse({"detail": "Missing file"}, status=400)
    if not name:
        return JsonResponse({"detail": "Missing name"}, status=400)

    e = Evidence.objects.create(profile=profile, name=name, kind=kind, file=upload)
    return JsonResponse(_evidence_to_dict(e, request), status=201)


@require_http_methods(["DELETE"])
@csrf_exempt
def evidence_delete(request, evidence_id: int):
    auth = _require_auth(request)
    if auth:
        return auth

    profile = _get_or_create_profile(request.user)

    try:
        e = Evidence.objects.get(id=evidence_id, profile=profile)
    except Evidence.DoesNotExist:
        return JsonResponse({"detail": "Not found"}, status=404)

    e.file.delete(save=False)
    e.delete()
    return JsonResponse({"ok": True})

from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from .models import Profile
"""
@login_required

def me(request):
    profile, _ = Profile.objects.get_or_create(user=request.user)

    return JsonResponse({
        "id": profile.id,
        "full_name": profile.full_name,
        "phone": profile.phone,
        "department": profile.department,
        "summary": profile.summary,
        "role": profile.role,
    })
"""
>>>>>>> 79c91c5b7c5c576853e43bde0d7e6d5a623f0914
