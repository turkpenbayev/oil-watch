from rest_framework import serializers

from predictions.models import Prediction


class PredictionCreateSerializer(serializers.Serializer):
    image = serializers.ImageField()


class PredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prediction
        fields = [
            "id",
            "image",
            "result_mask",
            "label",
            "confidence",
            "oil_spill_ratio",
            "model_version",
            "created_at",
        ]
        read_only_fields = fields
