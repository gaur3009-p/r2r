"""
FOUNDryAI — API Routes
"""

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Optional

from src.core.engine import FOUNDryPipeline, BlueprintRequest, ENGINES
from src.utils.llm_client import LLMClient

router = APIRouter()


# ── Request / Response Models ─────────────────────────────────────────────────

class GenerateRequest(BaseModel):
    query: str = Field(..., min_length=10, max_length=1000, description="Your startup idea or market niche")
    provider: Optional[str] = Field(None, description="LLM provider: gemini | groq | openrouter | cohere")
    stream: bool = Field(True, description="Stream response as SSE")
    budget: Optional[str] = Field(None, description="Budget constraint e.g. '₹15K/month'")
    market: Optional[str] = Field(None, description="Target market context e.g. 'India Tier 2 cities'")

    model_config = {
        "json_schema_extra": {
            "example": {
                "query": "AI-driven logistics for Tier 2 cities in India",
                "provider": "gemini",
                "stream": True,
                "budget": "₹15K/month",
                "market": "India",
            }
        }
    }


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/generate")
async def generate_blueprint(req: GenerateRequest):
    """
    Generate a complete startup blueprint through the 9-engine pipeline.

    - **stream=true**: Returns Server-Sent Events (SSE) — best for web UI
    - **stream=false**: Returns complete JSON response — best for integrations
    """
    pipeline = FOUNDryPipeline(provider=req.provider)
    blueprint_req = BlueprintRequest(
        query=req.query,
        provider=req.provider,
        stream=req.stream,
        budget=req.budget,
        market=req.market,
    )

    if req.stream:
        return StreamingResponse(
            pipeline.run_stream(blueprint_req),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
            },
        )
    else:
        result = await pipeline.run_batch(blueprint_req)
        return result


@router.get("/health")
async def health_check():
    """API health check."""
    client = LLMClient()
    status = client.get_provider_status()
    configured = [k for k, v in status.items() if v["configured"]]

    return {
        "status": "healthy" if configured else "degraded",
        "providers_configured": configured,
        "providers_available": len(configured),
        "pipeline_engines": len(ENGINES),
    }


@router.get("/providers")
async def list_providers():
    """List all supported LLM providers and their status."""
    client = LLMClient()
    return {
        "providers": client.get_provider_status(),
        "instructions": {
            "gemini": "Get free key at https://aistudio.google.com/app/apikey",
            "groq": "Get free key at https://console.groq.com",
            "openrouter": "Get free key at https://openrouter.ai/keys",
            "cohere": "Get free key at https://dashboard.cohere.com/api-keys",
        }
    }


@router.get("/engines")
async def list_engines():
    """List all 9 pipeline engines."""
    return {"engines": ENGINES, "total": len(ENGINES)}
