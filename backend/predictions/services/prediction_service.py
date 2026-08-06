import io

import numpy as np
from django.core.files import File
from django.core.files.base import ContentFile
from PIL import Image

from predictions.models import Prediction
from predictions.services.oil_spill_model import HuggingFaceOilSpillModel, OilSpillModel

# Distinct RGB colors per class index, used only to render a human-readable
# mask overlay. Order must match oil_spill_model.CLASS_LABELS.
MASK_COLORS = np.array(
    [
        [30, 60, 114],  # background
        [220, 38, 38],  # oil_spill
        [156, 163, 175],  # ships
        [234, 179, 8],  # look_alike
        [124, 58, 237],  # wakes
    ],
    dtype=np.uint8,
)


class PredictionService:
    """Business logic entry point for running oil-spill detection.

    Views/serializers call this service only — they never talk to the
    model or the ORM's prediction-specific logic directly.
    """

    def __init__(self, model: OilSpillModel | None = None) -> None:
        self._model = model or HuggingFaceOilSpillModel()

    def predict(self, uploaded_image: File) -> Prediction:
        image = Image.open(uploaded_image)
        image.load()

        result = self._model.predict(image)
        mask_file = self._render_mask(result.mask)

        prediction = Prediction(
            label=result.label,
            confidence=result.confidence,
            oil_spill_ratio=result.oil_spill_ratio,
            model_version=self._model.version,
        )
        prediction.image.save(uploaded_image.name or "upload.jpg", uploaded_image, save=False)
        prediction.result_mask.save("mask.png", mask_file, save=False)
        prediction.save()
        return prediction

    @staticmethod
    def _render_mask(mask: np.ndarray) -> ContentFile:
        color_mask = MASK_COLORS[mask]
        buffer = io.BytesIO()
        Image.fromarray(color_mask).save(buffer, format="PNG")
        return ContentFile(buffer.getvalue())
