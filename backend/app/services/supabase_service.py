import logging
from typing import Dict, Any, List, Optional
from app.config import settings

logger = logging.getLogger(__name__)

supabase_client = None

if settings.SUPABASE_URL and settings.SUPABASE_KEY:
    try:
        from supabase import create_client
        supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        logger.info("Supabase client initialized successfully.")
    except Exception as e:
        logger.warning(f"Could not initialize Supabase client: {e}")
        supabase_client = None

def is_supabase_enabled() -> bool:
    return supabase_client is not None

def save_report_to_supabase(user_id: str, report_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    if not supabase_client:
        return None
    try:
        summary = report_data.get("summary", {})
        payload = {
            "user_id": user_id,
            "report_title": summary.get("report_title", "Lab Report"),
            "patient_context": summary.get("patient_context"),
            "overall_overview": summary.get("overall_overview", ""),
            "key_highlights": summary.get("key_highlights", []),
            "questions_for_doctor": summary.get("questions_for_doctor", []),
            "findings": report_data.get("findings", [])
        }
        res = supabase_client.table("reports").insert(payload).execute()
        return res.data[0] if res.data else None
    except Exception as e:
        logger.error(f"Failed to save report to Supabase: {e}")
        return None

def get_user_reports_from_supabase(user_id: str) -> List[Dict[str, Any]]:
    if not supabase_client:
        return []
    try:
        res = (
            supabase_client.table("reports")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )
        return res.data or []
    except Exception as e:
        logger.error(f"Failed to fetch reports from Supabase: {e}")
        return []

def delete_user_report_from_supabase(user_id: str, report_id: str) -> bool:
    if not supabase_client:
        return False
    try:
        supabase_client.table("reports").delete().eq("id", report_id).eq("user_id", user_id).execute()
        return True
    except Exception as e:
        logger.error(f"Failed to delete report from Supabase: {e}")
        return False
