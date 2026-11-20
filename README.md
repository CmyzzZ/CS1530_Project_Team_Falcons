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
| Client tier | User Interface | `frontend/ui/` | Placeholder (`.gitkeep`) |
| Client tier | Favorites | `frontend/favorites/` | Placeholder (`.gitkeep`) |
| Server tier – application logic | Search & Matching | `backend/search_matching/` | Skeleton router with `GET /health` |
| Server tier – application logic | Recipe Catalog | `backend/recipe_catalog/` | Skeleton router with `GET /recipes/health` |
| Server tier – application logic | Recipe Administration | `backend/recipe_admin/` | Placeholder (`.gitkeep`) |
| Server tier – application logic | Comments | `backend/comments/` | Placeholder (`.gitkeep`) |
| Server tier – data | Data Management | `backend/data_management/` | Placeholder (`.gitkeep`) |

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
├── frontend/
│   ├── ui/                  # User Interface
│   └── favorites/           # Favorites
├── docs/
│   ├── images/
│   └── sprint4-*-test.txt
├── user-stories.md
└── README.md
```

## Features

### Search recipes by ingredients (US1, US2)
Type the ingredients you have in English or Chinese (for example `tomato` or `鸡蛋`) and press Enter or **Add**, or tap a common ingredient below the input. Each ingredient appears as a tag; tap a tag to remove it, or use **Clear all**. The app returns Chinese dishes that use at least one of your ingredients: full matches appear first under "You can cook these now", and partial matches follow, sorted by how many ingredients match.

### See missing ingredients (US3)
Each recipe card shows "Matched X of Y ingredients", the ingredients you already have, and the ingredients you are missing in red. Recipes with nothing missing are marked "All ingredients ready", so you know what to buy before you cook.

### Save favorite recipes (US6)
Tap the star icon on a recipe card to save it, and tap it again to remove it. Open **Favorites** at the top of the page to see all saved recipes and remove any of them. Favorites are stored on your device, so no account or login is needed.

### English and Chinese interface
Tap **中文** / **English** in the top-right corner to switch the interface language. Recipe names are shown in both languages.

## How to Run

### Prerequisites

- Python 3.12 or newer
- Node.js (LTS version) and npm
- Docker Desktop (to run PostgreSQL), or a local PostgreSQL installation
- Git

### 1. Clone the repository

```bash
git clone https://github.com/CmyzzZ/CS1530_Project_Team_Falcons.git
cd CS1530_Project_Team_Falcons
```

### 2. Start the database

Make sure Docker Desktop is running, then start PostgreSQL from the repository root:

```bash
docker compose up -d
```

This starts PostgreSQL 17 with UTF-8 encoding on `127.0.0.1:55432`.

### 3. Set up the backend

Create and activate a virtual environment (Windows PowerShell shown; on macOS/Linux use `python3 -m venv .venv` and `source .venv/bin/activate`):

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
```

Set the `DATABASE_URL` environment variable. It is only valid in the current terminal, so set it again whenever you open a new one:

```powershell
# Windows PowerShell
$env:DATABASE_URL="postgresql://falcons:falcons_dev@127.0.0.1:55432/falcons"
```

```bash
# macOS / Linux / Git Bash
export DATABASE_URL="postgresql://falcons:falcons_dev@127.0.0.1:55432/falcons"
```

Create the tables and load the development recipes:

```bash
python -m backend.data_management.init_db
```

You should see `Database tables and development data are ready.`

### 4. Start the backend

From the repository root, in the same terminal:

```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

Check it at <http://127.0.0.1:8000/docs>.

### 5. Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npx expo start --web
```

The web app opens at <http://localhost:8081>. To try the mobile app, run `npx expo start` and scan the QR code with Expo Go on your phone. In that case, copy `frontend/.env.example` to `frontend/.env.local` and set `EXPO_PUBLIC_API_URL` to your laptop's LAN IP (for example `http://192.168.1.20:8000`), because the phone cannot reach `127.0.0.1` on your laptop.

### 6. Run the tests

Backend (from the repository root):

```bash
pip install -r backend/requirements-dev.txt
python -m pytest -v
```

The PostgreSQL integration test is skipped unless `TEST_DATABASE_URL` is set.

Frontend (from `frontend/`):

```bash
npm test
```

### Troubleshooting

- `ModuleNotFoundError: No module named 'backend'` – you started Uvicorn from inside `backend/`. Go back to the repository root and run the command again.
- `python` is not found on macOS/Linux – use `python3` instead.
- PowerShell blocks `Activate.ps1` – run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once, or use Git Bash.
- Port 8000 is already in use – start with `--port 8001` and use that port in the URLs.
- `docker` is not recognized – install Docker Desktop, start it, and open a new terminal.
- The app shows that the recipe database is unavailable (HTTP 503) – `DATABASE_URL` is not set in the terminal running the backend, or the database container is not running (`docker compose up -d`).

### Secrets

Do not commit passwords or API keys. `.env` is ignored by Git. The database password in `compose.yaml` is for local development only.

## What Works So Far

- Ingredient search (US1, US2): enter ingredients in English or Chinese and get Chinese recipes ranked by match quality, with full matches first.
- Missing ingredients (US3): each recipe card shows matched and missing ingredients.
- Favorites (US6): save and remove recipes with the star icon; favorites are stored on the device.
- The interface can switch between English and Chinese.
- Recipe and ingredient data are stored in PostgreSQL (UTF-8) and loaded through the Data Management subsystem.
- CI runs the backend build and tests on every pull request targeting `main`.

## What Does Not Work Yet

- Recipe details with cooking steps and prep time (US5).
- Filtering by regional cuisine or dietary restriction (US4).
- Recipe Administration (US8–US10) and Comments (US7).
- Nothing is deployed to Render yet; the app only runs locally.
