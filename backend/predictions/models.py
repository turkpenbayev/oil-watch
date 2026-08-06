import uuid

from django.db import models


def prediction_image_path(instance: "Prediction", filename: str) -> str:
    ext = filename.rsplit(".", 1)[-1] if "." in filename else "jpg"
    return f"predictions/{uuid.uuid4()}.{ext}"


class Prediction(models.Model):
    image = models.ImageField(upload_to=prediction_image_path)
    result_mask = models.ImageField(upload_to="predictions/masks/", blank=True, null=True)
    label = models.CharField(max_length=64)
    confidence = models.FloatField()
    oil_spill_ratio = models.FloatField(
        help_text="Fraction of pixels classified as oil spill, 0.0-1.0",
    )
    model_version = models.CharField(max_length=128)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Prediction #{self.pk} ({self.label}, {self.confidence:.2f})"
