import io
import re
import os
import logging
from typing import Dict, Any, Optional
from PIL import Image, ImageOps, ImageFilter, ImageEnhance
import pdfplumber
import pytesseract
import pypdfium2 as pdfium
from app.config import settings

logger = logging.getLogger(__name__)

# Configure Tesseract path if available or in default Windows path
TESSERACT_CANDIDATE_PATHS = [
    settings.TESSERACT_CMD,
    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
    r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
    r"C:\Users\pavia\AppData\Local\Programs\Tesseract-OCR\tesseract.exe"
]

for path in TESSERACT_CANDIDATE_PATHS:
    if path and os.path.exists(path):
        pytesseract.pytesseract.tesseract_cmd = path
        logger.info(f"Using Tesseract OCR at: {path}")
        break

def preprocess_image_for_ocr(image: Image.Image) -> Image.Image:
    """
    Applies image preprocessing to improve OCR accuracy on noisy,
    shadowed, or low-contrast medical report photos and scans.
    """
    # Convert RGBA or Palette mode to RGB
    if image.mode != "RGB":
        image = image.convert("RGB")
    
    # Scale up if image is small (< 1500px width) to ensure text legibility
    width, height = image.size
    if width < 1500:
        scale_factor = 1500 / width
        image = image.resize((int(width * scale_factor), int(height * scale_factor)), Image.Resampling.LANCZOS)
    
    # Convert to grayscale
    gray = ImageOps.grayscale(image)
    
    # Auto-contrast normalization
    contrasted = ImageOps.autocontrast(gray, cutoff=1)
    
    # Increase sharpness slightly
    enhancer = ImageEnhance.Sharpness(contrasted)
    sharpened = enhancer.enhance(1.5)
    
    return sharpened

def clean_extracted_text(text: str) -> str:
    """
    Normalizes whitespace and cleans common OCR artifacts while
    preserving structural line breaks essential for tabular medical data.
    """
    if not text:
        return ""
    
    # Replace non-breaking spaces and unusual unicode spaces
    text = text.replace('\xa0', ' ').replace('\u200b', '')
    
    lines = []
    for line in text.splitlines():
        # Strip trailing and leading whitespace from each line
        stripped = line.strip()
        if stripped:
            # Collapse multiple spaces into single space or tab separator
            cleaned_line = re.sub(r'[ ]{2,}', '   ', stripped)
            lines.append(cleaned_line)
    
    return "\n".join(lines)

def extract_text_from_pdf(pdf_bytes: bytes) -> Dict[str, Any]:
    """
    Extracts text from PDF documents using a dual approach:
    1. Direct digital text extraction via pdfplumber (fast & high precision).
    2. Fallback to native pypdfium2 rendering + Tesseract OCR if the PDF is scanned.
    """
    extracted_text = ""
    page_count = 0
    method = "pdf_digital"
    
    # Attempt 1: Direct digital text extraction
    try:
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            page_count = len(pdf.pages)
            pages_text = []
            for page in pdf.pages:
                text = page.extract_text(layout=True) or ""
                if text.strip():
                    pages_text.append(text)
            extracted_text = "\n\n".join(pages_text)
    except Exception as e:
        logger.warning(f"Digital PDF extraction failed, falling back to OCR: {e}")
        extracted_text = ""
    
    cleaned = clean_extracted_text(extracted_text)
    
    # If digital extraction yielded meaningful text (at least 60 characters with alphanumeric tokens), return it
    alphanumeric_count = len(re.findall(r'[a-zA-Z0-9]', cleaned))
    if alphanumeric_count >= 60:
        return {
            "text": cleaned,
            "method": method,
            "page_count": page_count,
            "character_count": len(cleaned),
            "success": True,
            "warning": None
        }
    
    # Attempt 2: Fallback to OCR for scanned PDF pages using pypdfium2
    logger.info("PDF appears to be scanned or contains image text. Rendering pages with pypdfium2 for Tesseract OCR...")
    ocr_pages_text = []
    try:
        pdf_doc = pdfium.PdfDocument(pdf_bytes)
        page_count = len(pdf_doc)
        
        # Limit OCR to first 5 pages to prevent timeouts on oversized documents
        max_pages = min(page_count, 5)
        for i in range(max_pages):
            page = pdf_doc.get_page(i)
            # Render page at 2x scale (~144 dpi) for reliable OCR quality
            pil_image = page.render(scale=2).to_pil()
            processed_img = preprocess_image_for_ocr(pil_image)
            
            # Run Tesseract with page segmentation mode 6 (assume uniform block of text)
            page_text = pytesseract.image_to_string(
                processed_img,
                config="--oem 3 --psm 6"
            )
            if page_text.strip():
                ocr_pages_text.append(page_text)
        
        method = "pdf_scanned_ocr"
        cleaned = clean_extracted_text("\n\n".join(ocr_pages_text))
        
        return {
            "text": cleaned,
            "method": method,
            "page_count": page_count,
            "character_count": len(cleaned),
            "success": bool(cleaned.strip()),
            "warning": "Extracted via OCR from scanned PDF. Some values may need verification." if cleaned.strip() else "Could not extract text from scanned PDF."
        }
    except Exception as e:
        logger.error(f"Scanned PDF OCR failed: {e}")
        return {
            "text": "",
            "method": "failed",
            "page_count": page_count,
            "character_count": 0,
            "success": False,
            "warning": f"PDF extraction failed: {str(e)}"
        }

def extract_text_from_image(image_bytes: bytes) -> Dict[str, Any]:
    """
    Extracts text from uploaded images (JPEG, PNG, WEBP, TIFF)
    using PIL preprocessing and Tesseract OCR.
    """
    try:
        image = Image.open(io.BytesIO(image_bytes))
        processed_image = preprocess_image_for_ocr(image)
        
        # Run Tesseract OCR
        # We try psm 6 first (uniform block/column), and fallback to psm 3 (fully automatic) if brief
        text = pytesseract.image_to_string(processed_image, config="--oem 3 --psm 6")
        if len(text.strip()) < 30:
            text = pytesseract.image_to_string(processed_image, config="--oem 3 --psm 3")
            
        cleaned = clean_extracted_text(text)
        
        return {
            "text": cleaned,
            "method": "image_ocr",
            "page_count": 1,
            "character_count": len(cleaned),
            "success": bool(cleaned.strip()),
            "warning": None if cleaned.strip() else "No readable text detected in the image."
        }
    except Exception as e:
        logger.error(f"Image OCR failed: {e}")
        return {
            "text": "",
            "method": "image_ocr_failed",
            "page_count": 1,
            "character_count": 0,
            "success": False,
            "warning": f"Image OCR extraction error: {str(e)}"
        }

def extract_document_text(file_bytes: bytes, filename: str, content_type: Optional[str] = None) -> Dict[str, Any]:
    """
    Main entry point for extracting text from any supported lab report file.
    Automatically detects file type and routes to optimal extraction pipeline.
    """
    lower_filename = filename.lower()
    
    if lower_filename.endswith(".pdf") or content_type == "application/pdf":
        return extract_text_from_pdf(file_bytes)
    
    image_extensions = (".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tiff")
    if lower_filename.endswith(image_extensions) or (content_type and content_type.startswith("image/")):
        return extract_text_from_image(file_bytes)
    
    # Handle plain text file testing
    if lower_filename.endswith(".txt") or content_type == "text/plain":
        try:
            text = file_bytes.decode("utf-8", errors="replace")
            cleaned = clean_extracted_text(text)
            return {
                "text": cleaned,
                "method": "plain_text",
                "page_count": 1,
                "character_count": len(cleaned),
                "success": True,
                "warning": None
            }
        except Exception as e:
            return {
                "text": "",
                "method": "plain_text_failed",
                "page_count": 1,
                "character_count": 0,
                "success": False,
                "warning": str(e)
            }
            
    return {
        "text": "",
        "method": "unsupported",
        "page_count": 0,
        "character_count": 0,
        "success": False,
        "warning": f"Unsupported file format: {filename}. Please upload a PDF or image (PNG, JPG, WEBP)."
    }
