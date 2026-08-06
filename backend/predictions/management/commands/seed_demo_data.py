from pathlib import Path
from typing import Any

from django.core.files import File
from django.core.management.base import BaseCommand

from predictions.models import Prediction
from predictions.services.prediction_service import PredictionService

DEMO_IMAGE = (
    Path(__file__).resolve().parent.parent.parent / "fixtures" / "sentinel-1-oil-spill-esa-2017.png"
)


class Command(BaseCommand):
    help = "Seed one real Sentinel-1 SAR prediction so the dashboard isn't empty on first run."

    def handle(self, *args: Any, **options: Any) -> None:
        if Prediction.objects.exists():
            self.stdout.write("Predictions already exist, skipping demo seed.")
            return

        if not DEMO_IMAGE.exists():
            self.stdout.write(
                self.style.WARNING(f"Demo image not found at {DEMO_IMAGE}, skipping.")
            )
            return

        with open(DEMO_IMAGE, "rb") as f:
            django_file = File(f, name=DEMO_IMAGE.name)
            prediction = PredictionService().predict(django_file)

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded demo prediction #{prediction.pk} ({prediction.label}, "
                f"{prediction.confidence:.2f} confidence)."
            )
        )
