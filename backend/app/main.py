import sys
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# Revert back to relative import
from .api.websocket import get_websocket_router

app = FastAPI(title="FarmSoc AI Agent Backend")

# Configure CORS (adjust origins as needed for development/production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for now (restrict in production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

websocket_router = get_websocket_router() # Get the router

@app.get("/")
async def read_root():
    return {"message": "AI Agent Backend is running"}

# Include WebSocket router
app.include_router(websocket_router) # Use the instance here

print("AI Agent Backend with WebSocket endpoint is configured.") 