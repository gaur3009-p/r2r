# 🚀 FOUNDryAI — Startup Blueprint Generator

> **100% Free · No Paid API Required · Enterprise-Grade · Open Source**

FOUNDryAI is a full-stack AI-powered startup architect that processes any idea through a **9-Engine Pipeline** to output a validated, build-ready startup blueprint — using only **free-tier APIs**.

![FOUNDryAI Banner](docs/banner.png)

---

## ✨ Features

- 🆓 **Completely Free** — Uses Google Gemini 1.5 Flash (free tier) + Groq (free tier) as fallback
- ⚡ **9-Engine Pipeline** — Research → Understanding → Reasoning → Business → Execution → Code → Scoring → Trends → Pitch
- 💻 **Full Code Generation** — Produces real boilerplate code, repo structure, and architecture
- 📊 **Investor Pitch Deck** — 7-slide outline ready for Gamma/SlidesAI
- 🎯 **Viability Scoring** — Market Size, Urgency, Build Difficulty, Technical Moat
- 🌐 **Web UI + REST API** — Use via browser or integrate via API
- 🐳 **Docker Ready** — One command to run locally

---

## 🏗️ Architecture

```
User Query
    │
    ▼
┌─────────────────────────────────────────┐
│           FOUNDryAI Pipeline            │
│                                         │
│  01 Research Intake (Simulated Crawl)   │
│  02 Understanding Engine                │
│  03 Reasoning Engine (Multi-Agent)      │
│  04 Business Mapping Engine             │
│  05 Execution Engine                    │
│  06 Code Base Engine                    │
│  07 Opportunity Scoring Engine          │
│  08 Trend Radar                         │
│  09 Pitch Deck Engine                   │
└─────────────────────────────────────────┘
    │
    ▼
Blueprint (Markdown + JSON)
```

---

## 🆓 Free API Options

| Provider | Model | Free Tier | Speed |
|----------|-------|-----------|-------|
| **Google Gemini** | gemini-1.5-flash | 15 RPM, 1M TPM | Fast |
| **Groq** | llama-3.3-70b | 30 RPM, 14400 RPD | Very Fast |
| **OpenRouter** | mistral-7b-free | Limited free | Medium |
| **Cohere** | command-r | 20 RPM | Fast |

> **Default**: Google Gemini 1.5 Flash → Fallback: Groq Llama 3.3

---

## 📁 Repository Structure

```
foundry-ai/
├── src/
│   ├── api/
│   │   ├── __init__.py
│   │   ├── main.py           # FastAPI app entry point
│   │   ├── routes.py         # API endpoints
│   │   └── models.py         # Pydantic models
│   ├── core/
│   │   ├── __init__.py
│   │   ├── engine.py         # 🧠 The 9-Engine Pipeline (MAIN BRAIN)
│   │   ├── prompt_builder.py # System & user prompt construction
│   │   └── parser.py         # Output parsing & validation
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── analyst.py        # Market analyst agent
│   │   ├── contrarian.py     # Devil's advocate agent
│   │   └── trend.py          # Trend forecasting agent
│   └── utils/
│       ├── __init__.py
│       ├── llm_client.py     # Multi-provider LLM client (FREE APIs)
│       └── helpers.py
├── web/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx          # Main UI
│   │   └── globals.css
│   ├── components/
│   │   ├── QueryInput.tsx
│   │   ├── PipelineStatus.tsx
│   │   ├── BlueprintOutput.tsx
│   │   └── ApiKeySetup.tsx
│   └── styles/
│       └── theme.ts
├── data/
│   ├── schema.sql
│   └── prompts/
│       └── system_prompt.md
├── docs/
│   └── API.md
├── .github/
│   └── workflows/
│       └── deploy.yml
├── .env.example
├── docker-compose.yml
├── Dockerfile.api
├── Dockerfile.web
├── requirements.txt
├── package.json
└── README.md
```

---

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
git clone https://github.com/yourusername/foundry-ai.git
cd foundry-ai
cp .env.example .env
# Add your FREE API key (Gemini or Groq) in .env
docker-compose up --build
```

Open http://localhost:3000

### Option 2: Manual Setup

**Backend (Python 3.11+)**
```bash
cd foundry-ai
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your free API key
uvicorn src.api.main:app --reload --port 8000
```

**Frontend (Node 18+)**
```bash
cd web
npm install
npm run dev
```

Open http://localhost:3000

---

## 🔑 Getting Free API Keys

### Google Gemini (Recommended — Best Quality)
1. Go to https://aistudio.google.com/app/apikey
2. Click **"Create API Key"** — completely free
3. Add to `.env`: `GEMINI_API_KEY=your_key_here`

### Groq (Fastest — Great Fallback)
1. Go to https://console.groq.com
2. Sign up → API Keys → Create
3. Add to `.env`: `GROQ_API_KEY=your_key_here`

---

## 📡 API Reference

```bash
# Generate a blueprint
POST /api/v1/generate
Content-Type: application/json

{
  "query": "AI-driven logistics for Tier 2 cities in India",
  "provider": "gemini",  # or "groq"
  "stream": true
}

# Health check
GET /api/v1/health

# Supported providers
GET /api/v1/providers
```

See [docs/API.md](docs/API.md) for full reference.

---

## 🌐 Deploy Free

### Vercel (Frontend)
```bash
cd web && npx vercel --prod
```

### Railway / Render (Backend — Free tier)
```bash
# railway.app or render.com — connect GitHub repo
# Set env vars in dashboard
```

---

## 📄 License

MIT License — Use freely, commercially, and modify as needed.

---

## 🤝 Contributing

PRs welcome! See [CONTRIBUTING.md](docs/CONTRIBUTING.md).

---

*Built with ❤️ · FOUNDryAI · 9-Engine Pipeline*
