# FOUNDryAI — API Reference

Base URL: `http://localhost:8000/api/v1`

---

## POST /generate

Generate a startup blueprint through the 9-engine pipeline.

**Request Body**

```json
{
  "query": "AI-driven logistics for Tier 2 cities in India",
  "provider": "gemini",
  "stream": true,
  "budget": "₹15K/month",
  "market": "India Tier 2"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `query` | string | ✓ | Startup idea (10-1000 chars) |
| `provider` | string | | `gemini` \| `groq` \| `openrouter` \| `cohere` |
| `stream` | boolean | | Default: `true` |
| `budget` | string | | Budget constraint |
| `market` | string | | Market context |

**Streaming Response (SSE)**

Each event is a JSON object on a `data:` line:

```
data: {"type": "engine_update", "engine_idx": 0, "status": "active", "name": "Research Intake"}
data: {"type": "text", "chunk": "# 💡 01. THE OPPORTUNITY\n"}
data: {"type": "engine_update", "engine_idx": 0, "status": "done", "name": "Research Intake"}
data: {"type": "done", "total_chars": 8432, "engines_completed": 9}
```

Event types:
- `text` — markdown chunk (`chunk` field)
- `engine_update` — engine status change
- `done` — pipeline complete
- `error` — something went wrong (`message` field)

**Non-streaming Response**

```json
{
  "query": "...",
  "blueprint_markdown": "# 💡 01. THE OPPORTUNITY\n...",
  "engines_run": 9,
  "provider_used": "gemini"
}
```

---

## GET /health

```json
{
  "status": "healthy",
  "providers_configured": ["gemini", "groq"],
  "providers_available": 2,
  "pipeline_engines": 9
}
```

---

## GET /providers

Returns all supported providers and configuration status.

---

## GET /engines

Returns the list of all 9 pipeline engines.

---

## cURL Examples

```bash
# Non-streaming
curl -X POST http://localhost:8000/api/v1/generate \
  -H "Content-Type: application/json" \
  -d '{"query": "AI logistics India", "stream": false}'

# Streaming
curl -N -X POST http://localhost:8000/api/v1/generate \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{"query": "AI logistics India", "stream": true}'

# Health check
curl http://localhost:8000/api/v1/health
```
