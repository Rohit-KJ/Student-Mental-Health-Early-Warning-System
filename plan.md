# Student Mental Health Early Warning System - Project Status & Implementation Plan

## 1. Project Overview & Architecture
The **Student Mental Health Early Warning System** is an end-to-end full-stack platform designed for students at Jaypee University of Engineering and Technology (JUET) to track, assess, and support their mental wellbeing.

- **Frontend**: React 19 + Vite + Tailwind CSS (`/frontend`)
- **Backend**: FastAPI + SQLAlchemy + SQLite / PostgreSQL (`/backend`)
- **ML Assessment Engine**: TabNet regression model (`backend/model_files/tabnet_mental_health.zip`) evaluating 12 key features (sleep, screen time, nervousness, relaxation, interest, mood, concentration, academic control, confidence, attendance, age, year) with Table 3.4 categorization.
- **NLP Motivational Support Companion**: Real-time empathetic peer encouragement feature providing safe, non-diagnostic, respectful, age-appropriate reflections with practical coping ideas (e.g., walking in a park, playing a casual game, spending time in nature, positive creative activities, or connecting with trusted people).

---

## 2. Completed Implementation (Where We Are Now)

### A. Backend NLP Capability (`/backend`)
1. **Pydantic Validation Schema** (`backend/schemas/nlp_schema.py`):
   - `SupportRequest`: Enforces minimum 3 characters, maximum 2,000 characters, whitespace trimming.
   - `SupportResponse`: Structured response with `supportive_message`, `is_crisis`, `crisis_guidance`, `crisis_resources`, `source`, `disclaimer`, and UTC `timestamp`.
   - `CrisisHelplineResource`: Contact entity for official, verified 24/7 helplines.

2. **NLP Core Service** (`backend/core/nlp_service.py`):
   - **Immediate Crisis Marker Detection**: Pre-generation regex matching for self-harm, suicidal ideation, or acute emergencies.
   - **Safety-First Crisis Guidance**: Immediately returns Tele-MANAS (14416 / 1800-891-4416), National Emergency (112), and JUET health resources without attempting clinical assessment or diagnosis.
   - **Empathetic Offline Synthesizer Fallback**: Multi-theme emotional analysis (academic pressure, exhaustion, anxiety, loneliness, self-doubt, general difficulty). Produces 3-paragraph responses:
     - Paragraph 1: Validation and empathy.
     - Paragraph 2: Respectful, non-prescriptive reassurance.
     - Paragraph 3: Safe, practical positive activities (taking a walk in a park, playing a game, doing a positive hobby, or talking with trusted mentors/friends).
   - **Live LLM Integration (Gemini REST API)**: Configurable via `GEMINI_API_KEY` and `GEMINI_MODEL` with strict system prompt boundaries and prompt-injection defenses (untrusted input tagging).
   - **Zero Data Persistence**: Sensitive student mental health descriptions are strictly processed in-memory and are never written to the database or logged.

3. **API Routing & Dependency Integration** (`backend/routers/nlp.py` & `backend/main.py`):
   - Endpoint: `POST /api/nlp/support`.
   - Authentication: Uses optional `get_optional_student` dependency via `bearer_scheme`. Works seamlessly for logged-in students while allowing accessible support even without a token.
   - Registered under FastAPI `app.include_router(nlp_router)`.
   - Safe TabNet import handling to prevent server crashes in environments where PyTorch is not yet installed.

4. **Environment & Dependencies** (`backend/core/config.py`, `backend/.env.example`, `backend/requirements.txt`):
   - Documented `GEMINI_API_KEY` and `GEMINI_MODEL`.
   - Pure Python standard library implementation for NLP (`urllib`, `re`, `json`) requiring zero extra heavy dependencies.

### B. Frontend Integration (`/frontend`)
1. **API Service** (`frontend/src/services/api.js`):
   - Added `generateSupportiveMessage(text)` communicating with `POST /api/nlp/support`.
2. **Dedicated Support Page** (`frontend/src/pages/Support.jsx`):
   - MindCare design system styling (`bg-slate-50`, `rounded-3xl`, `border-slate-200`, `bg-blue-600`).
   - Quick starter prompt chips (Exam Pressure, Exhaustion, Anxiety, Loneliness, Self-Doubt).
   - Live character counter (5 to 2,000 characters).
   - In-flight animation spinner and accessible error display.
   - High-visibility crisis emergency banner with 24/7 helpline cards when crisis markers are detected.
   - Warm reflection card with one-click copy button and quick grounding suggestion.
3. **Portal Navigation & Routing**:
   - `frontend/src/layouts/StudentLayout.jsx`: Added "Support & Motivation" navigation tab.
   - `frontend/src/App.jsx`: Registered route `/support`.
   - `frontend/src/pages/Dashboard.jsx`: Added dedicated encouragement banner card linking to `/support`.

---

## 3. Verification & Quality Assurance Results

| Check / Test Suite | Scope | Result | Details |
|---|---|---|---|
| **Backend Pytest** | Unit & Integration | **PASS (13/13)** | 11 unit tests in `tests/test_nlp.py` + 2 integration tests in `tests/test_nlp_integration.py` passed in 5.00s. |
| **Frontend ESLint** | Code Style & Types | **PASS (0 errors, 0 warnings)** | Clean linting pass across all components. |
| **Frontend Vite Build** | Production Build | **PASS** | Bundle compiled cleanly in 3.62s (`dist/` generated). |
| **Crisis Intervention** | Safety Protocol | **PASS** | Suicidal / self-harm markers trigger 24/7 helplines & empathetic guidance; non-crisis stress is not falsely blocked. |
| **Prompt Injection Safety** | Adversarial Tests | **PASS** | System ignores attempts to alter clinical role or prescribe medications. |
| **Data Privacy** | Sensitive Text | **PASS** | Zero database persistence; 0 records in `assessment_results` for NLP requests. |

---

## 4. Future Implementation Roadmap (Pick Up Where We Left Off)

When resuming development, the following enhancements are planned in priority order:

### Phase 1: Local Deployment & Environment Setup
- [ ] Create a local virtual environment for the updated repository:
  ```powershell
  cd backend
  python -m venv venv
  .\venv\Scripts\activate
  pip install -r requirements.txt
  ```
- [ ] Optional: If testing TabNet ML predictions locally, install `pytorch-tabnet` and `torch`:
  ```powershell
  pip install pytorch-tabnet torch
  ```
- [ ] Copy `.env.example` to `.env` and configure keys:
  ```powershell
  copy .env.example .env
  ```
  *(Set `GEMINI_API_KEY` if live Gemini responses are desired; otherwise the built-in offline synthesizer is active automatically).*

### Phase 2: Campus Counselor Bridge & Appointment Scheduler
- [ ] Implement `GET /api/counseling/resources` providing active JUET medical centre and campus mentor contact hours.
- [ ] Add an optional "Request Counselor Callback" button on the crisis and assessment result screens (opt-in only, strictly consent-based).
- [ ] Create an administrative dashboard for authorized campus counselors to view aggregated, anonymized student mental health trends (e.g. peak stress periods during midterms).

### Phase 3: Enhanced Multi-Turn Interactive Coping Exercises
- [ ] Add interactive guided grounding tools on `/support`:
  - Visual 4-7-8 breathing circle animation.
  - Interactive progressive muscle relaxation walkthrough.
  - Gratitude / positive journaling prompt tool with local export (download as PDF/text, never uploaded).
- [ ] Add session-based conversational context (using in-memory, transient conversation IDs without logging student text).

### Phase 4: Voice & Accessibility Features
- [ ] Add Web Speech API speech-to-text option for the description textarea so students can speak their thoughts.
- [ ] Add optional calming text-to-speech readout of the supportive message.
- [ ] Ensure full WCAG 2.1 AA accessibility compliance across all color contrast ratios and screen readers.

### Phase 5: Containerization & CI/CD Pipeline
- [ ] Create a multi-stage `Dockerfile` and `docker-compose.yml` for unified backend (FastAPI) and frontend (Nginx) deployment.
- [ ] Add GitHub Actions workflow (`.github/workflows/ci.yml`) to automatically run:
  1. `npm run lint` and `npm run build`
  2. `pytest backend/tests`
- [ ] Setup production PostgreSQL migration scripts using Alembic.
