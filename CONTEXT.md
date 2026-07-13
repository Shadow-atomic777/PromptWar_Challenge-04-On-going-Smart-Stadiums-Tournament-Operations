# Project Context & Status

**Project:** OmniStadium — Multi-Agent AI Stadium Operations Center
**Hackathon:** Google Developers Hackathon 2026 — Smart Stadiums & Tournament Operations

## Current State
- **Backend**: Scaffolding is complete. The simulation engine works perfectly (ticks every 5s, updates crowd, queues, parking, weather, medical, and match phase). REST APIs and WebSockets are implemented.
- **Bugs Fixed**:
  1. `backend/app/core/config.py`: Migrated from deprecated `class Config` to `model_config = SettingsConfigDict` for Pydantic v2 compatibility. Set absolute path for `.env`.
  2. `backend/app/services/ws_manager.py`: Fixed race conditions in `broadcast_ops` and `broadcast_fans` where disconnecting a websocket during iteration would cause a crash.
- **Frontend**: Entirely missing. No `frontend/` directory exists.
- **AI Agents**: Currently stubbed out. The `/api/chat/fan` endpoint uses hardcoded keyword matching rather than real Gemini calls.
- **Database**: SQLite database schema is defined but nothing writes to it.

## Can the Backend Run?
**Yes.** The backend will run perfectly fine as it stands. It has a fully functional in-memory simulation engine and hardcoded AI responses.
To run it:
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate      # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Next Steps for Development
1. **Frontend**: Build the React + Vite frontend for the Operations Dashboard and the Fan App.
2. **AI Integration**: Replace the hardcoded intents in `chat_routes.py` with actual Gemini API calls using the `google-genai` package.
3. **Database Integration**: Actually save incidents and logs to the SQLite database.

## Notes for Next Assistant
The previous assistant analyzed the full codebase, fixed the critical crash bugs in config and websocket management, and verified the backend logic. Please proceed directly to the Next Steps (Frontend or AI Integration) based on the user's priority.
