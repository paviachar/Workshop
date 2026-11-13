import sys
import os
import io

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app

def test_full_backend_suite():
    client = TestClient(app)
    
    # 1. Health check
    print("--- 1. Testing GET /api/health ---")
    res = client.get("/api/health")
    print("Health response:", res.status_code, res.json())
    assert res.status_code == 200
    assert res.json()["status"] == "ok"
    assert res.json()["tesseract_ocr"]["installed"] is True
    print("--> Health check PASSED!")

    # 2. Test PNG image upload
    print("\n--- 2. Testing POST /api/reports/analyze with PNG image ---")
    png_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "sample_reports", "generated_test_report.png"))
    with open(png_path, "rb") as f:
        files = {"file": ("test_report.png", f.read(), "image/png")}
        res = client.post("/api/reports/analyze", files=files)
    print("PNG Analyze status:", res.status_code)
    data = res.json()
    print("Status:", data.get("status"))
    print("Extracted text length:", len(data.get("extracted_text", "")))
    print("Structured findings count:", len(data.get("structured_data", [])))
    print("Findings names:", [f["test_name"] for f in data.get("structured_data", [])])
    assert res.status_code == 200
    assert data["success"] is True
    assert len(data["structured_data"]) > 0
    print("--> PNG image analyze PASSED!")

    # 3. Test Scanned PDF upload
    print("\n--- 3. Testing POST /api/reports/analyze with Scanned PDF ---")
    pdf_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "sample_reports", "scanned_lab_report.pdf"))
    with open(pdf_path, "rb") as f:
        files = {"file": ("scanned_lab_report.pdf", f.read(), "application/pdf")}
        res = client.post("/api/reports/analyze", files=files)
    print("PDF Analyze status:", res.status_code)
    pdf_data = res.json()
    print("Status:", pdf_data.get("status"))
    print("Page count:", pdf_data.get("page_count"))
    print("Structured findings count:", len(pdf_data.get("structured_data", [])))
    assert res.status_code == 200
    assert pdf_data["success"] is True
    print("--> Scanned PDF analyze PASSED!")

    # 4. Test Unsupported File format (.txt or .docx)
    print("\n--- 4. Testing Unsupported File Format Rejection ---")
    files = {"file": ("report.docx", b"PK\x03\x04 fake docx content", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
    res = client.post("/api/reports/analyze", files=files)
    print("Unsupported format response:", res.status_code, res.json())
    assert res.status_code == 400
    assert "Unsupported file format" in res.json()["detail"]
    print("--> Unsupported format rejection PASSED!")

    # 5. Test Empty file handling
    print("\n--- 5. Testing Empty File Rejection ---")
    files = {"file": ("empty.png", b"", "image/png")}
    res = client.post("/api/reports/analyze", files=files)
    print("Empty file response:", res.status_code, res.json())
    assert res.status_code == 400
    assert "empty" in res.json()["detail"].lower()
    print("--> Empty file rejection PASSED!")

    print("\nALL BACKEND API TESTS COMPLETED AND PASSED!")

if __name__ == "__main__":
    test_full_backend_suite()
