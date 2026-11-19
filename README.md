# CS1530_Project_Team_Falcons
Chinese Cuisine Knowledge Base

Team name: Team Falcons

Team members:

1.Mingyu Chen

2.Jiakai Dai

3.Haoyang Sun

4.Runxi Lao

Project Purpose: Chinese Cuisine Knowledge Base helps college students and young adults who cook at home decide what to make with the ingredients they already have. Users enter their available ingredients, and the system returns Chinese recipes ranked by how well they match, shows which ingredients are missing, and provides step-by-step cooking instructions. Users can also filter recipes by regional cuisine or dietary restriction, save favorites, and comment on recipes, while administrators maintain the accuracy of the recipe database.

We plan to build the system as a responsive web application and an Android/iOS mobile app using React Native with Expo, so that both clients can share most of the same code. Both clients will communicate with a shared backend API built with Python and FastAPI, and recipe data will be stored in a PostgreSQL database with UTF-8 encoding to support Chinese and English content. One thing we are unsure about is how to reliably match ingredient names entered in Chinese and in English, including synonyms and regional naming differences, to the same ingredient in our database.

## Tech Stack

| Layer | Technology |
|---|---|
| Languages | JavaScript (client), Python (server), SQL / PostgreSQL (data) |
| Frontend | React Native + Expo (web + Android/iOS), i18next (English/Chinese), AsyncStorage (favorites on the device) |
| Backend | Python 3.12+ with FastAPI, served by Uvicorn |
| Database | PostgreSQL with UTF-8 encoding |
| APIs / External services | None for the MVP (recipe data is imported into our own database once) |
| Deployment / Hosting | Render (backend, HTTPS), Expo web, Expo Go (demo on phones) |

## Architecture

### Subsystem decomposition (Sprint 3)

![Subsystem decomposition](docs/images/subsystem-decomposition.png)

The system follows a three-layer client-server architecture: a client tier (presentation), a server tier for application logic, and a server tier for data.

### Deployment diagram (Sprint 4)

![Deployment diagram](docs/images/deployment-diagram.png)

During development everything runs on the developer's laptop: the Expo client calls the FastAPI server over HTTP/REST (JSON), and the server talks to PostgreSQL over SQL/TCP.

### Which folder contains which subsystem

| Layer | Subsystem (Sprint 3) | Folder | Status |
|---|---|---|---|
| Client tier | User Interface | `frontend/ui/` (+ `frontend/api/`) | Ingredient input, tags, ranked results with missing ingredients (Sprint 5) |
| Client tier | Favorites | `frontend/favorites/` | Placeholder (`.gitkeep`) |
| Server tier – application logic | Search & Matching | `backend/search_matching/` | `GET /ingredients`, `POST /search` (Sprint 5) |
| Server tier – application logic | Recipe Catalog | `backend/recipe_catalog/` | Skeleton router with `GET /recipes/health` |
| Server tier – application logic | Recipe Administration | `backend/recipe_admin/` | Placeholder (`.gitkeep`) |
| Server tier – application logic | Comments | `backend/comments/` | Placeholder (`.gitkeep`) |
| Server tier – data | Data Management | `backend/data_management/` | PostgreSQL schema, connection, seed data (Sprint 5) |

Other files:

- `backend/main.py` – FastAPI entry point; creates the app and registers the subsystem routers.
- `backend/requirements.txt` – pinned Python dependencies.
- `docs/` – diagrams (`docs/images/`) and the skeleton test logs from team members.

```
CS1530_Project_Team_Falcons/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── search_matching/     # Search & Matching
│   ├── recipe_catalog/      # Recipe Catalog
│   ├── recipe_admin/        # Recipe Administration
│   ├── comments/            # Comments
│   └── data_management/     # Data Management
├── frontend/                # Expo app (App.js, package.json)
│   ├── api/                 # HTTP client for the FastAPI backend
│   ├── ui/                  # User Interface
│   ├── favorites/           # Favorites
│   └── __tests__/           # Jest tests
├── docs/
│   ├── images/
│   └── sprint4-*-test.txt
├── user-stories.md
└── README.md
```

## How to Run the Skeleton

### Prerequisites

- Python 3.12 or newer (tested with Python 3.12.7 and 3.13.4)
- pip (comes with Python)
- Git
- No database, Node.js or API key is needed for the health-check skeleton below. To run the Sprint 5 search features with the database and the frontend, see [Run the Full App](#run-the-full-app-sprint-5-us1us3).

Dependencies (installed in step 3): FastAPI 0.162.2 and Uvicorn 0.54.0.

### 1. Clone the repository

```bash
git clone https://github.com/CmyzzZ/CS1530_Project_Team_Falcons.git
cd CS1530_Project_Team_Falcons
```

### 2. Create and activate a virtual environment

Windows (PowerShell):

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

Windows (Git Bash):

```bash
python -m venv .venv
source .venv/Scripts/activate
```

macOS / Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install the dependencies

```bash
pip install -r backend/requirements.txt
```

### 4. Start the server

Run this from the repository root (the folder that contains `backend/`), not from inside `backend/`:

```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

You should see:

```
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

Press `Ctrl+C` to stop the server.

### 5. Check that it works

With the server running, open these URLs in a browser, or use `curl` in a second terminal:

| Subsystem | Request | Expected response |
|---|---|---|
| Search & Matching | `GET http://127.0.0.1:8000/health` | `200 OK`, `{"status":"ok"}` |
| Recipe Catalog | `GET http://127.0.0.1:8000/recipes/health` | `200 OK`, `{"status":"ok"}` |

```bash
curl http://127.0.0.1:8000/health
```

```bash
curl http://127.0.0.1:8000/recipes/health
```

You can also open the interactive API docs at <http://127.0.0.1:8000/docs>; both endpoints are listed there under "Search & Matching" and "Recipe Catalog".

### Troubleshooting

- `ModuleNotFoundError: No module named 'backend'` – you started Uvicorn from inside `backend/`. Go back to the repository root and run the command again.
- `python` is not found on macOS/Linux – use `python3` instead.
- PowerShell blocks `Activate.ps1` – run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once, or use Git Bash.
- Port 8000 is already in use – start with `--port 8001` and use that port in the URLs.

### Secrets

Do not commit passwords or API keys. `.env` is ignored by Git. When the database connection is added, settings such as the database URL will be documented in `.env.example`; copy it to `.env` and fill in your own values.

## Run the Full App (Sprint 5: US1–US3)

Extra prerequisites: Docker Desktop (for PostgreSQL) and Node.js 22.13+ or 24+.

1. Start PostgreSQL and load the development data (from the repository root, with the virtual environment active):

   ```bash
   docker compose up -d --wait
   ```

   PowerShell:

   ```powershell
   $env:DATABASE_URL = "postgresql://falcons:falcons_dev@127.0.0.1:55432/falcons"
   python -m backend.data_management.init_db
   ```

   Git Bash / macOS / Linux:

   ```bash
   export DATABASE_URL=postgresql://falcons:falcons_dev@127.0.0.1:55432/falcons
   python -m backend.data_management.init_db
   ```

2. Start the backend in the same terminal (so `DATABASE_URL` is set):

   ```bash
   python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
   ```

3. Start the frontend in a second terminal:

   ```bash
   cd frontend
   npm install
   npx expo start --web --port 8081
   ```

   Open <http://localhost:8081>. Type ingredients in English or Chinese (for example `西红柿`, `eggs`) or tap a common ingredient; matching dishes appear below, full matches first, with missing ingredients in red.

   The app calls `http://127.0.0.1:8000` by default. To use another backend address (for example your laptop's LAN IP when testing with Expo Go on a phone), copy `frontend/.env.example` to `frontend/.env.local` and change `EXPO_PUBLIC_API_URL`. The backend only accepts browser requests from the origins in `FRONTEND_ORIGINS` (default: ports 8081 and 19006 on localhost).

4. Run the tests:

   ```bash
   python -m pytest
   ```

   ```bash
   cd frontend
   npm test
   ```

## What Works So Far

- Search & Matching: `GET /ingredients` lists the bilingual ingredient catalog; `POST /search` returns recipes ranked by match ratio (full matches first) with matched and missing ingredients.
- Data Management: PostgreSQL schema, connection and development seed data (`backend/data_management/`), started with `compose.yaml`.
- User Interface (Expo web): bilingual ingredient input with autocomplete, removable ingredient tags, a common-ingredient list, ranked recipe cards with matched/missing ingredients, an English/Chinese language switch, and error messages when the backend or database is unavailable.
- CI runs the backend tests and the frontend tests plus an Expo web build on every pull request.

## What Does Not Work Yet

- The development dataset has only four ingredients and four recipes; the real recipe import is not done.
- Recipe details (US5), favorites (US6), filters (US4), comments and recipe administration are not implemented yet.
- The Expo app has only been checked in a desktop browser at phone and desktop widths, not yet in Expo Go on a real Android/iOS phone.
- Nothing is deployed to Render yet; everything runs locally.
