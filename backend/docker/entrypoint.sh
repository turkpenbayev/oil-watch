#!/bin/sh
set -e

echo "Waiting for PostgreSQL at ${POSTGRES_HOST:-db}:${POSTGRES_PORT:-5432}..."
while ! python -c "
import socket, os, sys
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.settimeout(1)
try:
    s.connect((os.environ.get('POSTGRES_HOST', 'db'), int(os.environ.get('POSTGRES_PORT', 5432))))
except OSError:
    sys.exit(1)
"; do
  sleep 1
done
echo "PostgreSQL is up."

if [ "$#" -gt 0 ]; then
  exec "$@"
fi

python manage.py migrate --noinput
python manage.py collectstatic --noinput
python manage.py seed_demo_data

exec gunicorn config.wsgi:application --bind 0.0.0.0:8000
