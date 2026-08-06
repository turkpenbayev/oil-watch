# Дорожная карта

## Этап 1 — MVP (хакатон)
- [x] Скелет проекта: Docker Compose, Django+DRF backend, React+Vite+TS frontend
- [x] `PredictionService` с абстракцией модели (Hugging Face, TensorFlow/Keras)
- [x] API: `POST /api/predict/`, `GET /api/history/`
- [ ] Frontend: загрузка изображения, отображение маски и результата, история
- [ ] E2E проверка через Docker Compose + Playwright MCP
- [ ] README с инструкцией запуска (обязательное требование хакатона)

## Этап 2 — после хакатона (если проходим в финал)
- Аутентификация и роли
- Метрики модели и мониторинг
- CI (GitHub Actions): ruff, black, mypy, pytest
