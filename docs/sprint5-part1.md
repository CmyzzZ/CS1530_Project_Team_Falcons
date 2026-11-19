# Sprint 5 – Part 1: Feature Implementation

This sprint implements the first three MVP user stories of epic E1 (Recipe Discovery and Matching), end to end from the PostgreSQL database to the Expo client:

- **US1** Input available ingredients (issue #2)
- **US2** Search dishes by ingredient match (issue #3)
- **US3** Identify missing recipe ingredients (issue #4)

The work follows the Sprint 3/4 design: a three-tier architecture with the Expo client (User Interface subsystem, `frontend/`), the FastAPI server (Search & Matching subsystem, `backend/search_matching/`) and PostgreSQL (Data Management subsystem, `backend/data_management/`), talking over HTTP/REST (JSON) as in the deployment diagram. The `IngredientSearch` and `RecipeMatch` classes from the Analysis Object Model map to the `POST /search` request and its result items.

Sprint backlog: <https://github.com/CmyzzZ/CS1530_Project_Team_Falcons/issues>

## 1.1 Backend Implementation (Haoyang Sun, PR #23)

- **Ingredient input support:** `GET /ingredients` returns the available ingredients with English names, Chinese names and stored aliases. Ingredient normalization handles capitalization, whitespace, full-width characters and duplicate inputs.
- **Recipe matching:** `POST /search` accepts ingredient names or IDs and returns matching recipes. Recipes are ranked by the proportion of required ingredients available, with full matches first. Recipes with no matching ingredients are excluded.
- **Missing ingredients:** search results include matched and missing ingredient counts, bilingual ingredient details and an `is_full_match` flag for the frontend.
- **Database:** PostgreSQL tables for ingredients, recipes and recipe–ingredient relationships, with initialization code and a Docker Compose configuration. The development dataset contains four ingredients and four simplified recipes.

## 1.2 Frontend Implementation (Jiakai Dai, PR #24)

The frontend is the React Native + Expo app planned in the tech stack (Expo SDK 58, React Native Web for the browser, i18next for English/Chinese). Code lives in `frontend/ui/` (User Interface subsystem) and `frontend/api/client.js` (HTTP client).

**US1 – ingredient input**

- A search box accepts ingredient names in English or Chinese. While typing, suggestions from `GET /ingredients` match English names, Chinese names and aliases (for example `西红柿` suggests Tomato / 番茄). Enter or the **Add** button adds the ingredient; several can be entered at once separated by commas (`,` `，` `、`).
- A **Common ingredients** list (from the same catalog) lets the user pick ingredients with one tap.
- Selected ingredients appear as tags. Tapping a tag removes it; **Clear all** removes every tag.
- The same ingredient cannot be added twice, even in different languages (`tomato` and `番茄` give one tag). Text that is not in the catalog is still added, but shown as a dashed tag with a note that it will not match any recipe yet.
- Input limits match the backend validation (at most 50 ingredients, 80 characters each).

**US2 – ranked results**

- Every time the tag list changes, the app calls `POST /search` with the ingredient IDs and shows the results in the order returned by the backend: **You can cook these now** (full matches) above **Partial matches**.
- Each recipe card shows the dish name in the selected language (the other language underneath), "Matched X of Y ingredients", and a progress bar of the match ratio.
- An **English / 中文** switch changes all labels, dish names and ingredient names. The starting language follows the browser language.
- The measured response time is shown above the results ("3 recipes found in 26 ms").

**US3 – missing ingredients**

- Missing ingredients are listed as red tags under **Missing (N)**, and the card header shows a red "Missing N" badge.
- Recipes with nothing missing show a green **✓ All ingredients ready** badge.

**Error handling and layout**

- If the ingredient list cannot be loaded, a banner with **Retry** appears and typing still works. Search errors show a specific message: server unreachable, timeout, or recipe database unavailable (HTTP 503). Out-of-date responses are discarded when the user changes the tags quickly.
- The layout is a single centered column (maximum 760 px) that wraps tags and card headers, so it works from phone to desktop width.

## 1.3 Integration and Validation

**Automated tests**

| Suite | Result |
|---|---|
| Backend (`python -m pytest`, with `TEST_DATABASE_URL` set to the Docker PostgreSQL) | 19 passed, including the PostgreSQL integration test |
| Frontend (`npm test`, Jest + React Native Testing Library) | 19 passed: ingredient normalization/tag logic, API client (request format, 503 and network errors), and screen tests (Chinese alias → tag → ranked results, full/partial grouping, tag removal, language switch, backend-down message) |

CI now has a second job that installs the frontend, runs the Jest tests and builds the Expo web bundle on every pull request.

**Manual end-to-end check** (Nov 19, 2026; Windows 11, PostgreSQL 17 in Docker, FastAPI on port 8000, Expo web on port 8081):

| Step | Result |
|---|---|
| Type `西红柿`, then `EGGS` | Tags "Tomato" and "Egg"; 3 recipes in order 1 Tomato and Eggs (full), 4 Tomato and Egg Rice (missing Cooked rice), 2 Egg Fried Rice (missing Cooked rice) – the same order as the backend evidence |
| Response time shown in the UI | 14–26 ms locally (US2 target: < 1.5 s) |
| Type `米` and press Enter | Suggestion 米饭 / Cooked rice is added |
| Type `豆腐, cucumber` | Dashed "豆腐" tag with the not-in-catalog note, plus "黄瓜"; Cucumber Salad shown as a full match |
| Tap a tag | Tag removed and results refreshed |
| 360 px wide viewport | No horizontal scrolling, 0 elements outside the viewport, no console errors |
| Stop the PostgreSQL container and search | Backend returns 503; UI shows "The recipe database is unavailable"; search works again after restarting the database |

Evidence: `docs/sprint5-evidence/` (backend API responses and pytest output, `frontend-jest-results.txt`, `frontend-search-desktop-en.jpg`, `frontend-search-mobile-zh.jpg`).

## 1.4 Sprint Backlog (planned vs. completed)

| # | Issue | Work | Assigned To | Status | PR |
|---|---|---|---|---|---|
| 1 | #2 US1: Input available ingredients | Backend: ingredient catalog (`GET /ingredients`) and bilingual input normalization | Haoyang Sun | Done (merged) | #23 |
| 2 | #2 US1: Input available ingredients | Frontend: English/Chinese input with suggestions, common-ingredient list, removable tags | Jiakai Dai | Done (PR in review) | #24 |
| 3 | #3 US2: Search dishes by ingredient match | Backend: ingredient-based search and ranking (`POST /search`) | Haoyang Sun | Done (merged) | #23 |
| 4 | #3 US2: Search dishes by ingredient match | Frontend: ranked recipe cards, full/partial grouping, match count, language switch | Jiakai Dai | Done (PR in review) | #24 |
| 5 | #4 US3: Identify missing recipe ingredients | Backend: missing-ingredient calculation and response data | Haoyang Sun | Done (merged) | #23 |
| 6 | #4 US3: Identify missing recipe ingredients | Frontend: red missing-ingredient tags and "All ingredients ready" badge | Jiakai Dai | Done (PR in review) | #24 |
| 7 | #16 Database setup | PostgreSQL schema, connection and initialization | Haoyang Sun | Done (merged) | #23 |
| 8 | #18 Expo frontend skeleton | React Native + Expo project, web support, Jest setup | Jiakai Dai | Done (PR in review) | #24 |
| 9 | — Integration | Frontend–backend integration, end-to-end check, frontend CI job | Jiakai Dai | Done (PR in review) | #24 |

**Planned but not finished this sprint**

| Item | Status | Reason |
|---|---|---|
| US2 "results in < 1.5 s" measured on a deployed backend over 4G/Wi-Fi (NFR1) | Not done | Only measured locally (14–26 ms); the backend is not deployed to Render yet |
| Check on Android/iOS with Expo Go (NFR7) | Not done | Checked in a desktop browser at 360 px and 900 px width only |
| Full recipe dataset import | Not started | The development data has 4 ingredients and 4 recipes, so the common-ingredient list is short |
