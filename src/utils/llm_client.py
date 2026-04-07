"""
FOUNDryAI — Multi-Provider Free LLM Client
Supports: Google Gemini, Groq, OpenRouter, Cohere
All providers have free tiers — no credit card required for basic use.
"""

import os
import json
import httpx
from typing import AsyncGenerator, Optional
from tenacity import retry, stop_after_attempt, wait_exponential


PROVIDERS = {
    "gemini": {
        "base_url": "https://generativelanguage.googleapis.com/v1beta",
        "model": "gemini-1.5-flash",
        "env_key": "GEMINI_API_KEY",
        "free": True,
        "rpm": 15,
    },
    "groq": {
        "base_url": "https://api.groq.com/openai/v1",
        "model": "llama-3.3-70b-versatile",
        "env_key": "GROQ_API_KEY",
        "free": True,
        "rpm": 30,
    },
    "openrouter": {
        "base_url": "https://openrouter.ai/api/v1",
        "model": "mistralai/mistral-7b-instruct:free",
        "env_key": "OPENROUTER_API_KEY",
        "free": True,
        "rpm": 20,
    },
    "cohere": {
        "base_url": "https://api.cohere.com/v1",
        "model": "command-r",
        "env_key": "COHERE_API_KEY",
        "free": True,
        "rpm": 20,
    },
}


class LLMClient:
    """
    Unified LLM client with automatic fallback across free providers.
    Priority: Gemini → Groq → OpenRouter → Cohere
    """

    def __init__(self, preferred_provider: Optional[str] = None):
        self.preferred = preferred_provider or os.getenv("LLM_PROVIDER", "gemini")
        self.fallback_order = ["gemini", "groq", "openrouter", "cohere"]
        self.timeout = httpx.Timeout(120.0, connect=10.0)

    def _get_api_key(self, provider: str) -> Optional[str]:
        env_key = PROVIDERS[provider]["env_key"]
        return os.getenv(env_key)

    def _get_available_providers(self) -> list[str]:
        """Return providers that have API keys configured."""
        available = []
        order = [self.preferred] + [p for p in self.fallback_order if p != self.preferred]
        for p in order:
            if self._get_api_key(p):
                available.append(p)
        return available

    # ── Gemini ──────────────────────────────────────────────────────────────

    async def _call_gemini(self, system: str, user: str, stream: bool) -> AsyncGenerator[str, None]:
        api_key = self._get_api_key("gemini")
        model = PROVIDERS["gemini"]["model"]
        url = f"{PROVIDERS['gemini']['base_url']}/models/{model}:{'streamGenerateContent' if stream else 'generateContent'}?key={api_key}"

        payload = {
            "system_instruction": {"parts": [{"text": system}]},
            "contents": [{"role": "user", "parts": [{"text": user}]}],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 4096,
                "topP": 0.95,
            },
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            if stream:
                async with client.stream("POST", url, json=payload) as resp:
                    resp.raise_for_status()
                    buffer = ""
                    async for chunk in resp.aiter_text():
                        buffer += chunk
                        # Gemini streams JSON array chunks
                        try:
                            # Extract text from partial JSON
                            import re
                            texts = re.findall(r'"text":\s*"((?:[^"\\]|\\.)*)"', buffer)
                            for t in texts:
                                decoded = t.encode().decode('unicode_escape').encode('latin1').decode('utf-8')
                                yield decoded
                            buffer = ""
                        except Exception:
                            pass
            else:
                resp = await client.post(url, json=payload)
                resp.raise_for_status()
                data = resp.json()
                yield data["candidates"][0]["content"]["parts"][0]["text"]

    # ── Groq (OpenAI-compatible) ─────────────────────────────────────────────

    async def _call_groq(self, system: str, user: str, stream: bool) -> AsyncGenerator[str, None]:
        api_key = self._get_api_key("groq")
        url = f"{PROVIDERS['groq']['base_url']}/chat/completions"

        payload = {
            "model": PROVIDERS["groq"]["model"],
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            "temperature": 0.7,
            "max_tokens": 4096,
            "stream": stream,
        }

        headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            if stream:
                async with client.stream("POST", url, json=payload, headers=headers) as resp:
                    resp.raise_for_status()
                    async for line in resp.aiter_lines():
                        if line.startswith("data: ") and line != "data: [DONE]":
                            try:
                                data = json.loads(line[6:])
                                delta = data["choices"][0]["delta"].get("content", "")
                                if delta:
                                    yield delta
                            except Exception:
                                pass
            else:
                resp = await client.post(url, json=payload, headers=headers)
                resp.raise_for_status()
                yield resp.json()["choices"][0]["message"]["content"]

    # ── OpenRouter ───────────────────────────────────────────────────────────

    async def _call_openrouter(self, system: str, user: str, stream: bool) -> AsyncGenerator[str, None]:
        api_key = self._get_api_key("openrouter")
        url = f"{PROVIDERS['openrouter']['base_url']}/chat/completions"

        payload = {
            "model": PROVIDERS["openrouter"]["model"],
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            "max_tokens": 4096,
            "stream": stream,
        }

        headers = {
            "Authorization": f"Bearer {api_key}",
            "HTTP-Referer": "https://foundry-ai.app",
            "X-Title": "FOUNDryAI",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            if stream:
                async with client.stream("POST", url, json=payload, headers=headers) as resp:
                    resp.raise_for_status()
                    async for line in resp.aiter_lines():
                        if line.startswith("data: ") and line != "data: [DONE]":
                            try:
                                data = json.loads(line[6:])
                                delta = data["choices"][0]["delta"].get("content", "")
                                if delta:
                                    yield delta
                            except Exception:
                                pass
            else:
                resp = await client.post(url, json=payload, headers=headers)
                resp.raise_for_status()
                yield resp.json()["choices"][0]["message"]["content"]

    # ── Cohere ───────────────────────────────────────────────────────────────

    async def _call_cohere(self, system: str, user: str, stream: bool) -> AsyncGenerator[str, None]:
        api_key = self._get_api_key("cohere")
        url = f"{PROVIDERS['cohere']['base_url']}/chat"

        payload = {
            "model": PROVIDERS["cohere"]["model"],
            "message": user,
            "preamble": system,
            "temperature": 0.7,
            "max_tokens": 4096,
            "stream": stream,
        }

        headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            if stream:
                async with client.stream("POST", url, json=payload, headers=headers) as resp:
                    resp.raise_for_status()
                    async for line in resp.aiter_lines():
                        try:
                            data = json.loads(line)
                            if data.get("event_type") == "text-generation":
                                yield data.get("text", "")
                        except Exception:
                            pass
            else:
                resp = await client.post(url, json=payload, headers=headers)
                resp.raise_for_status()
                yield resp.json()["text"]

    # ── Public Interface ─────────────────────────────────────────────────────

    async def generate(
        self,
        system: str,
        user: str,
        stream: bool = True,
        provider: Optional[str] = None,
    ) -> AsyncGenerator[str, None]:
        """
        Generate text with automatic fallback across free providers.
        Yields text chunks if streaming, or full text if not.
        """
        providers = self._get_available_providers()

        if not providers:
            raise ValueError(
                "No API keys configured. Please set GEMINI_API_KEY or GROQ_API_KEY in your .env file.\n"
                "Get free keys at:\n"
                "  Gemini: https://aistudio.google.com/app/apikey\n"
                "  Groq:   https://console.groq.com"
            )

        if provider and provider in providers:
            providers = [provider] + [p for p in providers if p != provider]

        last_error = None
        for p in providers:
            try:
                caller = {
                    "gemini": self._call_gemini,
                    "groq": self._call_groq,
                    "openrouter": self._call_openrouter,
                    "cohere": self._call_cohere,
                }.get(p)

                if caller:
                    async for chunk in caller(system, user, stream):
                        yield chunk
                    return  # Success — stop trying fallbacks

            except httpx.HTTPStatusError as e:
                last_error = e
                if e.response.status_code in (401, 403):
                    # Bad API key — skip this provider
                    continue
                elif e.response.status_code == 429:
                    # Rate limited — try next provider
                    continue
                else:
                    continue
            except Exception as e:
                last_error = e
                continue

        raise RuntimeError(f"All providers failed. Last error: {last_error}")

    def get_provider_status(self) -> dict:
        """Return which providers are configured and available."""
        status = {}
        for name, config in PROVIDERS.items():
            key = self._get_api_key(name)
            status[name] = {
                "configured": bool(key),
                "model": config["model"],
                "free": config["free"],
                "rpm": config["rpm"],
                "key_preview": f"{key[:12]}..." if key else None,
            }
        return status
