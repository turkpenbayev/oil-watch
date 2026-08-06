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

The model is trained on **SAR radar imagery**, not ordinary optical photos — oil slicks appear as dark, textured patches rather than the bright/pale swirls seen in optical satellite photos (e.g. MODIS). For a meaningful demo, use a real SAR oil-spill image:

- `docs/sample-images/sar-oil-spill-gulf-of-mexico.jpg` — a real TerraSAR-X radar image of the Deepwater Horizon spill (Gulf of Mexico, 9 July 2010), sourced from [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:TerraSAR-X_image_of_the_oil-polluted_area_in_the_Gulf_of_Mexico_in_a_series_of_images_acquired_on_9_July_2010.jpg) (CC BY 3.0, DLR). Verified end-to-end against this project's API — it is correctly classified as `oil_spill`.

Ordinary optical/aerial photos (regular camera or visible-light satellite photos) are not representative inputs for this model and will generally be classified as clean, since the model has never seen that visual domain.

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
