"""
FOUNDryAI — FastAPI Application Entry Point
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from src.api.routes import router

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 FOUNDryAI API starting...")
    print(f"   LLM Provider: {os.getenv('LLM_PROVIDER', 'auto')}")
    print(f"   Gemini Key:   {'✓ Set' if os.getenv('GEMINI_API_KEY') else '✗ Not set'}")
    print(f"   Groq Key:     {'✓ Set' if os.getenv('GROQ_API_KEY') else '✗ Not set'}")
    yield
    print("👋 FOUNDryAI API shutting down...")


app = FastAPI(
    title="FOUNDryAI",
    description="AI-powered startup blueprint generator — 9-Engine Pipeline",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1")


@app.get("/")
async def root():
    return {
        "name": "FOUNDryAI",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "pipeline_engines": 9,
    }
