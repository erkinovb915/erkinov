# ERKINOV LOYIHASI — Interactive 3D Portfolio for ERKINOV BOBURJON

A futuristic, mobile-first interactive **3D Hardcover Book Portfolio** built for **ERKINOV BOBURJON**, branded **“ERKINOV LOYIHASI”**.

The repository cleanly separates the static **React + Vite + JavaScript** frontend (`frontend/`) from the **Python 3.11+ FastAPI + PostgreSQL** backend (`backend/`), allowing the frontend to deploy directly to **Netlify** without depending on a local server to render the portfolio.

---

## Key Highlights

- **Interactive 3D Hardcover Book (`Three.js` / `@react-three/fiber` / `@react-three/drei`)**:
  - Realistic closed hardcover book centered in 3D space with dynamic directional shadows, neon purple/blue/cyan rim lights, sculpted spine binder, and layered paper block edges.
  - **Drag the front cover to the RIGHT** to open it around its spine with damped spring physics and organic page curvature.
  - Mouse and touchscreen drag gestures to flip pages forward (`drag right`) and backward (`drag left`), plus secondary Previous/Next buttons, direct 10-page jump tabs, keyboard arrow navigation, and mobile single-page zoom focus.
  - **Loading animation** (`GSAP`) and **graceful non-WebGL fallback** (`WebGLErrorBoundary` + interactive CSS-3D Reader view).
- **Exact 10 Logical Book Pages**:
  1. **Cover** — `ERKINOV BOBURJON` (`ERKINOV LOYIHASI`)
  2. **About Me**
  3. **Skills** — `HTML`, `CSS`, `JavaScript`, `React`, `Python`, `Three.js`, `Telegram Bots`, `Git/GitHub`
  4. **My Journey**
  5. **MoneyFlow** — Personal finance Telegram bot (`https://moneyflow-website.netlify.app`)
  6. **SHERDOOR AKFA** — Employee attendance Telegram bot
  7. **Technologies**
  8. **Projects** — Exclusively `MoneyFlow` and `SHERDOOR AKFA`
  9. **Contact** — Telegram (`https://t.me/Erkinov_1105`), Instagram (`https://www.instagram.com/Erkinov_neww/`), Email/GitHub placeholders, and a **live PostgreSQL-confirmed contact form**
  10. **Back Cover** — `“DREAM BIG. BUILD DIFFERENT.”`
- **Production FastAPI + PostgreSQL Backend**:
  - Python 3.11+, FastAPI, SQLAlchemy 2.0, Alembic migrations, Pydantic v2 validation, and environment-driven configuration.
  - Idempotent project seeding (`MoneyFlow` and `SHERDOOR AKFA` without duplicates).
  - Contact form displays success **only** after PostgreSQL commits the message and returns a verified database record ID.
  - Admin messages endpoint protected by constant-time `ADMIN_API_KEY` authentication.

---

## Project Structure

```text
.
├── netlify.toml                  # Netlify build & SPA redirect configuration
├── .env.example                  # Root environment variable overview
├── README.md                     # Setup & deployment guide
├── frontend/                     # Deployable static React + Vite + JS app
│   ├── .env.example              # VITE_API_BASE_URL template
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── public/
│   │   ├── _redirects
│   │   └── favicon.svg
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       ├── components/
│       │   ├── Book3DScene.jsx
│       │   ├── ContactPanel.jsx
│       │   ├── FallbackBookReader.jsx
│       │   ├── LoadingScreen.jsx
│       │   └── WebGLErrorBoundary.jsx
│       ├── data/
│       │   └── portfolioData.js
│       ├── lib/
│       │   └── api.js
│       └── utils/
│           ├── bookTextures.js
│           └── webgl.js
└── backend/                      # Separate FastAPI + PostgreSQL + Alembic API
    ├── .env.example
    ├── alembic.ini
    ├── requirements.txt
    ├── start.sh
    ├── Procfile
    ├── alembic/
    │   ├── env.py
    │   └── versions/
    │       └── 20261029_0001_initial_schema.py
    ├── app/
    │   ├── main.py
    │   ├── config.py
    │   ├── database.py
    │   ├── models.py
    │   ├── schemas.py
    │   ├── auth.py
    │   ├── seed.py
    │   └── routers/
    │       ├── health.py
    │       ├── portfolio.py
    │       ├── projects.py
    │       ├── contact.py
    │       └── admin.py
    └── tests/
        └── test_api.py
```

---

## Backend API Endpoints

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Verifies FastAPI & live PostgreSQL connectivity (`SELECT 1`) |
| `GET` | `/api/portfolio` | Public | Complete portfolio payload, 10-page metadata, skills, links & projects |
| `GET` | `/api/projects` | Public | Lists canonical seeded projects (`MoneyFlow`, `SHERDOOR AKFA`) |
| `GET` | `/api/projects/{project_id}` | Public | Fetches single project by numeric `id` or `slug` (`moneyflow`, `sherdoor-akfa`) |
| `POST` | `/api/contact` | Public | Validates input via Pydantic and commits contact message to PostgreSQL |
| `GET` | `/api/admin/messages` | **Admin** | Paginated list of saved contact messages (`Authorization: Bearer <ADMIN_API_KEY>` or `X-Admin-Key: <ADMIN_API_KEY>`) |

---

## Local Development Setup

### 1. PostgreSQL Database Setup

Ensure PostgreSQL 14+ is running locally, then create the database and user:

```bash
psql -U postgres -c "CREATE USER portfolio_user WITH PASSWORD 'your_local_password';"
psql -U postgres -c "CREATE DATABASE erkinov_portfolio OWNER portfolio_user;"
```

### 2. Backend Setup (`backend/`)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Edit backend/.env with your DATABASE_URL and a strong ADMIN_API_KEY:
# python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# Run PostgreSQL migrations via Alembic
alembic upgrade head

# Seed MoneyFlow and SHERDOOR AKFA (idempotent — zero duplicates)
python -m app.seed

# Start FastAPI server on port 8000
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Verify admin endpoint locally:

```bash
curl -H "Authorization: Bearer YOUR_ADMIN_API_KEY" http://localhost:8000/api/admin/messages
```

### 3. Frontend Setup (`frontend/`)

Open a second terminal:

```bash
cd frontend
cp .env.example .env
# Leave VITE_API_BASE_URL empty locally to use Vite's /api proxy to http://127.0.0.1:8000,
# or set VITE_API_BASE_URL=http://localhost:8000

npm install
npm run dev
```

Visit `http://localhost:5173`. Note that even if the backend server is stopped, the frontend renders all 10 3D book pages independently without errors.

---

## Production Deployment Guide

### Step 1: Deploy PostgreSQL + FastAPI Backend (Render / Railway / Fly.io + Neon/Supabase)

1. Provision a managed **PostgreSQL** database (e.g., Render PostgreSQL, Neon, Supabase, or Railway PostgreSQL) and copy its connection URL (`DATABASE_URL`).
2. Create a new Python Web Service pointing to the **`backend`** root directory:
   - **Build Command**: `pip install -r requirements.txt && alembic upgrade head && python -m app.seed`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT` (or `bash start.sh`)
3. Set the following **Backend Environment Variables** (never commit secrets):
   - `DATABASE_URL` = `<your-postgresql-connection-string>`
   - `ADMIN_API_KEY` = `<strong-random-32-byte-secret>`
   - `CORS_ORIGINS` = `https://your-site-name.netlify.app`
   - `APP_ENV` = `production`
4. Verify your deployed API health check at `https://<your-backend-domain>/api/health`.

### Step 2: Deploy Static Frontend to Netlify

`netlify.toml` at the repository root is pre-configured with the required settings:

- **Build command**: `cd frontend && npm install && npm run build`
- **Publish directory**: `frontend/dist`

1. Push this repository to GitHub/GitLab and import it into **Netlify**.
2. Confirm Netlify detects:
   - **Build command**: `cd frontend && npm install && npm run build`
   - **Publish directory**: `frontend/dist`
3. Under **Netlify → Site configuration → Environment variables**, add:
   - `VITE_API_BASE_URL` = `https://<your-backend-domain>` *(no trailing slash; never place `ADMIN_API_KEY` or `DATABASE_URL` in Netlify!)*
4. Trigger a deploy. Once Netlify assigns your final domain (e.g. `https://erkinov-loyihasi.netlify.app`), ensure that exact origin is listed in your backend's `CORS_ORIGINS` environment variable.

---

## Replacing Placeholder Links

Email and GitHub links use explicit placeholders (`your.email@example.com` and `https://github.com/your-username`). When ready, update them in:
- `frontend/src/data/portfolioData.js` (`socials.emailPlaceholder` & `socials.githubPlaceholder`)
- `backend/app/routers/portfolio.py` (`SocialLinksOut`)
