from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.routes_analyze import router as analyze_router
from app.api.routes_history import router as history_router
from app.api.routes_chat import router as chat_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="ReportSaathi API - Medical laboratory report explainer for educational purposes"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(analyze_router, prefix="/api", tags=["Analysis"])
app.include_router(history_router, prefix="/api/history", tags=["History"])
app.include_router(chat_router, prefix="/api/chat", tags=["Chat"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to ReportSaathi API. Visit /docs for the Swagger interactive API documentation.",
        "status": "healthy"
    }
