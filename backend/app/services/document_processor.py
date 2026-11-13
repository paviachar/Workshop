import os
import io
import re
import tempfile
import logging
from typing import Dict, Any, List, Optional, Tuple
from contextlib import contextmanager
from PIL import Image, ImageOps, ImageEnhance
import pdfplumber
import pytesseract
import pypdfium2 as pdfium
from fastapi import HTTPException
from app.config import settings

logger = logging.getLogger(__name__)

# Configure Tesseract path
TESSERACT_CANDIDATE_PATHS = [
    settings.TESSERACT_CMD,
    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
    r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
    r"C:\Users\pavia\AppData\Local\Programs\Tesseract-OCR\tesseract.exe"
]

for path in TESSERACT_CANDIDATE_PATHS:
    if path and os.path.exists(path):
        pytesseract.pytesseract.tesseract_cmd = path
        logger.info(f"Tesseract OCR configured at: {path}")
        break

ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

@contextmanager
def safe_temporary_file(file_bytes: bytes, suffix: str):
    """
    Context manager for safe temporary file handling on Windows and Unix.
    Ensures file descriptors are cleanly closed before yielding path and
    reliably unlinked upon exit.
    """
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    temp_path = temp_file.name
    try:
        temp_file.write(file_bytes)
        temp_file.flush()
        temp_file.close()  # Close handle so other libraries can open on Windows
        yield temp_path
    finally:
        if os.path.exists(temp_path):
            try:
                os.unlink(temp_path)
            except Exception as e:
                logger.warning(f"Failed to remove temporary file {temp_path}: {e}")

def validate_uploaded_document(file_bytes: bytes, filename: str, content_type: Optional[str] = None) -> Tuple[str, str]:
    """
    Validates file extension, magic bytes, and file size.
    Raises HTTPException with useful error messages if invalid.
    """
    if not file_bytes or len(file_bytes) == 0:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty. Please select a valid medical laboratory report."
        )

    # 1. Size Validation
    if len(file_bytes) > MAX_FILE_SIZE:
        size_mb = len(file_bytes) / (1024 * 1024)
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds the 10 MB limit (uploaded size: {size_mb:.2f} MB). Please compress or crop the report."
        )

    # 2. Extension Validation
    ext = os.path.splitext(filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext or 'unknown'}'. ReportSaathi accepts PDF, JPG, and PNG documents only."
        )

    # 3. Magic Header Check to guard against corrupted or spoofed files
    detected_type = "unknown"
    if file_bytes.startswith(b"%PDF"):
        detected_type = "application/pdf"
    elif file_bytes.startswith(b"\x89PNG\r\n\x1a\n"):
        detected_type = "image/png"
    elif file_bytes.startswith(b"\xff\xd8\xff"):
        detected_type = "image/jpeg"
    else:
        # If extension says pdf or image but magic bytes don't match
        if ext == ".pdf":
            raise HTTPException(
                status_code=400,
                detail="The uploaded PDF file is corrupted or not a valid PDF document."
            )
        elif ext in (".jpg", ".jpeg", ".png"):
            raise HTTPException(
                status_code=400,
                detail="The uploaded image file is corrupted or in an unrecognized image format."
            )

    return ext, detected_type

def preprocess_image_for_ocr(image: Image.Image) -> Image.Image:
    """
    Enhances contrast and sharpness to maximize OCR accuracy
    on phone camera photos and faint clinical printouts.
    """
    if image.mode != "RGB":
        image = image.convert("RGB")

    width, height = image.size
    if width < 1500:
        factor = 1500.0 / width
        image = image.resize((int(width * factor), int(height * factor)), Image.Resampling.LANCZOS)

    gray = ImageOps.grayscale(image)
    contrasted = ImageOps.autocontrast(gray, cutoff=1)
    enhancer = ImageEnhance.Sharpness(contrasted)
    return enhancer.enhance(1.4)

def clean_ocr_text(raw_text: str) -> str:
    """Normalizes whitespace and removes stray artifacts while keeping table rows."""
    if not raw_text:
        return ""
    raw_text = raw_text.replace("\xa0", " ").replace("\u200b", "")
    lines = []
    for line in raw_text.splitlines():
        trimmed = line.strip()
        if trimmed:
            cleaned = re.sub(r"[ ]{2,}", "   ", trimmed)
            lines.append(cleaned)
    return "\n".join(lines)

def extract_from_pdf_file(temp_path: str) -> Dict[str, Any]:
    """Extracts text from PDF: tries digital extraction first, then OCR for scanned pages."""
    text_content = ""
    page_count = 0
    method = "pdf_digital"

    try:
        with pdfplumber.open(temp_path) as pdf:
            page_count = len(pdf.pages)
            pages = []
            for p in pdf.pages:
                t = p.extract_text(layout=True) or ""
                if t.strip():
                    pages.append(t)
            text_content = "\n\n".join(pages)
    except Exception as e:
        logger.warning(f"pdfplumber text extraction failed: {e}")
        text_content = ""

    cleaned = clean_ocr_text(text_content)
    # Check if we have sufficient alphanumeric content for digital text
    alphanumerics = len(re.findall(r"[a-zA-Z0-9]", cleaned))
    if alphanumerics >= 50:
        return {
            "text": cleaned,
            "method": method,
            "page_count": page_count,
            "warning": None
        }

    # Fallback: Scanned PDF page rendering via pypdfium2 + Tesseract OCR
    logger.info("PDF contains insufficient digital text. Running OCR on scanned pages...")
    ocr_pages = []
    try:
        pdf_doc = pdfium.PdfDocument(temp_path)
        page_count = len(pdf_doc)
        max_pages = min(page_count, 6)
        for i in range(max_pages):
            page = pdf_doc.get_page(i)
            rendered_img = page.render(scale=2).to_pil()
            processed_img = preprocess_image_for_ocr(rendered_img)
            page_text = pytesseract.image_to_string(processed_img, config="--oem 3 --psm 6")
            if page_text.strip():
                ocr_pages.append(page_text)

        cleaned_ocr = clean_ocr_text("\n\n".join(ocr_pages))
        return {
            "text": cleaned_ocr,
            "method": "pdf_scanned_ocr",
            "page_count": page_count,
            "warning": "Extracted via OCR from scanned PDF pages. Please verify critical values against your paper sheet."
        }
    except Exception as e:
        logger.error(f"Scanned PDF OCR failed: {e}")
        return {
            "text": "",
            "method": "failed",
            "page_count": page_count,
            "warning": f"OCR extraction error on scanned PDF: {str(e)}"
        }

def extract_from_image_file(temp_path: str) -> Dict[str, Any]:
    """Runs PIL validation and Tesseract OCR on an image file."""
    try:
        with Image.open(temp_path) as img:
            # Check basic image integrity
            img.verify()

        # Reopen for actual processing (after verify, file pointer must be reopened)
        with Image.open(temp_path) as img:
            processed = preprocess_image_for_ocr(img)
            ocr_text = pytesseract.image_to_string(processed, config="--oem 3 --psm 6")
            if len(ocr_text.strip()) < 30:
                ocr_text = pytesseract.image_to_string(processed, config="--oem 3 --psm 3")

            cleaned = clean_ocr_text(ocr_text)
            return {
                "text": cleaned,
                "method": "image_ocr",
                "page_count": 1,
                "warning": None
            }
    except Exception as e:
        logger.error(f"Image processing error: {e}")
        return {
            "text": "",
            "method": "image_ocr_failed",
            "page_count": 1,
            "warning": f"Image processing failed: {str(e)}"
        }

# Educational glossary for common clinical laboratory tests
# Used strictly to describe what each test measures in human physiology WITHOUT inventing values.
CLINICAL_GLOSSARY = {
    "hemoglobin": {
        "standard_name": "Hemoglobin (Hb)",
        "explanation": "An iron-rich protein in red blood cells that transports oxygen from your lungs to tissues throughout your body.",
        "analogy": "Like cargo delivery vehicles carrying oxygen canisters to keep your organs energized."
    },
    "leucocyte": {
        "standard_name": "Total Leucocyte Count (WBC)",
        "explanation": "White blood cells that form your immune system's frontline defense against bacteria, viruses, and foreign invaders.",
        "analogy": "Your body's vigilant security patrol defending against microbial infections."
    },
    "wbc": {
        "standard_name": "Total White Blood Cells (WBC)",
        "explanation": "White blood cells that defend your body from microbial infections and inflammatory triggers.",
        "analogy": "Your immune system's rapid response team."
    },
    "platelet": {
        "standard_name": "Platelet Count",
        "explanation": "Cellular fragments essential for blood clotting and sealing breaks in blood vessel walls.",
        "analogy": "An emergency patch kit that rapidly seals cuts and scrapes to prevent bleeding."
    },
    "packed cell volume": {
        "standard_name": "Packed Cell Volume (PCV / Hematocrit)",
        "explanation": "The proportion of whole blood volume occupied by red blood cells.",
        "analogy": "The percentage of concentrated fruit pulp compared to liquid in a bottle of juice."
    },
    "pcv": {
        "standard_name": "Packed Cell Volume (PCV / Hematocrit)",
        "explanation": "The percentage of your blood made up of oxygen-carrying red blood cells.",
        "analogy": "The density of oxygen-carrying cells in your bloodstream."
    },
    "mean corpuscular vol": {
        "standard_name": "Mean Corpuscular Volume (MCV)",
        "explanation": "The average physical size and volume of an individual red blood cell.",
        "analogy": "Sizing fruit: whether your red blood cells are normal-sized oranges or smaller tangerines."
    },
    "mcv": {
        "standard_name": "Mean Corpuscular Volume (MCV)",
        "explanation": "The average size of your red blood cells.",
        "analogy": "The physical dimension of the delivery vehicles."
    },
    "mch": {
        "standard_name": "Mean Corpuscular Hemoglobin (MCH)",
        "explanation": "The average amount of hemoglobin packed inside each single red blood cell.",
        "analogy": "The weight of cargo loaded onto each delivery vehicle."
    },
    "mchc": {
        "standard_name": "MCHC",
        "explanation": "The average concentration of hemoglobin packed inside a given volume of red blood cells.",
        "analogy": "How densely packed the oxygen cargo is inside the cells."
    },
    "red blood cell": {
        "standard_name": "Red Blood Cell Count (RBC)",
        "explanation": "The total count of circulating red blood cells carrying oxygen throughout your cardiovascular system.",
        "analogy": "The total fleet of oxygen-carrying vehicles active on the road."
    },
    "rbc": {
        "standard_name": "Red Blood Cell Count (RBC)",
        "explanation": "The total count of oxygen-carrying cells in your bloodstream.",
        "analogy": "The operational fleet of transport vehicles."
    },
    "neutrophil": {
        "standard_name": "Neutrophils",
        "explanation": "The primary white blood cell subtype specialized in attacking bacterial infections.",
        "analogy": "The frontline responders of your immune department."
    },
    "lymphocyte": {
        "standard_name": "Lymphocytes",
        "explanation": "White blood cells (T cells and B cells) responsible for viral defense and antibodies.",
        "analogy": "The specialized detectives that remember past infections and produce antibodies."
    },
    "cholesterol": {
        "standard_name": "Total Cholesterol",
        "explanation": "The total amount of waxy fatty substances circulating in your bloodstream.",
        "analogy": "Total vehicular traffic flow on an arterial roadway."
    },
    "triglyceride": {
        "standard_name": "Triglycerides",
        "explanation": "A type of fat stored in your blood from unburned calories and refined dietary carbohydrates.",
        "analogy": "Surplus fuel stored away in backup tanks."
    },
    "hdl": {
        "standard_name": "HDL Cholesterol (Good)",
        "explanation": "High-density lipoprotein that clears excess cholesterol from artery walls and returns it to the liver.",
        "analogy": "Street sweepers that clean excess debris off the vascular highways."
    },
    "ldl": {
        "standard_name": "LDL Cholesterol (Bad)",
        "explanation": "Low-density lipoprotein that transports cholesterol to tissues, which can accumulate in arterial walls if elevated.",
        "analogy": "Plumbing pipes that can slowly gather mineral scale if levels stay high."
    },
    "glucose": {
        "standard_name": "Blood Glucose (Sugar)",
        "explanation": "The primary fuel molecule transported in blood to provide energy to muscles and brain cells.",
        "analogy": "The electric voltage level powering your household appliances."
    },
    "creatinine": {
        "standard_name": "Serum Creatinine",
        "explanation": "A natural muscle metabolism byproduct filtered out of your blood by healthy kidneys.",
        "analogy": "Exhaust filtered through a clean engine filter. Low levels mean filters are working well."
    },
    "egfr": {
        "standard_name": "Estimated GFR (Kidney Filtration)",
        "explanation": "A calculated indicator of kidney filtration efficiency per minute.",
        "analogy": "The flow rate of water passing through a household filtration unit."
    },
    "tsh": {
        "standard_name": "Thyroid Stimulating Hormone (TSH)",
        "explanation": "A master pituitary hormone that directs your thyroid gland on how much metabolism-regulating hormone to produce.",
        "analogy": "The central thermostat calling for the furnace to turn on or off."
    }
}

def parse_extracted_clinical_findings(text: str) -> List[Dict[str, Any]]:
    """
    Parses ONLY clinical parameters that actually appear in the extracted text.
    STRICT RULE: Never invent missing report values or reference ranges.
    """
    findings = []
    seen_names = set()

    for line in text.splitlines():
        line_clean = line.strip()
        if not line_clean or len(line_clean) < 4:
            continue
        line_lower = line_clean.lower()

        # Check if line matches any known clinical test marker
        matched_marker = None
        for key, info in CLINICAL_GLOSSARY.items():
            pattern = r'\b' + re.escape(key) + r'\b'
            if re.search(pattern, line_lower):
                matched_marker = (key, info)
                break

        if not matched_marker:
            continue

        key, info = matched_marker
        standard_name = info["standard_name"]
        if standard_name in seen_names:
            continue

        # Extract numerical or qualitative values strictly from THIS line
        # Look for numbers (including decimals and commas)
        number_matches = re.findall(r'\b\d+(?:[\.,]\d+)?\b', line_clean)
        if not number_matches:
            # If no number found on line, do not invent a value!
            continue

        extracted_value = number_matches[0]

        # Extract Unit if present in the text
        unit_match = re.search(r'\b(g/dL|mg/dL|/cumm|mil/cumm|%|fL|pg|uIU/mL|mL/min|U/L|mmol/L|umol/L)\b', line_clean, re.IGNORECASE)
        unit = unit_match.group(1) if unit_match else ""

        # Extract Reference Range if present in the text (e.g. 13.0 - 17.0 or < 200 or > 50)
        range_match = re.search(r'([<>]?\s*\d+(?:\.\d+)?\s*(?:-\s*\d+(?:\.\d+)?)?)', line_clean[line_clean.find(extracted_value) + len(extracted_value):])
        ref_range = ""
        if range_match:
            candidate_range = range_match.group(1).strip()
            # Must look like an interval or inequality
            if "-" in candidate_range or "<" in candidate_range or ">" in candidate_range:
                ref_range = candidate_range

        if not ref_range:
            ref_range = "Not specified on report"

        # Determine Status strictly based on text markers or range
        status = "Normal"
        if re.search(r'\b(low|\[low\]|\*l\*|\bl\b)\b', line_lower):
            status = "Low"
        elif re.search(r'\b(high|\[high\]|\*h\*|\bh\b)\b', line_lower):
            status = "High"
        elif "borderline" in line_lower:
            status = "Borderline"
        else:
            # Try to compare value with numerical range if present
            if "-" in ref_range:
                try:
                    parts = ref_range.split("-")
                    low_val = float(parts[0].strip().replace(",", ""))
                    high_val = float(parts[1].strip().replace(",", ""))
                    curr_val = float(extracted_value.replace(",", ""))
                    if curr_val < low_val:
                        status = "Low"
                    elif curr_val > high_val:
                        status = "High"
                except Exception:
                    pass
            elif "<" in ref_range:
                try:
                    threshold = float(ref_range.replace("<", "").strip().replace(",", ""))
                    curr_val = float(extracted_value.replace(",", ""))
                    if curr_val > threshold:
                        status = "High"
                except Exception:
                    pass
            elif ">" in ref_range:
                try:
                    threshold = float(ref_range.replace(">", "").strip().replace(",", ""))
                    curr_val = float(extracted_value.replace(",", ""))
                    if curr_val < threshold:
                        status = "Low"
                except Exception:
                    pass

        seen_names.add(standard_name)
        findings.append({
            "test_name": standard_name,
            "value": extracted_value,
            "unit": unit,
            "reference_range": ref_range,
            "status": status,
            "plain_explanation": info["explanation"],
            "analogy": info.get("analogy")
        })

    return findings
