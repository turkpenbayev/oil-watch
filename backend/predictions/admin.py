from django.contrib import admin

from predictions.models import Prediction


@admin.register(Prediction)
class PredictionAdmin(admin.ModelAdmin):
    list_display = ("id", "label", "confidence", "oil_spill_ratio", "model_version", "created_at")
    list_filter = ("label", "model_version")
    readonly_fields = ("created_at",)
