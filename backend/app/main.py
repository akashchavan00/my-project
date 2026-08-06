from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables FIRST before importing other modules
# This ensures chat_service can access GROQ_API_KEY when it's initialized
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

# Now import modules that need environment variables
from app.routes import chat, agent
from app.services.database import db_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events"""
    # Startup
    await db_service.connect_to_database()
    yield
    # Shutdown
    await db_service.close_database_connection()


# Create FastAPI app
app = FastAPI(
    title="Chatbot API",
    description="AI Chatbot using FastAPI, LangChain, LangGraph, and MongoDB with Custom Agents",
    version="2.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router)
app.include_router(agent.router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to the Chatbot API with Custom Agents",
        "docs": "/docs",
        "health": "/api/chat/health",
        "features": ["chat", "custom_agents", "agent_templates"]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
