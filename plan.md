# OmniStadium — Execution Plan

> **Project:** Multi-Agent AI Stadium Operations Center
> **Hackathon:** Google Developers Hackathon — Smart Stadiums & Tournament Operations
> **Timeline:** 5–7 day MVP

---

## Phase 0: Scaffolding ✅ IN PROGRESS
| Task | Owner | Status |
|---|---|---|
| Create project folder structure | Agent | ✅ Done |
| Initialize FastAPI backend | Backend Agent | 🔄 In Progress |
| Initialize React + Vite frontend | Frontend Agent | 🔄 In Progress |
| Create plan.md | Agent | ✅ Done |
| Create README.md | Agent | ✅ Done |

---

## Phase 1: Simulation Engine & Data APIs (Day 1–2)
| Task | Owner | Status |
|---|---|---|
| Build `/api/sim/crowd` — Crowd density by sector | Backend | ⬜ |
| Build `/api/sim/queues` — Wait times for food/restrooms | Backend | ⬜ |
| Build `/api/sim/parking` — Lot occupancy | Backend | ⬜ |
| Build `/api/sim/medical` — Active incidents | Backend | ⬜ |
| Build `/api/sim/weather` — Temperature, humidity, alerts | Backend | ⬜ |
| Build `/api/sim/stadium` — Gate status, match time | Backend | ⬜ |
| WebSocket manager for real-time broadcast | Backend | ⬜ |
| Simulation engine (auto-tick every 5s) | Backend | ⬜ |

---

## Phase 2: AI Agent Layer (Day 2–4)
| Task | Owner | Status |
|---|---|---|
| Supervisor Agent — Intent classification & delegation | AI | ⬜ |
| Crowd Monitoring Agent — Density analysis, rerouting | AI | ⬜ |
| Queue Optimization Agent — Shortest wait recommendation | AI | ⬜ |
| Route Planning Agent — Pathfinding w/ congestion avoidance | AI | ⬜ |
| Safety & Emergency Agent — Medic dispatch, evacuation | AI | ⬜ |
| Communication Agent — NL announcements & notifications | AI | ⬜ |
| Agent orchestration (parallel async calls) | AI | ⬜ |
| Decision Engine — Conflict resolution logic | AI | ⬜ |
| Fan chat endpoint (`POST /api/chat/fan`) | Backend | ⬜ |
| Ops incident endpoint (`POST /api/ops/incident`) | Backend | ⬜ |

---

## Phase 3: Operations Dashboard (Day 3–5)
| Task | Owner | Status |
|---|---|---|
| Dashboard layout (3-panel: map, metrics, alerts) | Frontend | ⬜ |
| Live Crowd Heatmap (SVG stadium map) | Frontend | ⬜ |
| Queue Status Cards | Frontend | ⬜ |
| Parking Occupancy Widget | Frontend | ⬜ |
| Gate Status Indicators | Frontend | ⬜ |
| Weather Widget | Frontend | ⬜ |
| Medical / Emergency Alert Feed | Frontend | ⬜ |
| AI Insights Panel | Frontend | ⬜ |
| Agent Activity Timeline (real-time WS feed) | Frontend | ⬜ |
| WebSocket integration for live updates | Frontend | ⬜ |

---

## Phase 4: Fan Experience (Day 4–6)
| Task | Owner | Status |
|---|---|---|
| Fan mobile-first UI layout | Frontend | ⬜ |
| Interactive stadium map | Frontend | ⬜ |
| AI Chat interface (floating FAB) | Frontend | ⬜ |
| Push notification display | Frontend | ⬜ |
| Role selection landing page | Frontend | ⬜ |

---

## Phase 5: Integration & Polish (Day 6–7)
| Task | Owner | Status |
|---|---|---|
| End-to-end fan query flow test | All | ⬜ |
| End-to-end emergency scenario test | All | ⬜ |
| Error handling & loading states | All | ⬜ |
| Demo "Simulate Emergency" button | Frontend | ⬜ |
| Responsive design pass | Frontend | ⬜ |
| README final update | All | ⬜ |
| Demo rehearsal | All | ⬜ |

---

## Architecture Decisions
- **SQLite over Firestore for MVP:** Reduces complexity; swap to Firestore later.
- **In-process simulation:** No external dependencies for demo reliability.
- **Gemini Flash for speed:** Sub-agents use Flash; Supervisor uses Pro for reasoning.
- **WebSocket for liveness:** Judges see the AI "thinking" in real-time.
