"""
FOUNDryAI — The 9-Engine Pipeline
===================================
This is the BRAIN of the application.
Each engine stage is defined here, and they execute sequentially
to produce a complete, validated startup blueprint.
"""

import re
import json
from typing import AsyncGenerator, Optional
from dataclasses import dataclass, field

from src.utils.llm_client import LLMClient
from src.core.prompt_builder import build_system_prompt, build_user_prompt


# ── Engine Definitions ────────────────────────────────────────────────────────

ENGINES = [
    {"id": "01", "name": "Research Intake",         "emoji": "🔬"},
    {"id": "02", "name": "Understanding",            "emoji": "🧩"},
    {"id": "03", "name": "Reasoning (Multi-Agent)", "emoji": "🤖"},
    {"id": "04", "name": "Business Mapping",         "emoji": "💼"},
    {"id": "05", "name": "Execution",                "emoji": "⚙️"},
    {"id": "06", "name": "Code Base",                "emoji": "💻"},
    {"id": "07", "name": "Opportunity Scoring",      "emoji": "📊"},
    {"id": "08", "name": "Trend Radar",              "emoji": "📡"},
    {"id": "09", "name": "Pitch Deck",               "emoji": "🎯"},
]

# Keywords that signal we've entered each engine's output section
ENGINE_SIGNALS = [
    "THE OPPORTUNITY",
    "TECHNICAL ARCHITECTURE",
    "FOUNDATIONAL REPOSITORY",
    "BUSINESS",
    "MULTI-AGENT REASONING",
    "TREND RADAR",
    "PITCH DECK",
    "FOUNDER",
]


# ── Data Models ───────────────────────────────────────────────────────────────

@dataclass
class BlueprintRequest:
    query: str
    provider: Optional[str] = None
    stream: bool = True
    budget: Optional[str] = None
    market: Optional[str] = None


@dataclass
class EngineStatus:
    engine_id: str
    name: str
    status: str = "pending"   # pending | active | done | error
    output_preview: str = ""


@dataclass
class PipelineEvent:
    """Emitted during streaming — tells the frontend what's happening."""
    type: str           # "text" | "engine_update" | "done" | "error"
    data: dict = field(default_factory=dict)

    def to_sse(self) -> str:
        return f"data: {json.dumps({'type': self.type, **self.data})}\n\n"


# ── The Pipeline ─────────────────────────────────────────────────────────────

class FOUNDryPipeline:
    """
    Runs the full 9-engine pipeline for a given startup query.
    Supports both streaming (SSE) and batch modes.
    """

    def __init__(self, provider: Optional[str] = None):
        self.llm = LLMClient(preferred_provider=provider)
        self.engines = [EngineStatus(e["id"], e["name"]) for e in ENGINES]

    def _detect_engine_progress(self, text: str) -> int:
        """Return the index of the last engine whose signal appears in text."""
        progress = 0
        for i, signal in enumerate(ENGINE_SIGNALS):
            if signal.upper() in text.upper():
                progress = i + 1
        return min(progress, len(ENGINES) - 1)

    async def run_stream(self, request: BlueprintRequest) -> AsyncGenerator[str, None]:
        """
        Stream the pipeline output as Server-Sent Events.
        Each chunk is a JSON-encoded PipelineEvent.
        """
        system = build_system_prompt()
        user = build_user_prompt(
            query=request.query,
            budget=request.budget,
            market=request.market,
        )

        full_text = ""
        current_engine_idx = 0

        # Signal pipeline start
        yield PipelineEvent(
            type="engine_update",
            data={"engine_idx": 0, "status": "active", "name": ENGINES[0]["name"]}
        ).to_sse()

        try:
            async for chunk in self.llm.generate(
                system=system,
                user=user,
                stream=True,
                provider=request.provider,
            ):
                full_text += chunk

                # Check if we've advanced to a new engine
                new_idx = self._detect_engine_progress(full_text)
                if new_idx > current_engine_idx:
                    # Mark previous engines as done
                    for i in range(current_engine_idx, new_idx):
                        yield PipelineEvent(
                            type="engine_update",
                            data={"engine_idx": i, "status": "done", "name": ENGINES[i]["name"]}
                        ).to_sse()
                    # Activate new engine
                    if new_idx < len(ENGINES):
                        yield PipelineEvent(
                            type="engine_update",
                            data={"engine_idx": new_idx, "status": "active", "name": ENGINES[new_idx]["name"]}
                        ).to_sse()
                    current_engine_idx = new_idx

                # Emit text chunk
                yield PipelineEvent(
                    type="text",
                    data={"chunk": chunk}
                ).to_sse()

            # Mark all remaining engines as done
            for i in range(current_engine_idx, len(ENGINES)):
                yield PipelineEvent(
                    type="engine_update",
                    data={"engine_idx": i, "status": "done", "name": ENGINES[i]["name"]}
                ).to_sse()

            # Emit done event
            yield PipelineEvent(
                type="done",
                data={
                    "total_chars": len(full_text),
                    "engines_completed": len(ENGINES),
                }
            ).to_sse()

        except Exception as e:
            yield PipelineEvent(
                type="error",
                data={"message": str(e)}
            ).to_sse()

    async def run_batch(self, request: BlueprintRequest) -> dict:
        """
        Run the full pipeline and return the complete blueprint as a dict.
        Used for API calls that don't need streaming.
        """
        system = build_system_prompt()
        user = build_user_prompt(
            query=request.query,
            budget=request.budget,
            market=request.market,
        )

        full_text = ""
        async for chunk in self.llm.generate(
            system=system,
            user=user,
            stream=False,
            provider=request.provider,
        ):
            full_text += chunk

        return {
            "query": request.query,
            "blueprint_markdown": full_text,
            "engines_run": len(ENGINES),
            "provider_used": request.provider or "auto",
        }
