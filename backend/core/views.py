import csv
import re
import json
from pathlib import Path
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt


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
            next(reader)  # Omitir la fila de encabezado

            for row in reader:
                row = row + [""] * (14 - len(row))

                col_id = row[1].strip()
                col_desc = row[2].strip()

                desc_lower = col_desc.lower()
                if desc_lower.startswith("subtotal") or \
                   desc_lower.startswith("sumas parciales") or \
                   desc_lower.startswith("puntajes máximos") or \
                   desc_lower.startswith("puntuación total"):
                    continue

                # --- 1. DETECTAR SI ES UNA SECCIÓN PRINCIPAL (ej: "I.", "II.") ---
                if regex_seccion.match(col_id):
                    match = regex_max_puntos.search(col_desc)
                    max_pts = int(match.group(1)) if match else 0

                    seccion_actual = {
                        "id": col_id,
                        "titulo": col_desc,
                        "max_puntos": max_pts,
                        "items": []
                    }
                    data_estructurada.append(seccion_actual)
                    ultimo_item_padre = None
                    continue

                if seccion_actual is None:
                    continue

                # --- 2. PROCESAR LA FILA COMO UN ITEM ---
                if not col_desc:
                    continue

                inputs_detectados = []
                mapa_columnas = [(3, "col_A"), (4, "col_B"), (5, "col_C")]
                if seccion_actual["id"] == "I.":
                    mapa_columnas = [(4, "col_A"), (5, "col_B")]

                for indice_csv, clave_normalizada in mapa_columnas:
                    try:
                        val = float(row[indice_csv].strip())
                        if val > 0:
                            inputs_detectados.append({"key": clave_normalizada, "valor_unitario": val})
                    except (ValueError, IndexError):
                        pass

                tipo = "item"
                final_id = col_id
                if col_id and not inputs_detectados:
                    tipo = "subtitulo"
                    ultimo_item_padre = col_id
                elif not col_id and inputs_detectados:
                    if ultimo_item_padre:
                        tipo = "subitem"
                        final_id = f"{ultimo_item_padre}_sub_{len(seccion_actual['items'])}"
                    else:
                        tipo = "item"
                        final_id = f"autoid_{len(seccion_actual['items'])}"
                elif not col_id and inputs_detectados and ultimo_item_padre:
                    tipo = "subitem"
                    final_id = f"{ultimo_item_padre}_sub_{len(seccion_actual['items'])}"

                input_type = "number" if row[12].strip().lower() == "number" else "radio"
                evidence_kind = row[13].strip() or None

                item = {
                    "id": final_id,
                    "concepto": col_desc,
                    "inputs": inputs_detectados,
                    "tipo": tipo,
                    "input_type": input_type,
                    "evidence_kind": evidence_kind,
                }

                seccion_actual["items"].append(item)

    except Exception as e:
        return JsonResponse({"error": f"Error procesando el CSV: {str(e)}"}, status=500)

    return JsonResponse(data_estructurada, safe=False)
