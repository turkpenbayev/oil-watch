# OilWatch AI

Detects oil spills in **SAR (Synthetic Aperture Radar) satellite images** using a Hugging Face computer vision model. Django REST API backend + React dashboard, all served behind nginx.

<p align="center">
  <img src="docs/screenshots/dashboard.png" alt="OilWatch AI dashboard" width="90%" />
</p>

<p align="center">
  <img src="docs/screenshots/sample-original.png" alt="Original Sentinel-1 SAR scene" width="40%" />
  &nbsp;&nbsp;&nbsp;
  <img src="docs/screenshots/sample-mask.png" alt="Predicted segmentation mask" width="40%" />
</p>
<p align="center"><sub>Left: raw Sentinel-1 SAR input (ESA, 28 June 2017) · Right: predicted mask (red = detected oil spill)</sub></p>

## What it does

Upload a SAR satellite image → the backend runs a U-Net segmentation model → the dashboard shows the original image, a color-coded mask, confidence, and estimated spill area, plus a history of past scans. Two real, verified predictions are seeded automatically on first run so the dashboard isn't empty.

## Minimum system requirements

- Docker Engine 20.10+ and Docker Compose v2
- ~4 GB RAM available to Docker (TensorFlow inference)
- Internet access on first run (model weights download from Hugging Face)

No local Python/Node installation needed — everything runs in Docker.

## Tech stack

- **Backend**: Python 3.13, Django 5, Django REST Framework, TensorFlow/Keras, PostgreSQL
- **Frontend**: React, TypeScript, Vite, TailwindCSS
- **Infrastructure**: Docker, Docker Compose, nginx

## Install & run

```bash
cp .env.example .env
docker compose up --build
```

nginx is the single entry point (port 80) — on a real server, just point a browser at the server's IP, no ports needed:

| What | URL |
|---|---|
| Dashboard | http://localhost/ |
| Backend API | http://localhost/api/ |
| API docs (Swagger) | http://localhost/api/docs/ |
| Django admin | http://localhost/admin/ |

Migrations and a Django admin superuser (`admin` / `admin` by default — see `.env.example`) are created automatically on first run.

## Test account

Django admin: **`admin` / `admin`** (from `DJANGO_SUPERUSER_*` in `.env`, change before any real deployment).

## API endpoints

```
POST /api/predict/   # multipart/form-data, field "image" -> prediction result
GET  /api/history/    # list of past predictions
```

## Test images (important — read before demoing)

The model needs **raw SAR radar imagery**, not ordinary optical photos and not rendered infographics/maps. Two real, pre-verified test images auto-seed into the dashboard on first run and are also available in `backend/predictions/fixtures/`:

- `sentinel-1-oil-spill-esa-2017.png` — real Sentinel-1 SAR image, ESA, 28 June 2017.
- `terrasar-x-oil-spill-2010.jpg` — real TerraSAR-X image of the Deepwater Horizon spill, 9 July 2010 (Wikimedia, CC BY 3.0).

Ordinary satellite photos, camera photos, or pre-rendered maps/infographics will not give meaningful results — see `tasks/done.md` for why (SAR vs optical physics, and what happens with annotated composite images).

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
docker/
  nginx/             # nginx config: reverse proxy + static frontend + media/static file serving
tasks/               # roadmap/backlog/todo/done (in Russian — project task tracking)
```

## Model

Source: [sahilvishwa2108/oil-spill-unet](https://huggingface.co/sahilvishwa2108/oil-spill-unet) (U-Net, 5-class segmentation). Abstracted behind `PredictionService`/`OilSpillModel` (`backend/predictions/services/`) so the model can be swapped without touching API or business logic.

## Author

turkpenbayev
