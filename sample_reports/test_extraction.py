import sys
import os

# Ensure backend app is importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from PIL import Image, ImageDraw, ImageFont
from app.services.extractor import extract_document_text

def test_image_ocr():
    print("--- 1. Testing Image OCR with Tesseract ---")
    
    # Read sample report text
    sample_text_path = os.path.join(os.path.dirname(__file__), "sample_cbc_report.txt")
    with open(sample_text_path, "r", encoding="utf-8") as f:
        text = f.read()
    
    # Render sample report into a simulated printed lab sheet image
    img_width, img_height = 1400, 1000
    image = Image.new("RGB", (img_width, img_height), color=(255, 255, 255))
    draw = ImageDraw.Draw(image)
    
    # Use default bitmap or basic font
    draw.text((50, 50), text, fill=(20, 20, 20))
    
    test_img_path = os.path.join(os.path.dirname(__file__), "generated_test_report.png")
    image.save(test_img_path)
    print(f"Generated test image at: {test_img_path}")
    
    with open(test_img_path, "rb") as f:
        img_bytes = f.read()
    
    res = extract_document_text(img_bytes, "generated_test_report.png", "image/png")
    print("Method:", res["method"])
    print("Success:", res["success"])
    print("Character Count:", res["character_count"])
    print("Preview:\n", res["text"][:300])
    
    assert res["success"] is True, "Image extraction failed!"
    assert "Hemoglobin" in res["text"] or "Hemog" in res["text"], "Hemoglobin was not found in OCR text!"
    print("--> Image OCR test PASSED!")

def test_text_extractor():
    print("\n--- 2. Testing Plain Text / Raw Extraction ---")
    sample_text_path = os.path.join(os.path.dirname(__file__), "sample_lipid_panel.txt")
    with open(sample_text_path, "rb") as f:
        txt_bytes = f.read()
    
    res = extract_document_text(txt_bytes, "sample_lipid_panel.txt", "text/plain")
    print("Method:", res["method"])
    print("Success:", res["success"])
    print("Character Count:", res["character_count"])
    assert "Cholesterol" in res["text"]
    print("--> Text extraction test PASSED!")

def test_scanned_pdf_ocr():
    print("\n--- 3. Testing Scanned PDF Fallback via pypdfium2 + Tesseract ---")
    test_img_path = os.path.join(os.path.dirname(__file__), "generated_test_report.png")
    image = Image.open(test_img_path)
    
    # Save image as a scanned PDF document
    scanned_pdf_path = os.path.join(os.path.dirname(__file__), "scanned_lab_report.pdf")
    image.save(scanned_pdf_path, "PDF", resolution=150.0)
    print(f"Generated scanned PDF at: {scanned_pdf_path}")
    
    with open(scanned_pdf_path, "rb") as f:
        pdf_bytes = f.read()
        
    res = extract_document_text(pdf_bytes, "scanned_lab_report.pdf", "application/pdf")
    print("Method:", res["method"])
    print("Success:", res["success"])
    print("Page Count:", res["page_count"])
    print("Character Count:", res["character_count"])
    print("Warning:", res.get("warning"))
    
    assert res["success"] is True
    assert res["method"] == "pdf_scanned_ocr"
    assert "Hemoglobin" in res["text"] or "Hemog" in res["text"]
    print("--> Scanned PDF OCR fallback test PASSED!")

if __name__ == "__main__":
    test_image_ocr()
    test_text_extractor()
    test_scanned_pdf_ocr()
    print("\nALL EXTRACTION TESTS PASSED SUCCESSFULLY!")
