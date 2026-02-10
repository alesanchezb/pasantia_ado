# apps/profiles/auth_views.py
import json
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from django.contrib.auth.models import User

@require_http_methods(["GET"])
def csrf(request):
    return JsonResponse({"csrftoken": get_token(request)})

@require_http_methods(["POST"])
def api_login(request):
    data = json.loads(request.body.decode("utf-8") or "{}")
    username = data.get("username")
    password = data.get("password")

    user = authenticate(request, username=username, password=password)
    if user is None:
        return JsonResponse({"detail": "Credenciales inválidas"}, status=400)

    login(request, user)
    return JsonResponse({"detail": "ok"})

@require_http_methods(["POST"])
def api_logout(request):
    logout(request)
    return JsonResponse({"detail": "ok"})

@require_http_methods(["POST"])
def api_register(request):
    data = json.loads(request.body.decode("utf-8") or "{}")
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    if not username or not password:
        return JsonResponse({"detail": "username y password son requeridos"}, status=400)

    if User.objects.filter(username=username).exists():
        return JsonResponse({"detail": "Ese usuario ya existe"}, status=400)

    user = User.objects.create_user(username=username, password=password)
    login(request, user)  # opcional: te loguea al registrarte
    return JsonResponse({"detail": "ok"})
