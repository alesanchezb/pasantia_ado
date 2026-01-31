import csv
from pathlib import Path
from django.conf import settings

def load_criterios():
    path = Path(settings.BASE_DIR) / "static/evaluation/criterios.csv"
    with open(path, encoding="utf-8") as f:
        return list(csv.DictReader(f))
