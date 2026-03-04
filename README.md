# National Health Insurance Services Portal (NHISP)

A comprehensive, production-ready full-stack Government Health Insurance Portal built with **Django REST Framework** (backend) and **React + TypeScript** (frontend).

---

## Architecture Overview

```
nhisp/
├── backend/                    # Django REST API
│   ├── config/                 # Project settings, URLs, ASGI/WSGI
│   ├── apps/
│   │   ├── core/               # Shared models, permissions, exceptions
│   │   ├── users/              # Auth, registration, user management
│   │   ├── policies/           # Insurance policy CRUD
│   │   ├── claims/             # Claim lifecycle with state machine
│   │   ├── payments/           # Payment processing
│   │   ├── providers/          # Healthcare provider registry
│   │   └── notifications/      # User notification system
│   ├── Dockerfile
│   ├── requirements.txt
│   └── manage.py
├── frontend/                   # React + TypeScript + Vite
│   ├── src/
│   │   ├── api/                # Axios client, services, types
│   │   ├── hooks/              # Auth context, custom hooks
│   │   ├── components/         # Shared UI components
│   │   └── features/           # Feature pages (auth, dashboard, claims, etc.)
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env / .env.example
└── README.md
```

### Key Design Patterns

- **Service Layer**: All business logic lives in `services/` — views are thin, delegating to services.
- **State Machine**: Claim status transitions are validated via an explicit transition map with role guards.
- **UUID Primary Keys**: All models use UUID-based primary keys via `BaseModel`.
- **Role-Based Access Control**: Four roles (Admin, Supervisor, Claims Officer, Citizen) enforced at API and UI levels.
- **Custom Exception Handler**: Consistent error envelope `{ "error": { "code", "message", "details" } }`.

---

## Tech Stack

| Layer     | Technology                                                   |
|-----------|--------------------------------------------------------------|
| Backend   | Python 3.11, Django 4.2, Django REST Framework 3.14          |
| Auth      | djangorestframework-simplejwt (JWT access + refresh tokens)  |
| Database  | PostgreSQL 16                                                |
| Frontend  | React 18, TypeScript, Vite 5, Tailwind CSS 3.4              |
| HTTP      | Axios with automatic JWT refresh interceptor                 |
| Container | Docker, docker-compose                                       |
| Web       | Nginx (frontend), Gunicorn (backend)                         |

---

## Quick Start (Docker)

### 1. Clone & Configure

```bash
git clone <repo-url> nhisp && cd nhisp
cp .env.example .env
# Edit .env if needed (defaults work for local Docker setup)
```

### 2. Start Services

```bash
docker-compose up --build -d
```

This starts:
- **PostgreSQL** on port `5432`
- **Django API** on port `8000`
- **React Frontend** (via Nginx) on port `3000`

### 3. Seed Demo Data

```bash
docker-compose exec backend python manage.py seed_data
```

### 4. Access the Portal

- **Frontend**: http://localhost:3000
- **API**: http://localhost:8000/api/v1/
- **Django Admin**: http://localhost:8000/admin/

---

## Local Development (without Docker)

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables (or use .env in project root)
export DATABASE_URL=postgres://postgres:postgres@localhost:5432/nhisp_db
export DJANGO_SECRET_KEY=your-secret-key
export DJANGO_DEBUG=True

# Run migrations
python manage.py migrate

# Seed demo data
python manage.py seed_data

# Start dev server
python manage.py runserver
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server (proxied to backend at localhost:8000)
npm run dev
```

---

## Demo Accounts

After running `seed_data`, the following accounts are available:

| Role            | Email                      | Password     |
|-----------------|----------------------------|--------------|
| Admin           | admin@nhisp.gov            | admin123!    |
| Supervisor      | supervisor@nhisp.gov       | super123!    |
| Claims Officer  | officer1@nhisp.gov         | officer123!  |
| Claims Officer  | officer2@nhisp.gov         | officer123!  |
| Citizen         | citizen1@nhisp.gov         | citizen123!  |
| Citizen         | citizen2@nhisp.gov         | citizen123!  |
| Citizen         | citizen3@nhisp.gov         | citizen123!  |

---

## API Endpoints

All endpoints are prefixed with `/api/v1/`.

### Authentication

| Method | Endpoint                | Description              |
|--------|------------------------|--------------------------|
| POST   | `/auth/token/`          | Obtain JWT token pair     |
| POST   | `/auth/token/refresh/`  | Refresh access token      |
| POST   | `/auth/register/`       | Citizen self-registration |
| GET    | `/auth/profile/`        | Get current user profile  |
| POST   | `/auth/change-password/`| Change password           |

### Users (Admin)

| Method | Endpoint                      | Description                |
|--------|-------------------------------|----------------------------|
| GET    | `/users/`                     | List all users             |
| POST   | `/users/`                     | Create user with role      |
| GET    | `/users/{id}/`                | Get user details           |
| PATCH  | `/users/{id}/`                | Update user                |
| POST   | `/users/{id}/deactivate/`     | Deactivate user            |
| POST   | `/users/{id}/activate/`       | Activate user              |

### Policies

| Method | Endpoint                      | Description                |
|--------|-------------------------------|----------------------------|
| GET    | `/policies/`                  | List policies              |
| POST   | `/policies/`                  | Create policy (staff)      |
| GET    | `/policies/{id}/`             | Get policy details         |
| POST   | `/policies/{id}/deactivate/`  | Deactivate policy          |
| POST   | `/policies/{id}/activate/`    | Activate policy            |

### Claims

| Method | Endpoint                      | Description                     |
|--------|-------------------------------|---------------------------------|
| GET    | `/claims/`                    | List claims                     |
| POST   | `/claims/`                    | Submit new claim (citizen)      |
| GET    | `/claims/{id}/`               | Get claim details               |
| POST   | `/claims/{id}/review/`        | Review claim (officer)          |
| POST   | `/claims/{id}/override/`      | Override rejection (supervisor) |
| GET    | `/claims/pending/`            | List pending claims (staff)     |
| GET    | `/claims/rejected/`           | List rejected claims (staff)    |

### Payments

| Method | Endpoint                      | Description                |
|--------|-------------------------------|----------------------------|
| GET    | `/payments/`                  | List payments              |
| POST   | `/payments/`                  | Process payment (staff)    |
| GET    | `/payments/{id}/`             | Get payment details        |

### Providers

| Method | Endpoint                      | Description                |
|--------|-------------------------------|----------------------------|
| GET    | `/providers/`                 | List providers             |
| POST   | `/providers/`                 | Create provider (admin)    |
| GET    | `/providers/{id}/`            | Get provider details       |

### Notifications

| Method | Endpoint                          | Description                |
|--------|-----------------------------------|----------------------------|
| GET    | `/notifications/`                 | List notifications         |
| POST   | `/notifications/{id}/mark-read/`  | Mark as read               |
| POST   | `/notifications/mark-all-read/`   | Mark all as read           |
| GET    | `/notifications/unread-count/`    | Get unread count           |

---

## Claim Status Flow (State Machine)

```
  ┌──────────┐     ┌─────────────┐     ┌──────────┐     ┌──────┐
  │ Submitted │────▶│ UnderReview │────▶│ Approved │────▶│ Paid │
  └──────────┘     └─────────────┘     └──────────┘     └──────┘
       │                  │                                  ▲
       │                  │                                  │
       │                  ▼              Supervisor           │
       │            ┌──────────┐        Override             │
       └───────────▶│ Rejected │────────────────────────────┘
                    └──────────┘
```

### Allowed Transitions

| From        | To          | Allowed Roles                |
|-------------|-------------|------------------------------|
| Submitted   | UnderReview | Claims Officer, Supervisor   |
| Submitted   | Approved    | Claims Officer, Supervisor   |
| Submitted   | Rejected    | Claims Officer, Supervisor   |
| UnderReview | Approved    | Claims Officer, Supervisor   |
| UnderReview | Rejected    | Claims Officer, Supervisor   |
| Approved    | Paid        | Claims Officer, Supervisor   |
| Rejected    | Approved    | Supervisor only (override)   |

---

## Role Permissions

| Feature                  | Citizen | Claims Officer | Supervisor | Admin |
|--------------------------|---------|----------------|------------|-------|
| View own policies        | ✅      | —              | —          | ✅    |
| Submit claims            | ✅      | —              | —          | —     |
| View own claims          | ✅      | —              | —          | ✅    |
| Review claims            | —       | ✅             | ✅         | ✅    |
| Override rejected claims | —       | —              | ✅         | ✅    |
| Process payments         | —       | ✅             | ✅         | ✅    |
| Manage users             | —       | —              | —          | ✅    |
| View all policies        | —       | ✅             | ✅         | ✅    |
| View providers           | ✅      | ✅             | ✅         | ✅    |
| Notifications            | ✅      | ✅             | ✅         | ✅    |

---

## Project Configuration

### Environment Variables

| Variable               | Default                  | Description                    |
|------------------------|--------------------------|--------------------------------|
| `DJANGO_SECRET_KEY`    | (required)               | Django secret key              |
| `DJANGO_DEBUG`         | `False`                  | Debug mode                     |
| `DJANGO_ALLOWED_HOSTS` | `localhost,127.0.0.1`    | Comma-separated allowed hosts  |
| `DATABASE_URL`         | (see .env.example)       | PostgreSQL connection string   |
| `DB_NAME`              | `nhisp_db`               | Database name                  |
| `DB_USER`              | `postgres`               | Database user                  |
| `DB_PASSWORD`          | `postgres`               | Database password              |
| `DB_HOST`              | `localhost`               | Database host                  |
| `DB_PORT`              | `5432`                   | Database port                  |
| `JWT_ACCESS_LIFETIME`  | `60` (minutes)           | JWT access token lifetime      |
| `JWT_REFRESH_LIFETIME` | `10080` (7 days)         | JWT refresh token lifetime     |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000`  | CORS allowed origins           |
| `SEED_DATA`            | `false`                  | Auto-seed on backend start     |
| `VITE_API_BASE_URL`    | `http://localhost:8000`  | Frontend API base URL          |

---

## Testing

### Backend Tests

```bash
cd backend
python manage.py test apps --verbosity=2
```

Tests cover:
- Claim service state transitions (valid and invalid)
- Role-based access control on transitions
- Supervisor override functionality
- User service operations
- Policy service operations

---

## License

This project is for educational and demonstration purposes.
