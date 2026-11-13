from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from app.services.chat_service import ask_report_chat

router = APIRouter()

class ChatRequest(BaseModel):
    question: str = Field(..., description="User question about the selected report")
    report: Dict[str, Any] = Field(..., description="Currently selected report data")
    chat_history: Optional[List[Dict[str, str]]] = Field(default=[], description="Previous conversation messages")

class ChatResponse(BaseModel):
    reply: str
    grounded_in_report: bool
    disclaimer: str

@router.post("/", response_model=ChatResponse)
async def chat_with_report(req: ChatRequest):
    if not req.question or not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
    
    if not req.report:
        raise HTTPException(status_code=400, detail="Report data must be provided to ground answers.")

    result = ask_report_chat(
        report_data=req.report,
        question=req.question.strip(),
        chat_history=req.chat_history
    )
    return result
