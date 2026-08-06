import os
from dataclasses import dataclass
from typing import Protocol

import numpy as np
from huggingface_hub import hf_hub_download
from PIL import Image

MODEL_INPUT_SIZE = (256, 256)

# Class order per the documented model card:
# https://huggingface.co/sahilvishwa2108/oil-spill-unet
# (same weights as our REPO_ID below, republished with a complete README).
CLASS_LABELS = ["background", "oil_spill", "ships", "look_alike", "wakes"]
OIL_SPILL_CLASS_INDEX = 1


@dataclass(frozen=True)
class SegmentationResult:
    label: str
    confidence: float
    oil_spill_ratio: float
    mask: np.ndarray  # (H, W) array of class indices


class OilSpillModel(Protocol):
    """Abstraction boundary for the underlying CV model.

    Swap the implementation (different weights, a remote inference API, etc.)
    without touching PredictionService or any Django view/serializer.
    """

    version: str

    def predict(self, image: Image.Image) -> SegmentationResult: ...


class HuggingFaceOilSpillModel:
    """Keras segmentation model downloaded from the Hugging Face Hub.

    Repo: https://huggingface.co/sahilvishwa2108/oil-spill-unet
    (U-Net, 5-class segmentation, documented class order and preprocessing
    on the model card — same weights previously published undocumented
    under sahilvishwa2108/oil-spill-detection-models/unet_final_model.h5).
    """

    REPO_ID = "sahilvishwa2108/oil-spill-unet"

    def __init__(self, weights_filename: str = "model.keras") -> None:
        self.version = weights_filename
        self._model = None
        self._weights_filename = weights_filename

    def _load(self):
        if self._model is not None:
            return self._model

        # Imported lazily so Django can boot without TensorFlow installed
        # (e.g. during collectstatic in slim CI steps).
        import tensorflow as tf

        cache_dir = os.environ.get("HF_MODEL_CACHE_DIR", "/app/model_cache")
        weights_path = hf_hub_download(
            repo_id=self.REPO_ID,
            filename=self._weights_filename,
            cache_dir=cache_dir,
        )
        self._model = tf.keras.models.load_model(weights_path, compile=False)
        return self._model

    def predict(self, image: Image.Image) -> SegmentationResult:
        model = self._load()

        resized = image.convert("RGB").resize(MODEL_INPUT_SIZE)
        array = np.asarray(resized, dtype=np.float32) / 255.0
        batch = np.expand_dims(array, axis=0)

        raw_output = model.predict(batch, verbose=0)[0]  # (H, W, num_classes)

        mask = np.argmax(raw_output, axis=-1)  # (H, W)
        class_confidence = np.max(raw_output, axis=-1)  # (H, W)

        oil_spill_pixels = mask == OIL_SPILL_CLASS_INDEX
        oil_spill_ratio = float(oil_spill_pixels.mean())

        if oil_spill_pixels.any():
            confidence = float(class_confidence[oil_spill_pixels].mean())
            label = "oil_spill"
        else:
            confidence = float(class_confidence.mean())
            label = "clean"

        return SegmentationResult(
            label=label,
            confidence=confidence,
            oil_spill_ratio=oil_spill_ratio,
            mask=mask,
        )
