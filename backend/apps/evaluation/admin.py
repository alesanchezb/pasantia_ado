from django.contrib import admin
from .models import Evaluation, EvaluationScore, Contest, Application

@admin.register(Contest)
class ContestAdmin(admin.ModelAdmin):
    list_display = ('title', 'active', 'created_at')
    list_filter = ('active', 'created_at')
    filter_horizontal = ('evaluators',)

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('contest', 'applicant', 'created_at')
    list_filter = ('contest', 'created_at')


@admin.register(Evaluation)
class EvaluationAdmin(admin.ModelAdmin):
    list_display = ('id', 'evaluator', 'applicant', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('evaluator__username', 'applicant__username')

@admin.register(EvaluationScore)
class EvaluationScoreAdmin(admin.ModelAdmin):
    list_display = ('evaluation', 'unique_key', 'value')
    list_filter = ('evaluation',)
