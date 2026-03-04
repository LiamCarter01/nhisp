#!/bin/bash
set -e

echo "============================================="
echo "NHISP Backend - Starting..."
echo "============================================="

# Wait for PostgreSQL to be ready
echo "→ Waiting for PostgreSQL..."
export PGPASSWORD="${POSTGRES_PASSWORD:-nhisp_secret_password}"
until pg_isready -h "${POSTGRES_HOST:-postgres}" -p "${POSTGRES_PORT:-5432}" -U "${POSTGRES_USER:-nhisp_user}" -d "${POSTGRES_DB:-nhisp_db}" > /dev/null 2>&1; do
    echo "  PostgreSQL not ready, waiting..."
    sleep 2
done
echo "✓ PostgreSQL is ready!"

# Create migrations if they don't exist
echo "→ Creating migrations..."
python manage.py makemigrations --noinput
echo "✓ Migrations created!"

# Run migrations
echo "→ Running database migrations..."
python manage.py migrate --noinput
echo "✓ Migrations complete!"

# Collect static files
echo "→ Collecting static files..."
python manage.py collectstatic --noinput 2>/dev/null || true
echo "✓ Static files collected!"

# Seed data if SEED_DATA is set
if [ "${SEED_DATA:-false}" = "true" ]; then
    echo "→ Seeding database..."
    python manage.py seed_data
    echo "✓ Database seeded!"
fi

echo "============================================="
echo "NHISP Backend - Ready!"
echo "============================================="

# Start server
exec gunicorn config.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 3 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile -
