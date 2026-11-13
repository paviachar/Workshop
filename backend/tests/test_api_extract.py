import sys
import os
import io
import anyio

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi import UploadFile
from app.api.routes_analyze import analyze_report_upload, health_check

async def main():
    # 1. Healthcheck
    health = await health_check()
    print("Health Status:", health["status"])
    assert health["status"] == "ok"
    
    # 2. Extract and analyze from sample report using anyio
    sample_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "sample_reports", "sample_cbc_report.txt"))
    with open(sample_path, "rb") as f:
        file_bytes = f.read()
    
    upload_file = UploadFile(
        file=io.BytesIO(file_bytes),
        filename="sample_cbc_report.txt",
        headers={"content-type": "text/plain"}
    )
    
    result = await analyze_report_upload(upload_file)
    print("Report Title:", result.summary.report_title)
    print("Findings Count:", len(result.findings))
    assert len(result.findings) > 0
    test_names = [f.test_name for f in result.findings]
    assert any("Hemoglobin" in name for name in test_names)
    print("--> Direct Route extraction test with AnyIO PASSED!")

if __name__ == "__main__":
    anyio.run(main)
