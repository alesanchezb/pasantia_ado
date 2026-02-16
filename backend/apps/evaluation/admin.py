from django.contrib import admin
from .models import Evaluation, EvaluationScore

@admin.register(Evaluation)
class EvaluationAdmin(admin.ModelAdmin):
    list_display = ('id', 'evaluator', 'applicant', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('evaluator__username', 'applicant__username')

@admin.register(EvaluationScore)
class EvaluationScoreAdmin(admin.ModelAdmin):
    list_display = ('evaluation', 'unique_key', 'value')
    list_filter = ('evaluation',)
