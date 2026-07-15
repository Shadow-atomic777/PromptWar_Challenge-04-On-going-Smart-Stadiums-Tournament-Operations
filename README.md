# 🏟️ OmniStadium — Multi-Agent AI Stadium Operations Center

> **PromptWar: Vibe Coding Hackathon — Smart Stadiums & Tournament Operations**
> Organized by **Hack2Skill** and **Google for Developers**
> Built entirely using **Google Anti-Gravity** (Agentic AI)

![Status](https://img.shields.io/badge/Status-In%20Development-yellow)
![Google AI](https://img.shields.io/badge/Powered%20By-Google%20Gemini-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🌐 Live Demo
**Try the live app here:** [https://on-going-smart-stadiums-tournament-operations.ai.studio](https://on-going-smart-stadiums-tournament-operations.ai.studio)

---

## 🎯 What is OmniStadium?

OmniStadium is **NOT a chatbot**. It is a production-inspired, AI-powered **Stadium Operations Center** that uses a team of specialized AI agents to manage the FIFA World Cup 2026 experience for 80,000+ fans in real-time.

A **Supervisor Agent** powered by Google Gemini orchestrates specialized sub-agents — Crowd, Queue, Route, Safety, Weather, and Communication — to reason about live stadium conditions and produce actionable intelligence for both fans and operations staff.

---

## 🧠 Multi-Agent Architecture

```
User / Sensor Event
       │
  Supervisor Agent (Gemini Pro)
       │
       ├── 👥 Crowd Monitoring Agent
       ├── 🍔 Queue Optimization Agent
       ├── 🗺️ Route Planning Agent
       ├── 🚨 Safety & Emergency Agent
       ├── 🌦️ Weather Agent
       └── 📅 Event Scheduler Agent
       │
  Decision Engine (Conflict Resolution)
       │
  📢 Communication Agent
       │
  Dashboard + Fan App
```

---

## ✨ Key Features

### For Fans 📱
- **Smart Q&A:** "I have 15 minutes. Where should I eat?" → AI cross-references queue wait times, walking distances, and crowd density.
- **Live Navigation:** Congestion-aware routing to seats, food, and restrooms.
- **Proactive Alerts:** Push notifications for gate changes, weather warnings, and delays.

### For Operations Staff 🖥️
- **Live Heatmap:** Real-time crowd density visualization across all stadium sectors.
- **AI Alert Feed:** Automated incident detection and response recommendations.
- **Agent Timeline:** Watch the AI "think" — see which agents are invoked and why.
- **Emergency Management:** One-click emergency simulation with full AI response chain.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React, Vite, Tailwind CSS, Shadcn/UI |
| **Backend** | Python, FastAPI, WebSockets |
| **AI/LLM** | Google Gemini API (via `google-genai`) |
| **Database** | SQLite (MVP) → Firestore (Production) |
| **Deployment** | Vercel (Frontend), Cloud Run (Backend) |

---

## 📁 Project Structure

```
omnistadium/
├── backend/                  # FastAPI server
│   ├── app/
│   │   ├── agents/           # AI agent logic & Gemini prompts
│   │   ├── api/              # REST & WebSocket endpoints
│   │   ├── core/             # Config, database setup
│   │   ├── models/           # Pydantic request/response models
│   │   ├── services/         # Simulation engine, WS manager
│   │   └── main.py           # FastAPI application entry
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── pages/            # Dashboard, Fan App, Landing
│   │   ├── hooks/            # Custom React hooks (WebSocket, etc.)
│   │   ├── lib/              # API client, utilities
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── plan.md                   # Execution plan
└── README.md                 # This file
```

---

## 🚀 Quick Start

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Environment Variables

Create `backend/.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 📊 API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/sim/crowd` | GET | Live crowd density per sector |
| `/api/sim/queues` | GET | Wait times at food/restroom/gates |
| `/api/sim/parking` | GET | Parking lot occupancy |
| `/api/sim/medical` | GET | Active medical incidents |
| `/api/sim/weather` | GET | Temperature, humidity, alerts |
| `/api/sim/stadium` | GET | Gate status, match timeline |
| `/api/chat/fan` | POST | Fan query → Multi-agent AI response |
| `/api/ops/incident` | POST | Manual incident creation |
| `/ws/ops` | WS | Real-time ops dashboard feed |
| `/ws/fan/{fan_id}` | WS | Personalized fan notifications |

---

## 🏆 Why OmniStadium?

1. **Not a chatbot** — It's an active operations center with autonomous AI agents.
2. **Multi-Agent Reasoning** — Agents collaborate, not just respond.
3. **Visually Stunning** — Live heatmaps, real-time agent timelines, glassmorphic UI.
4. **Production Architecture** — Microservices, WebSockets, async orchestration.
5. **Google Cloud Native** — Gemini, Cloud Run, Firestore.

---

## 👥 Team

Built with ❤️ for PromptWar: Vibe Coding Hackathon by Hack2Skill and Google for Developers, using Google Anti-Gravity.

---

## 📄 License

MIT License — See [LICENSE](LICENSE) for details.
