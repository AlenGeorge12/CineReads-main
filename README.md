CineReads

CineReads recommends fiction books inspired by movies you love. It blends theme-level reasoning (LLM) with real book data (Hardcover API) to produce smart, human-like recommendations with covers, blurbs, and purchase links.

✨ Features

Movie → Book: Paste a movie title; get 5–8 thematically aligned books.

Smart re-ranking: Filters by tone, pace, darkness/wholesomeness, etc.

Fresh metadata: Covers, authors, ratings via Hardcover GraphQL API.

Fast cache: Simple cache to keep responses snappy and cheap.

DX first: Next.js frontend + Python backend with CI on GitHub Actions.

🧱 Tech Stack

Frontend: Next.js (App Router), React, TypeScript, Tailwind CSS

Backend: Python 3.11 (FastAPI/Flask style app), requests/HTTPX, caching

AI: OpenAI (GPT-4.1-mini or equivalent)

Books: Hardcover API (GraphQL)

Infra/CI: GitHub Actions; (optional) Vercel for frontend hosting

📦 Project Structure
CineReads/
├─ backend/
│  ├─ main.py                 # Web server entry (API)
│  ├─ recommendations.py      # Movie→Book core flow
│  ├─ gpt_service.py          # LLM prompts & calls
│  ├─ hardcover_service.py    # Hardcover GraphQL client
│  ├─ cache_service.py        # In-memory/disk cache helpers
│  └─ config.py               # Settings & env management
└─ frontend/
   ├─ page.tsx                # Main UI page
   ├─ layout.tsx              # App layout
   ├─ components/
   │  ├─ MovieInput.tsx
   │  ├─ PreferencesPanel.tsx
   │  ├─ RecommendationResult.tsx
   │  ├─ BookCard.tsx
   │  └─ ErrorMessage.tsx
   ├─ lib/
   │  ├─ api.ts               # API calls to backend
   │  └─ utils.ts
   ├─ index.ts
   └─ globals.css
File names may vary slightly in your repo; the above reflects the intended roles.

🔑 Environment Variables

Create .env files for both backend and frontend as needed.

Backend (backend/.env)
OPENAI_API_KEY=your_openai_key
HARDCOVER_API_KEY=your_hardcover_key
# Optional tuning
MODEL_NAME=gpt-4.1-mini
CACHE_TTL_SECONDS=600
PORT=8000
Frontend (frontend/.env.local)
# If the frontend calls a separate backend URL in dev/prod:
NEXT_PUBLIC_API_BASE=http://localhost:8000

▶️ Getting Started (Local Dev)
Prerequisites

Node.js 18+

Python 3.11+

A free OpenAI API key

A Hardcover API key (https://hardcover.app
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # if you have a template; otherwise create .env
# Run the API (pick the one your project uses)
# FastAPI (uvicorn):
uvicorn main:app --reload --port 8000
# or Flask:
# python main.py

Verify: open http://localhost:8000/health
cd frontend
npm install
cp .env.local.example .env.local   # if present; else create .env.local
npm run dev

Open http://localhost:3000
{
  "movie": "Interstellar",
  "year": 2014,
  "preferences": {
    "tone": "hopeful",
    "pace": "medium",
    "darkness": "light",
    "romance": "low"
  }
}
Response:
{
  "items": [
    {
      "title": "Project Hail Mary",
      "author": "Andy Weir",
      "hardcoverId": "...",
      "coverImage": "https://...",
      "summary": "…",
      "reasons": ["found-family vibe", "optimistic science", "…"],
      "links": { "hardcover": "https://...", "buy": "https://..." }
    }
  ]
}

🧪 Testing
# Backend
cd backend
pytest -q

# Frontend (if configured)
cd frontend
npm test

🚀 CI/CD (GitHub Actions)

Minimal CI that runs backend tests and then frontend install/build.
Create .github/workflows/ci.yml:
name: CineReads CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  backend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    env:
      OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
      HARDCOVER_API_KEY: ${{ secrets.HARDCOVER_API_KEY }}
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.11"
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Run tests
        run: pytest -q

  frontend:
    runs-on: ubuntu-latest
    needs: backend
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
      - name: Install
        run: npm ci
      - name: Build
        run: npm run build
Deploy tips

Frontend: Vercel → import repo → set NEXT_PUBLIC_API_BASE

Backend: Render/Fly.io/railway.app → set env vars, expose port 8000

🧠 Prompting Strategy (High Level)

Extract themes from the movie (motifs, tone, character arcs).

Map themes → book tropes/genres.

Query Hardcover for candidate titles.

Re-rank with LLM against user preferences (tone/pace/darkness/romance).

Return curated, diverse picks with short, human-readable reasons.

🧩 Troubleshooting

LLM cost too high → increase cache TTL; reduce list size from 8 → 5.

API 429/limits → backoff + short-term cache keys per movie+prefs.

Mixed CORS → enable CORS on backend; use consistent NEXT_PUBLIC_API_BASE.

Hardcover missing a book → broaden query or relax filters.

📜 License

MIT — feel free to use, fork, and improve.

🙌 Acknowledgments

Hardcover for an excellent books API.

OpenAI for fast reasoning models that keep costs sane.

Next steps (nice-to-have)

User auth + saved lists

“If you liked X & Y together” blending

Non-English titles & regional availability

Rate limiter + analytics dashboard
