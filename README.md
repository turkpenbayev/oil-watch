# OilWatch AI

Detects oil spills / oil-contaminated areas in **SAR (Synthetic Aperture Radar) satellite images** using a Hugging Face computer vision model, with a Django REST API backend and a React dashboard frontend.

## What this MVP does

- Upload an image (SAR satellite imagery — see [Test images](#test-images) below) through the dashboard.
- The backend runs a 5-class semantic segmentation model (U-Net) to classify each pixel as `background`, `oil_spill`, `ships`, `look_alike`, or `wakes`.
- The dashboard shows the original image, a color-coded segmentation mask, confidence, and the estimated oil-spill area, and keeps a history of past scans.

The current MVP analyzes manually uploaded images. Automated ingestion of a live satellite feed for continuous Caspian Sea monitoring is on the roadmap (see `tasks/roadmap.md`).

## Minimum system requirements

- Docker Engine 20.10+ and Docker Compose v2
- ~4 GB RAM available to Docker (TensorFlow inference)
- Internet access on first run (the model weights are downloaded from Hugging Face on the first prediction)

No local Python/Node installation is required — everything runs in Docker.

## Tech stack

- **Backend**: Python 3.13, Django 5, Django REST Framework, TensorFlow/Keras, PostgreSQL
- **Frontend**: React, TypeScript, Vite, TailwindCSS
- **Infrastructure**: Docker, Docker Compose

## Running the project

```bash
cp .env.example .env
docker compose up --build
```

This starts three services:

| Service | URL |
|---|---|
| Frontend dashboard | http://localhost:5173 |
| Backend API | http://localhost:8000/api/ |
| API docs (Swagger) | http://localhost:8000/api/docs/ |

Migrations run automatically on backend startup. No manual database setup or superuser is required for the core flow (upload → predict → history).

## API endpoints

```
POST /api/predict/   # multipart/form-data, field "image" -> prediction result
GET  /api/history/    # list of past predictions
```

## Test images

The model is trained on **raw SAR radar imagery**, not ordinary optical photos — oil slicks appear as dark, textured patches rather than the bright/pale swirls seen in optical satellite photos (e.g. MODIS). It also expects an **unannotated grayscale radar scene**, not a rendered infographic/map (colored land/water composites, text labels, legends, arrows). We verified this empirically:

- `docs/sample-images/sentinel-1-oil-spill-esa-2017.png` — a real, raw Copernicus Sentinel-1 SAR image (28 June 2017), sourced from [ESA](https://www.esa.int/ESA_Multimedia/Images/2017/06/Oil_spill_detected_by_Sentinel-1) (ESA Standard Licence, contains modified Copernicus Sentinel data). Verified end-to-end against this project's API: correctly classified as `oil_spill`, with a small, plausible oil-spill area (~0.8% of the image) matching the visible dark streak in the scene.
- A rendered infographic of the Balikpapan Bay spill (colored land/water, text labels) was **misclassified** (0% oil_spill, 53.8% falsely labeled `ships`) — the model does not generalize to annotated/composite imagery, only to raw radar scenes.

Ordinary optical/aerial photos (regular camera or visible-light satellite photos) and pre-rendered maps/infographics are **not** representative inputs for this model. Use a raw, unannotated SAR scene for a meaningful demo.

## Project structure

```
backend/
  config/            # Django project settings
  predictions/
    api/             # serializers, views, urls — thin, no business logic
    services/        # PredictionService + OilSpillModel abstraction (Hugging Face model boundary)
    models.py        # Prediction model
frontend/
  src/
    components/      # UploadPanel, ResultCard, HistoryList, dashboard widgets
    services/        # API client
tasks/               # roadmap/backlog/todo/done (in Russian — project task tracking)
```

## Model

- Source: [sahilvishwa2108/oil-spill-unet](https://huggingface.co/sahilvishwa2108/oil-spill-unet) (U-Net, 5-class segmentation)
- The model is abstracted behind `PredictionService`/`OilSpillModel` (`backend/predictions/services/`) so it can be swapped without touching API or business logic.
- The model card does not name its training dataset. Based on the class set (`background, oil_spill, ships, look_alike, wakes`) and its empirically confirmed accuracy on raw Sentinel-1 scenes, it was most likely trained on a Sentinel-1 SAR oil-spill dataset (e.g. the public "M4D"/Kaggle-style 5-class SAR datasets) — this is an informed guess, not a documented fact, and is worth re-verifying if this model is used beyond the MVP.

## Why SAR, not ordinary satellite photos?

"Satellite image" usually means an ordinary optical photo (visible light, like Google Maps or a phone camera from orbit — e.g. Sentinel-2, Landsat, MODIS). **SAR (Synthetic Aperture Radar)** is a different kind of satellite sensor: it actively sends radar pulses and measures what bounces back, rather than passively capturing light. That distinction is why this model requires SAR input specifically, not any "satellite image":

| | SAR (radar) | Optical (visible light) |
|---|---|---|
| How oil is detected | Physics-based: a smooth oil film dampens radar backscatter, showing up as a dark patch — reliable, hard to fake | Appearance-based: color/brightness/spectral differences — oil can look like sun glint, algae, or clean water depending on lighting |
| Weather / day-night | Works through clouds, at night, in any weather | Needs clear skies and daylight |
| Data cost | Sentinel-1 (ESA/Copernicus) is free and open | Sentinel-2/Landsat (ESA/NASA) are also free; higher-resolution commercial imagery (Planet, Maxar) costs money per km² |
| Ease of use | Grayscale, textured, harder to read by eye; more false positives from look-alikes (algae, calm-wind slicks, biogenic films) | Intuitive to interpret visually; easier to label training data |

For continuous real-world monitoring (the Caspian Sea roadmap item), SAR is generally the better fit precisely because it doesn't depend on weather or daylight — an oil spill doesn't wait for clear skies. Models for optical imagery also exist (typically CNN classifiers/segmenters on Sentinel-2 or commercial RGB imagery), but none of comparable quality were found packaged on Hugging Face during this project's research (see `tasks/done.md` for the survey).
