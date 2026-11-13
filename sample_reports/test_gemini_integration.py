import sys
import os
import requests

BASE_URL = "http://localhost:8000/api"

def run_tests():
    print("==================================================")
    print("Testing ReportSaathi Backend & Gemini Integration")
    print("==================================================")

    # 1. Health check
    print("\n[1] Testing GET /api/health...")
    r = requests.get(f"{BASE_URL}/health")
    assert r.status_code == 200, f"Health check failed: {r.text}"
    health_data = r.json()
    print("Status:", health_data["status"])
    print("Tesseract OCR:", health_data["tesseract_ocr"])
    print("Gemini API configured:", health_data.get("gemini_api_configured"))

    # 2. Upload PNG Report
    print("\n[2] Testing POST /api/reports/analyze with PNG image...")
    png_path = os.path.join(os.path.dirname(__file__), "generated_test_report.png")
    with open(png_path, "rb") as f:
        files = {"file": ("test_cbc_report.png", f, "image/png")}
        r = requests.post(f"{BASE_URL}/reports/analyze", files=files)
    assert r.status_code == 200, f"Analyze PNG failed: {r.status_code} - {r.text}"
    data = r.json()
    print("Response Status:", data["status"])
    print("Report Title:", data["summary"]["report_title"])
    print("Total Findings Extracted:", len(data["structured_data"]))
    print("Educational Disclaimer Present:", bool(data["summary"]["educational_disclaimer"]))
    
    first_finding = data["structured_data"][0]
    print("\nFirst Finding Verification:")
    print(" - Test Name:", first_finding["test_name"])
    print(" - Extracted Value (Fact):", first_finding["extracted_value"])
    print(" - Source Fact Line:", first_finding["source_extracted_fact"])
    print(" - Simple Explanation (AI):", first_finding["simple_explanation"][:80], "...")
    assert "source_extracted_fact" in first_finding, "Missing source_extracted_fact!"
    assert "simple_explanation" in first_finding, "Missing simple_explanation!"

    # 3. Upload Scanned PDF
    print("\n[3] Testing POST /api/reports/analyze with Scanned PDF...")
    pdf_path = os.path.join(os.path.dirname(__file__), "scanned_lab_report.pdf")
    with open(pdf_path, "rb") as f:
        files = {"file": ("scanned_report.pdf", f, "application/pdf")}
        r = requests.post(f"{BASE_URL}/reports/analyze", files=files)
    assert r.status_code == 200, f"Analyze PDF failed: {r.status_code} - {r.text}"
    pdf_data = r.json()
    print("PDF Page Count:", pdf_data["page_count"])
    print("PDF Findings Count:", len(pdf_data["structured_data"]))

    # 4. Upload Synthetic Report with Missing Reference Ranges (Strict Rule Verification)
    print("\n[4] Testing Report with Missing Reference Ranges (Never Invent Missing Data)...")
    unclear_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "samples", "sample_unclear_report.png")
    with open(unclear_path, "rb") as f:
        files = {"file": ("sample_unclear.png", f, "image/png")}
        r = requests.post(f"{BASE_URL}/reports/analyze", files=files)
    assert r.status_code == 200
    unclear_data = r.json()
    print("Title:", unclear_data["summary"]["report_title"])
    print("Findings with Missing Notes:")
    for f in unclear_data["structured_data"]:
        print(f" - {f['test_name']}: Value={f['extracted_value']}, Range={f['reference_range']}, Missing Note={f['missing_or_unclear_note']}")
        if f['reference_range'] == "Not specified on report":
            assert f['missing_or_unclear_note'] is not None, "Missing or unclear note was not generated!"

    # 5. Unsupported file format rejection
    print("\n[5] Testing Unsupported File Format Rejection...")
    files = {"file": ("document.docx", b"PK\x03\x04 fake docx bytes", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
    r = requests.post(f"{BASE_URL}/reports/analyze", files=files)
    print("Status code:", r.status_code)
    assert r.status_code == 400
    print("Error message:", r.json()["detail"])

    print("\n==================================================")
    print("ALL GEMINI BACKEND INTEGRATION TESTS PASSED!")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
