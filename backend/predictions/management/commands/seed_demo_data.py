from pathlib import Path
from typing import Any

from django.core.files import File
from django.core.management.base import BaseCommand

from predictions.models import Prediction
from predictions.services.prediction_service import PredictionService

FIXTURES_DIR = Path(__file__).resolve().parent.parent.parent / "fixtures"

DEMO_IMAGES = [
    FIXTURES_DIR / "sentinel-1-oil-spill-esa-2017.png",
    FIXTURES_DIR / "terrasar-x-oil-spill-2010.jpg",
]


class Command(BaseCommand):
    help = "Seed real SAR predictions so the dashboard isn't empty on first run."

    def handle(self, *args: Any, **options: Any) -> None:
        if Prediction.objects.exists():
            self.stdout.write("Predictions already exist, skipping demo seed.")
            return

        for image_path in DEMO_IMAGES:
            if not image_path.exists():
                self.stdout.write(
                    self.style.WARNING(f"Demo image not found at {image_path}, skipping.")
                )
                continue

            with open(image_path, "rb") as f:
                django_file = File(f, name=image_path.name)
                prediction = PredictionService().predict(django_file)

            self.stdout.write(
                self.style.SUCCESS(
                    f"Seeded demo prediction #{prediction.pk} ({prediction.label}, "
                    f"{prediction.confidence:.2f} confidence) from {image_path.name}."
                )
            )
