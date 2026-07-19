# Meowmory

<p align="center">
  <img src="frontend/public/meowmory.png" alt="Meowmory cat logo" width="128" />
</p>

<p align="center"><strong>A softer way to remember words.</strong></p>

> Turn the words you need to learn into stories you want to read.

Meowmory is a warm, vocabulary-first language learning workspace. Learners bring their own words—or start with a built-in vocabulary—and turn them into short, readable stories with language, difficulty, style, and opening-line controls.

It is designed for the space between flashcards and full courses: small daily practice, meaningful context, and a little cat-powered encouragement.

## Why Meowmory?

Traditional vocabulary tools are excellent at repetition, but often separate words from the situations in which people actually use them. Meowmory keeps the target vocabulary at the centre while giving learners a more memorable context.

- Vocabulary-first story generation
- Multilingual words, stories, and user preferences
- Interactive reading with highlighted vocabulary and word lookup
- Personal accounts with isolated stories, words, settings, and learning streaks
- A calm, minimal interface designed for consistent practice
- Redis caching and Celery task processing for a production-ready growth path

## Product flow

```text
Choose a language
        ↓
Import or select vocabulary
        ↓
Choose difficulty, mood, and story length
        ↓
Generate a short story
        ↓
Read in context and look up highlighted words
        ↓
Build a daily learning streak
```

## Architecture

![Meowmory high-level system architecture](docs/High-LevelSystemArchitecture.png)

The system is split into a lightweight React client, a FastAPI application layer, asynchronous story-generation workers, and durable/cache data services.

- **Frontend** — React + Vite single-page application with responsive learning flows.
- **Backend API** — FastAPI + SQLModel for authentication, vocabulary, stories, profiles, settings, and streaks.
- **Async processing** — Celery workers use Redis as a broker/result backend for asynchronous generation.
- **Data layer** — PostgreSQL is the recommended database; SQLite remains a convenient local fallback.
- **Caching** — Redis caches vocabulary and story-list reads and exposes its status through `/health`.
- **Provider boundary** — Story generation currently defaults to a deterministic local fallback, keeping development usable without external API keys. The LLM client boundary is ready for a provider-backed implementation.

## Core capabilities

### Learn through stories

Select a vocabulary, choose the target words, set a reading level and mood, and generate a short story. Generated stories retain their language label and belong only to the requesting user.

### Read with context

Stories present target vocabulary as interactive highlights. Selecting a word opens a lookup view without taking the learner away from the story.

### Keep learning in your own language

Words, stories, vocabularies, and user preferences carry language labels. The current language set includes English, Chinese, Swedish, Japanese, Korean, French, German, and Spanish.

### Build a real learning habit

The five-day streak is backed by daily learning records. Uploading words, generating a story, and opening a story can count as learning activity. The product tracks current streak, longest streak, today’s completion, and progress toward the five-day goal.

### Own your account

Users can sign up with email and password or Google, update their profile and preferred language, sign out, and permanently delete their account and personal learning data.

## Technology

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, React Router |
| Backend | FastAPI, Pydantic, SQLModel, SQLAlchemy |
| Database | PostgreSQL 16, SQLite fallback |
| Migrations | Alembic |
| Cache and task broker | Redis 7 |
| Background jobs | Celery |
| Authentication | Email/password, Google Identity Services, signed tokens |
| Quality checks | Pytest, ESLint, Vite production build |
| Local orchestration | Docker Compose |

## Quick start

### 1. Install dependencies

Requirements: Python 3.12+, Node.js 22+, npm, and Docker Desktop for the PostgreSQL/Redis path.

```bash
git clone <your-repository-url>
cd meowmory

python3.12 -m venv backend/venv
backend/venv/bin/python -m pip install --upgrade pip
backend/venv/bin/pip install -r backend/requirements.txt

cd frontend
npm ci
cd ..
```

### 2. Start PostgreSQL and Redis

```bash
docker compose up -d postgres redis
```

Set the backend environment variables in your shell or process manager:

```bash
export MEOWMORY_DATABASE_URL='postgresql+psycopg2://meowmory:meowmory@localhost:5432/meowmory'
export MEOWMORY_REDIS_URL='redis://localhost:6379/0'
export MEOWMORY_JWT_SECRET='replace-with-a-long-random-secret'
```

For Google sign-in, set `GOOGLE_CLIENT_ID` in the backend and the same client ID as `VITE_GOOGLE_CLIENT_ID` for the frontend. The example files are available at [`backend/.env.example`](backend/.env.example) and [`frontend/.env.example`](frontend/.env.example).

### 3. Run database migrations

```bash
cd backend
./venv/bin/alembic upgrade head
cd ..
```

### 4. Start the backend

```bash
cd backend
./venv/bin/uvicorn app.main:app --reload
```

To enable asynchronous story generation, start a worker in a second terminal:

```bash
cd backend
./venv/bin/celery -A app.worker.celery_app.celery_app worker --loglevel=info
```

### 5. Start the frontend

```bash
cd frontend
npm run dev
```

The app is normally available at [http://localhost:5173](http://localhost:5173), with the API at [http://localhost:8000](http://localhost:8000).

## Lightweight local mode

For quick UI or backend development, the API can fall back to `backend/dev.db` when `MEOWMORY_DATABASE_URL` is not set. Redis is optional for synchronous flows: cached reads fall back to the database, while asynchronous generation requires Redis.

Check service health at:

```text
GET http://localhost:8000/health
```

## Useful commands

```bash
# Backend tests
cd backend
./venv/bin/pytest -q

# Frontend quality checks
cd frontend
npm run lint
npm run build

# Redis cache benchmark
cd ..
backend/venv/bin/python scripts/benchmark_redis.py

# Validate the local service configuration
docker compose config --quiet
```

## API surface

The main API groups are available under `/api/v1`:

| Area | Examples |
| --- | --- |
| Authentication | `/auth/register`, `/auth/login`, `/auth/google`, `/auth/me` |
| Vocabulary | `/words`, `/words/csv`, `/vocabularies/recent` |
| Stories | `/stories/generate`, `/stories`, `/stories/{story_id}` |
| Async stories | `/stories/generate/async`, `/stories/jobs/{task_id}` |
| Learning stats | `/stats/streak`, `/stats/activity` |

## Repository layout

```text
meowmory/
├── backend/
│   ├── app/api/             # FastAPI routes
│   ├── app/models/          # SQLModel database models
│   ├── app/services/        # Story, vocabulary, and streak logic
│   ├── app/worker/          # Celery application and tasks
│   ├── app/db/migrations/   # Alembic migrations
│   └── tests/               # Backend tests
├── frontend/
│   ├── src/pages/           # Main learning and account pages
│   ├── src/components/      # Reusable learning UI
│   └── src/api/             # Typed API clients
├── docs/                    # Architecture, ER, and design material
├── scripts/                 # Seed and benchmark utilities
└── docker-compose.yml       # PostgreSQL and Redis services
```

## CI/CD

GitHub Actions is configured in [`.github/workflows/ci.yml`](.github/workflows/ci.yml). Every push, pull request, or manual run checks:

- PostgreSQL-backed Alembic migrations
- Redis-enabled backend tests and Python compilation
- Frontend dependency installation, ESLint, and production build
- Docker Compose configuration validity

The frontend build is uploaded as a workflow artifact. Production deployment is intentionally left provider-neutral until a hosting target and deployment credentials are selected.

## Project direction

Meowmory is being shaped around a simple principle: make language practice feel small enough to return to, and meaningful enough to remember.

The next natural extensions are richer provider-backed generation, spaced review sessions, audio support, and deeper progress insights—all without losing the vocabulary-first learning loop.
