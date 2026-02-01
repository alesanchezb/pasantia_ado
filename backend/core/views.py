import csv
import re
from django.http import JsonResponse
from django.conf import settings
from pathlib import Path

def criterios_evaluation(request):
    csv_path = Path(settings.BASE_DIR) / "static/evaluation/criterios.csv"

    data_estructurada = []
    seccion_actual = None
    ultimo_item_padre = None 

    regex_seccion = re.compile(r'^[IVX]+\.?$')      
    regex_max_puntos = re.compile(r'max\.?\s*(\d+)', re.IGNORECASE)

    try:
        with open(csv_path, newline="", encoding="utf-8") as f:
            reader = csv.reader(f)
            
            for row in reader:
                # Normalizamos fila a 10 columnas seguras
                row = row + [""] * (10 - len(row))
                
                col_id = row[1].strip()
                col_desc = row[2].strip()

                # --- 1. DETECTAR SECCIÓN ---
                if regex_seccion.match(col_id):
                    max_pts = 0
                    match = regex_max_puntos.search(col_desc)
                    if match:
                        max_pts = int(match.group(1))

                    seccion_actual = {
                        "id": col_id,
                        "titulo": col_desc,
                        "max_puntos": max_pts,
                        "items": []
                    }
                    data_estructurada.append(seccion_actual)
                    ultimo_item_padre = None 
                    continue

                if seccion_actual is None: continue

                # --- 2. MAPEO INTELIGENTE DE COLUMNAS ---
                # Aquí está el truco: Definimos qué índice del CSV corresponde a A, B o C
                inputs_detectados = []
                mapa_columnas = []

                if seccion_actual["id"] == "I.":
                    # Sección I: Los datos están desplazados una columna a la derecha
                    mapa_columnas = [
                        (4, "col_A"), # Columna E del Excel -> A
                        (5, "col_B")  # Columna F del Excel -> B
                    ]
                else:
                    # Resto de secciones: Estándar
                    mapa_columnas = [
                        (3, "col_A"), # Columna D -> A
                        (4, "col_B"), # Columna E -> B
                        (5, "col_C")  # Columna F -> C
                    ]

                for indice_csv, clave_normalizada in mapa_columnas:
                    try:
                        val_str = row[indice_csv].strip()
                        val = float(val_str)
                        if val > 0:
                            inputs_detectados.append({
                                "key": clave_normalizada, # Ahora siempre será "col_A", "col_B"...
                                "valor_unitario": val
                            })
                    except ValueError:
                        pass

                # --- 3. CREAR ITEM O SUBITEM ---
                # Solo agregamos si encontramos descripción
                if col_desc:
                    tipo = "item"
                    final_id = col_id

                    # Lógica para detectar subtítulos (II.A) vs items normales
                    if col_id and not inputs_detectados:
                        tipo = "subtitulo"
                        ultimo_item_padre = col_id
                    elif not col_id and inputs_detectados:
                        tipo = "subitem"
                        final_id = f"{ultimo_item_padre}_sub_{len(seccion_actual['items'])}"

                    # Solo agregamos si es relevante (tiene ID o tiene inputs)
                    if inputs_detectados or tipo == "subtitulo":
                        item = {
                            "id": final_id,
                            "concepto": col_desc,
                            "inputs": inputs_detectados,
                            "tipo": tipo
                        }
                        seccion_actual["items"].append(item)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse(data_estructurada, safe=False)


import json
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout


@csrf_exempt
@require_http_methods(["POST"])
def login_view(request):
    try:
        data = json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        return JsonResponse({"detail": "Invalid JSON"}, status=400)

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return JsonResponse({"detail": "username and password required"}, status=400)

    user = authenticate(request, username=username, password=password)
    if user is None:
        return JsonResponse({"detail": "Invalid credentials"}, status=401)

    login(request, user)
    return JsonResponse({"ok": True})


@csrf_exempt
@require_http_methods(["POST"])
def logout_view(request):
    logout(request)
    return JsonResponse({"ok": True})
