import sys
import os
import io
import anyio

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi import UploadFile
from app.api.routes_analyze import extract_text_endpoint, health_check

async def main():
    # 1. Healthcheck
    health = await health_check()
    print("Health Status:", health["status"])
    assert health["status"] == "ok"
    
    # 2. Extract from sample report using anyio
    sample_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "sample_reports", "sample_cbc_report.txt"))
    with open(sample_path, "rb") as f:
        file_bytes = f.read()
    
    upload_file = UploadFile(
        file=io.BytesIO(file_bytes),
        filename="sample_cbc_report.txt",
        headers={"content-type": "text/plain"}
    )
    
    result = await extract_text_endpoint(upload_file)
    print("Extraction Method:", result["extraction_method"])
    print("Character Count:", result["character_count"])
    assert result["character_count"] > 100
    assert "Hemoglobin" in result["text"]
    print("--> Direct Route extraction test with AnyIO PASSED!")

if __name__ == "__main__":
    anyio.run(main)
