import json
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt

from .models import Profile, Evidence


def _require_auth(request):
    if not request.user.is_authenticated:
        return JsonResponse({"detail": "Authentication required"}, status=401)
    return None


def _get_or_create_profile(user):
    profile, _ = Profile.objects.get_or_create(user=user)
    return profile


def _profile_to_dict(p: Profile):
    return {
        "id": p.id,
        "user_id": p.user_id,
        "role": p.role,
        "full_name": p.full_name,
        "phone": p.phone,
        "department": p.department,
        "summary": p.summary,
        "updated_at": p.updated_at.isoformat() if p.updated_at else None,
    }


@require_http_methods(["GET", "PUT", "PATCH"])
@csrf_exempt
def profile_me(request):
    auth = _require_auth(request)
    if auth:
        return auth

    profile = _get_or_create_profile(request.user)

    if request.method == "GET":
        return JsonResponse(_profile_to_dict(profile), safe=False)

    # PUT/PATCH
    try:
        payload = json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        return JsonResponse({"detail": "Invalid JSON body"}, status=400)

    for field in ["full_name", "phone", "department", "summary"]:
        if field in payload:
            setattr(profile, field, payload[field] or "")

    profile.save()
    return JsonResponse(_profile_to_dict(profile), safe=False)


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

@require_http_methods(["GET"])
@csrf_exempt
def applicant_list(request):
    auth = _require_auth(request)
    if auth:
        return auth

    # Verificar si es evaluador o admin (opcional, pero recomendado)
    # Por ahora solo requerimos autenticación para simplificar
    
    applicants = Profile.objects.filter(role=Profile.ROLE_APPLICANT).order_by("-updated_at")
    return JsonResponse([_profile_to_dict(p) for p in applicants], safe=False)
