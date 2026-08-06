from django.urls import path

from predictions.api.views import PredictionHistoryView, PredictView

urlpatterns = [
    path("predict/", PredictView.as_view(), name="predict"),
    path("history/", PredictionHistoryView.as_view(), name="history"),
]
