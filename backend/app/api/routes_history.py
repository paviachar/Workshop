from fastapi import APIRouter, HTTPException, Query, Header
from typing import Dict, Any, List, Optional
from app.services.supabase_service import (
    is_supabase_enabled,
    save_report_to_supabase,
    get_user_reports_from_supabase,
    delete_user_report_from_supabase
)

router = APIRouter()

@router.get("/status")
async def history_status() -> Dict[str, Any]:
    return {
        "supabase_configured": is_supabase_enabled(),
        "mode": "cloud_supabase" if is_supabase_enabled() else "guest_local_storage"
    }

@router.get("/")
async def list_reports(
    user_id: Optional[str] = Query(None)
) -> Dict[str, Any]:
    if not is_supabase_enabled():
        return {
            "reports": [],
            "supabase_enabled": False,
            "message": "Supabase not configured. Using browser localStorage history."
        }
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID is required when Supabase is enabled.")
        
    reports = get_user_reports_from_supabase(user_id)
    return {
        "reports": reports,
        "supabase_enabled": True
    }

@router.post("/")
async def save_report(
    payload: Dict[str, Any]
) -> Dict[str, Any]:
    user_id = payload.get("user_id")
    report_data = payload.get("report")
    
    if not is_supabase_enabled():
        return {
            "saved": False,
            "supabase_enabled": False,
            "message": "Supabase not configured. Stored in client localStorage."
        }
        
    if not user_id or not report_data:
        raise HTTPException(status_code=400, detail="Missing user_id or report data.")
        
    saved_record = save_report_to_supabase(user_id, report_data)
    if not saved_record:
        raise HTTPException(status_code=500, detail="Failed to save report to Supabase.")
        
    return {
        "saved": True,
        "record": saved_record,
        "supabase_enabled": True
    }

@router.delete("/{report_id}")
async def delete_report(
    report_id: str,
    user_id: str = Query(...)
) -> Dict[str, Any]:
    if not is_supabase_enabled():
        return {"deleted": True, "supabase_enabled": False}
        
    success = delete_user_report_from_supabase(user_id, report_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete report.")
    return {"deleted": True, "report_id": report_id}
