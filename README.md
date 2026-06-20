# FarmCare AI — Multi-Agent Agricultural Intelligence System

FarmCare AI is a production-grade multi-agent agricultural system built for the Kaggle Capstone project. It integrates Google Gemini, the Google Agent Development Kit (ADK), Model Context Protocol (MCP), and Firebase to deliver context-aware, intersectional advice for smallholder farmers.

---

## 🏗️ System Architecture

The following diagram illustrates the data flow and agent cooperation structure:

```
        +-------------------------------------------------------+
        |                 Vercel React App                      |
        |  - Landing Page | Dashboard | AI Diagnosis | Chat     |
        +---------------------------+---------------------------+
                                    |
                                    | HTTP Post (Multipart Form)
                                    v
        +-------------------------------------------------------+
        |                FastAPI Cloud Run API                  |
        |             (Host: backend/main.py)                    |
        +---------------------------+---------------------------+
                                    |
                                    | Session runner
                                    v
        +-------------------------------------------------------+
        |             Google ADK Root Agent                     |
        |        (backend/agents/root_agent.py)                 |
        +---+-------------------+-------------------+-------+---+
            |                   |                   |       |
            | Trans.            | Trans.            | Trans.|
            v                   v                   v       v
      +-----------+       +-----------+       +-----------+ +-----------+
      | Crop      |       | Weather   |       | Market    | | Scheme    |
      | Agent     |       | Agent     |       | Agent     | | Agent     |
      +-----+-----+       +-----+-----+       +-----+-----+ +-----+-----+
            |                   |                   |             |
            +-------------------+---------+---------+-------------+
                                          |
                                          | Stdio Toolset calls
                                          v
        +-------------------------------------------------------+
        |              Model Context Protocol Server            |
        |       (backend/mcp_server/farmcare_mcp.py)            |
        +---------------------------+---------------------------+
                                    |
                                    | Synthesize
                                    v
        +-------------------------------------------------------+
        |             Recommendation Specialist Agent           |
        |      (backend/agents/recommendation_agent.py)         |
        +---------------------------+---------------------------+
                                    | Output JSON Schema
                                    v
        +-------------------------------------------------------+
        |             Firebase / Local Fallback Store           |
        |          (backend/firebase/firestore.py)              |
        +-------------------------------------------------------+
```

---

## 🛠️ Codebase Structure

The system is organized into modular packages:

- **[`backend/main.py`](file:///Users/mac/Comapny_Logo/Google-Antigravity/enterprise-workspace-agent/backend/main.py)**: The FastAPI server hosting public endpoints (`GET /`, `POST /analyze-crop`, `POST /chat`).
- **[`backend/agents/`](file:///Users/mac/Comapny_Logo/Google-Antigravity/enterprise-workspace-agent/backend/agents)**:
  - **[`root_agent.py`](file:///Users/mac/Comapny_Logo/Google-Antigravity/enterprise-workspace-agent/backend/agents/root_agent.py)**: Coordinator agent handling delegation.
  - **[`crop_agent.py`](file:///Users/mac/Comapny_Logo/Google-Antigravity/enterprise-workspace-agent/backend/agents/crop_agent.py)**: Visual foliage and disease specialist.
  - **[`weather_agent.py`](file:///Users/mac/Comapny_Logo/Google-Antigravity/enterprise-workspace-agent/backend/agents/weather_agent.py)**: Localized humidity and forecast analyzer.
  - **[`market_agent.py`](file:///Users/mac/Comapny_Logo/Google-Antigravity/enterprise-workspace-agent/backend/agents/market_agent.py)**: Financial yield advisor.
  - **[`scheme_agent.py`](file:///Users/mac/Comapny_Logo/Google-Antigravity/enterprise-workspace-agent/backend/agents/scheme_agent.py)**: Government subsidies and insurance finder.
  - **[`recommendation_agent.py`](file:///Users/mac/Comapny_Logo/Google-Antigravity/enterprise-workspace-agent/backend/agents/recommendation_agent.py)**: Structured output synthesis compiler (Pydantic model: [`FarmCareAnalysis`](file:///Users/mac/Comapny_Logo/Google-Antigravity/enterprise-workspace-agent/backend/agents/recommendation_agent.py#L4)).
- **[`backend/mcp_server/farmcare_mcp.py`](file:///Users/mac/Comapny_Logo/Google-Antigravity/enterprise-workspace-agent/backend/mcp_server/farmcare_mcp.py)**: Exposes `crop_knowledge`, `market_lookup`, `weather_lookup`, and `scheme_lookup` tools.
- **[`backend/firebase/firestore.py`](file:///Users/mac/Comapny_Logo/Google-Antigravity/enterprise-workspace-agent/backend/firebase/firestore.py)**: Integration script supporting seamless local mock database fallback.
- **[`frontend/src/App.jsx`](file:///Users/mac/Comapny_Logo/Google-Antigravity/enterprise-workspace-agent/frontend/src/App.jsx)**: React SPA containing Landing, Dashboard, AI Diagnosis (with real-time agent tracking logs), and chat modules.

---

## ⚡ Quick Start (Local Run)

To run the application locally on your machine:

### 1. Backend Setup
1. Clone the repository and navigate to the directory:
   ```bash
   cd enterprise-workspace-agent
   ```
2. Setup environment keys:
   ```bash
   cp .env.example .env
   # Add your GOOGLE_API_KEY inside the .env file
   ```
3. Install dependencies and start the backend:
   ```bash
   uv sync
   uv run uvicorn backend.main:fastapi_app --host 127.0.0.1 --port 8000
   ```

### 2. Frontend Setup
1. Open a new terminal tab and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install npm modules and launch the Vite dev server:
   ```bash
   npm install --cache ./npm_cache
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.

---

## 🌐 Production Deployment

### Frontend (Vercel)
The React + Vite frontend is pre-configured with **[`vercel.json`](file:///Users/mac/Comapny_Logo/Google-Antigravity/enterprise-workspace-agent/frontend/vercel.json)**.
1. Install Vercel CLI: `npm install -g vercel`
2. Run `vercel` from the `frontend/` directory.
3. Configure `VITE_API_URL` environment variable pointing to your Cloud Run endpoint.

### Backend (Google Cloud Run)
The backend is dockerized and ready to build with **[`Dockerfile`](file:///Users/mac/Comapny_Logo/Google-Antigravity/enterprise-workspace-agent/Dockerfile)**.
1. Authenticate with Google Cloud: `gcloud auth login`
2. Set active GCP project: `gcloud config set project <PROJECT_ID>`
3. Build and deploy container using Cloud Build:
   ```bash
   gcloud builds submit --config cloudbuild.yaml .
   ```

---

## 🏆 Kaggle Submission & Testing

To facilitate instant testing for Kaggle judges without manual database or API configuration:
1. **No Credentials Fallback**: If `.env` keys or Firestore credential pathways are missing, the server will switch automatically to **Offline Demo Mode**, utilizing an extensive in-memory dictionary database containing tomato late/early blight diseases, California crop pricing index, and active agricultural schemes.
2. **Tomato Checkup Flow**:
   - Go to the **AI Crop Diagnosis** page.
   - Click the **⚡ Load Tomato Demo** button.
   - Click **Submit for Diagnosis**.
   - Watch the multi-agent timeline capture logs as the agents negotiate and compile your final structured farming recommendation plan.
# FarmCare-AI
