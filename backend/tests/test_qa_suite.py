import os
import sys

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.extractor import extract_document_text
from app.services.gemini import analyze_report_with_gemini
from app.services.chat_service import ask_report_chat
from app.services.telegram_bot import validate_file, mask_token
from app.services.supabase_service import is_supabase_enabled

def run_all_qa_tests():
    print("=================================================================")
    print("           REPORTSAATHI QA TEST SUITE VERIFICATION              ")
    print("=================================================================")

    # 1. Upload Validation Tests
    print("\n[1/5] Testing Upload Validation & Sanitization...")
    valid_pdf, err = validate_file("blood_test.pdf", 2 * 1024 * 1024)
    assert valid_pdf is True and err is None, "Valid PDF was incorrectly rejected"
    
    valid_png, err = validate_file("scan.png", 500 * 1024)
    assert valid_png is True and err is None, "Valid PNG was incorrectly rejected"
    
    invalid_ext, err = validate_file("malicious.exe", 1024)
    assert invalid_ext is False and "Unsupported file format" in err, "Executable was not rejected"
    
    oversized, err = validate_file("huge_scan.pdf", 15 * 1024 * 1024)
    assert oversized is False and "exceeds the 10 MB limit" in err, "Oversized file was not rejected"
    print("  --> Upload validation passed (supported types + size limits strictly enforced).")

    # 2. Text Extraction & OCR Fallback Tests
    print("\n[2/5] Testing Text Extraction...")
    sample_cbc_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "sample_reports", "sample_cbc_report.txt"))
    with open(sample_cbc_path, "rb") as f:
        cbc_bytes = f.read()
    cbc_res = extract_document_text(cbc_bytes, "sample_cbc_report.txt")
    assert cbc_res.get("success") is True, "CBC extraction failed"
    assert "Hemoglobin" in cbc_res.get("text", ""), "Hemoglobin not found in extracted text"
    print(f"  --> Extracted {cbc_res.get('character_count')} characters from CBC sample successfully.")

    # 3. Gemini / Deterministic Fallback & Clinical Safety Tests
    print("\n[3/5] Testing Analysis & Non-Diagnostic Medical Guardrails...")
    analysis = analyze_report_with_gemini(cbc_res.get("text", ""), filename="sample_cbc_report.txt")
    assert analysis.success is True, "Analysis failed"
    assert len(analysis.findings) > 0, "No findings extracted"
    assert len(analysis.summary.questions_for_doctor) >= 2, "Doctor questions not generated"
    assert analysis.summary.educational_disclaimer != "", "Mandatory educational disclaimer missing"
    
    # Check that no diagnostic assertions are made
    overview = analysis.summary.overall_summary.lower()
    assert "you have anemia" not in overview, "Diagnostic assertion detected!"
    assert "you have diabetes" not in overview, "Diagnostic assertion detected!"
    print(f"  --> Analysis verified. Extracted {len(analysis.findings)} parameters safely without diagnostic claims.")

    # 4. Report-Specific Grounded Chat & Out-of-Scope Rejection Tests
    print("\n[4/5] Testing Report-Specific Chat & Scope Boundaries...")
    report_dict = {
        "title": analysis.summary.report_title,
        "summary": analysis.summary.model_dump(),
        "findings": [f.model_dump() for f in analysis.findings]
    }
    
    # In-scope question (Hemoglobin)
    in_scope_res = ask_report_chat(report_dict, "What does Hemoglobin mean in my report?")
    assert in_scope_res.get("grounded_in_report") is True, "In-scope question failed"
    assert "Hemoglobin" in in_scope_res.get("reply", ""), "Hemoglobin details missing from in-scope answer"

    # Out-of-scope question (Thyroid)
    out_of_scope_res = ask_report_chat(report_dict, "What is my Thyroid TSH level?")
    assert out_of_scope_res.get("grounded_in_report") is False, "Out-of-scope question was incorrectly marked grounded"
    assert "unavailable in this report" in out_of_scope_res.get("reply", "").lower() or "unavailable" in out_of_scope_res.get("reply", "").lower(), "Out-of-scope refusal missing"
    print("  --> In-scope inquiry answered; Out-of-scope inquiry properly rejected as unavailable.")

    # 5. Telegram Bot & Token Masking Security Tests
    print("\n[5/5] Testing Telegram Bot Security & Secret Protection...")
    masked = mask_token("123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ")
    assert masked == "1234...wxyZ", f"Token mask incorrect: {masked}"
    assert "ABCdef" not in masked, "Secret token exposed in masked output"
    print("  --> Token masking and privacy checks verified.")

    print("\n=================================================================")
    print("       ALL BACKEND QA ENGINE TESTS PASSED SUCCESSFULLY!          ")
    print("=================================================================\n")

if __name__ == "__main__":
    run_all_qa_tests()
