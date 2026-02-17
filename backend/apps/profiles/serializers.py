# backend/apps/profiles/serializers.py
from rest_framework import serializers
from .models import Profile, Evidence

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = [
            "id",
            "user_id",
            "role",
            "full_name",
            "phone",
            "department",
            "summary",
            "updated_at",
        ]
        read_only_fields = ["id", "user_id", "role", "updated_at"]

class EvidenceSerializer(serializers.ModelSerializer):
    # Este campo generará la URL completa del archivo
    file_url = serializers.CharField(source='file.url', read_only=True)

    class Meta:
        model = Evidence
        fields = [
            "id",
            "name",
            "kind",
            "file", # 'file' se usará para la subida
            "file_url", # 'file_url' se usará para la lectura
            "source",
            "reviewed_by",
            "reviewed_at",
            "created_at",
        ]
        read_only_fields = ["id", "file_url", "created_at", "reviewed_by", "reviewed_at"]
        # Hacemos 'file' de solo escritura, ya que no queremos leer el binario en el JSON
        extra_kwargs = {
            'file': {'write_only': True}
        }
