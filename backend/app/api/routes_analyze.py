from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Dict, Any, Optional
import os
from app.services.document_processor import (
    validate_uploaded_document,
    safe_temporary_file,
    extract_from_pdf_file,
    extract_from_image_file,
    pytesseract
)
from app.services.gemini import analyze_report_with_gemini
from app.schemas.report import ReportAnalysisResponse

router = APIRouter()

@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """Health check endpoint reporting OCR, Gemini configuration, and API readiness."""
    tesseract_version = None
    try:
        tesseract_version = pytesseract.get_tesseract_version()
    except Exception:
        tesseract_version = "unavailable"

    gemini_key_set = bool(os.environ.get("GEMINI_API_KEY", "").strip())

    return {
        "status": "ok",
        "service": "ReportSaathi Backend API",
        "tesseract_ocr": {
            "installed": tesseract_version != "unavailable",
            "version": str(tesseract_version)
        },
        "gemini_api_configured": gemini_key_set,
        "supported_formats": [".pdf", ".jpg", ".jpeg", ".png"],
        "max_upload_size_mb": 10
    }

@router.post("/reports/analyze", response_model=ReportAnalysisResponse)
async def analyze_report_upload(
    file: UploadFile = File(...)
) -> ReportAnalysisResponse:
    """
    Accepts a PDF, JPG, or PNG laboratory report.
    1. Validates file type and size (<= 10MB).
    2. Safely handles temporary files with automatic cleanup.
    3. Extracts text via pdfplumber or Tesseract OCR for scanned documents.
    4. Passes extracted text to Gemini API for structured, non-diagnostic explanation.
    5. Returns structured JSON containing source-extracted facts separated from AI explanations.
    """
    # 1. Read file bytes
    try:
        file_bytes = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to read the uploaded document: {str(e)}"
        )

    # 2. Strict file type and size validation
    ext, detected_type = validate_uploaded_document(
        file_bytes=file_bytes,
        filename=file.filename or "unknown",
        content_type=file.content_type
    )

    # 3. Safe temporary file handling
    with safe_temporary_file(file_bytes=file_bytes, suffix=ext) as temp_path:
        # 4. Extract text depending on file format
        if ext == ".pdf":
            extraction_result = extract_from_pdf_file(temp_path)
        else:
            extraction_result = extract_from_image_file(temp_path)

    extracted_text = extraction_result.get("text", "").strip()

    # 5. Handle unreadable or empty OCR output
    if not extracted_text or len(extracted_text) < 15:
        raise HTTPException(
            status_code=422,
            detail="No readable text could be extracted from the document. Please ensure the report is clear, right-side up, and has good contrast."
        )

    # 6. Analyze with Gemini API (validates output schema and strictly separates facts from explanations)
    analysis = analyze_report_with_gemini(
        extracted_text=extracted_text,
        filename=file.filename
    )

    if extraction_result.get("warning"):
        analysis.warnings.append(extraction_result["warning"])

    return analysis
