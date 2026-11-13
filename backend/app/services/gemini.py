import os
import re
import json
import logging
from typing import Dict, Any, List, Optional
from google import genai
from google.genai import types
from app.config import settings
from app.schemas.report import ReportAnalysisResponse, ReportSummary, TestFinding

logger = logging.getLogger(__name__)

GEMINI_SYSTEM_INSTRUCTION = """
You are ReportSaathi (रिपोर्ट साथी), an empathetic medical laboratory educator.
Your mission is to explain medical laboratory reports in simple, compassionate language for educational purposes.

MANDATORY RULES:
1. DO NOT DIAGNOSE, PRESCRIBE TREATMENT, OR CLAIM CERTAINTY:
   - You are an educational reference tool, NOT a diagnostic doctor.
   - Never say "You have anemia" or "You have diabetes". Instead say: "These numbers may indicate...", "Often associated with...", "Your doctor will evaluate...".
2. DO NOT INVENT VALUES, UNITS, OR REFERENCE RANGES:
   - Extract only what is written in the report text.
   - If a reference range is NOT present on the report, set reference_range to "Not specified in report" and explain in missing_or_unclear_note.
   - If a unit is NOT present on the report, set unit to "" and note in missing_or_unclear_note.
   - Never guess or import standard reference ranges if they were not printed on this patient's report sheet.
3. CLEARLY DISTINGUISH SOURCE FACTS FROM AI EXPLANATIONS:
   - In source_extracted_fact, provide the exact line or text snippet from the report.
   - In simple_explanation, provide your easy-to-understand educational explanation of what that metric means in human physiology, using everyday analogies.
4. UNREADABLE / AMBIGUOUS REPORTS:
   - If any text is blurry, truncated, or unclear, explain this in missing_or_unclear_note or unclear_advisory and explicitly ask the user to consult a qualified clinician.
5. EDUCATIONAL DISCLAIMER:
   - Always include the mandatory educational disclaimer.

Return ONLY a valid JSON object matching the requested schema. No markdown formatting outside the JSON.
"""

def clean_json_text(text: str) -> str:
    """Strips markdown code fences (```json ... ```) and leading/trailing whitespace."""
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    return cleaned.strip()

# Local educational glossary for safe offline parsing when API key is not supplied
EDUCATIONAL_GLOSSARY = {
    "hemoglobin": {
        "name": "Hemoglobin (Hb)",
        "explanation": "Hemoglobin is an iron-containing protein inside red blood cells that picks up oxygen in your lungs and delivers it to organs and muscles.",
        "analogy": "Think of hemoglobin as the delivery trucks that transport oxygen throughout your body."
    },
    "leucocyte": {
        "name": "Total Leucocyte Count (WBC)",
        "explanation": "White blood cells are your immune system defenders that protect you from bacterial infections, viruses, and inflammation.",
        "analogy": "Your body's security guards on patrol against illness."
    },
    "wbc": {
        "name": "Total White Blood Cells (WBC)",
        "explanation": "White blood cells defend against microbial infections and inflammation.",
        "analogy": "Your immune first-responders."
    },
    "platelet": {
        "name": "Platelet Count",
        "explanation": "Platelets are microscopic cell fragments that cluster together to form blood clots and stop bleeding when you have a wound.",
        "analogy": "An emergency patch kit that seals leaks in your blood vessels."
    },
    "packed cell volume": {
        "name": "Packed Cell Volume (PCV / Hematocrit)",
        "explanation": "The percentage of your total blood volume made up of oxygen-carrying red blood cells.",
        "analogy": "The density of fruit pulp in a glass of natural juice."
    },
    "mean corpuscular vol": {
        "name": "Mean Corpuscular Volume (MCV)",
        "explanation": "The average microscopic size and volume of an individual red blood cell.",
        "analogy": "Fruit sizing: whether your red cells are normal oranges or smaller tangerines."
    },
    "mch": {
        "name": "Mean Corpuscular Hemoglobin (MCH)",
        "explanation": "The average amount of hemoglobin packed inside each single red blood cell.",
        "analogy": "How much cargo each individual delivery truck is holding."
    },
    "mchc": {
        "name": "MCHC",
        "explanation": "The average concentration of hemoglobin packed inside a given volume of red blood cells.",
        "analogy": "How densely packed the cargo is inside the truck."
    },
    "red blood cell": {
        "name": "Red Blood Cell Count (RBC)",
        "explanation": "The total number of circulating red blood cells carrying oxygen throughout your body.",
        "analogy": "The total fleet of operational delivery vehicles."
    },
    "cholesterol": {
        "name": "Total Cholesterol",
        "explanation": "The total amount of fats and lipids circulating in your blood.",
        "analogy": "The total volume of traffic traveling along the arterial highways."
    },
    "triglyceride": {
        "name": "Triglycerides",
        "explanation": "A type of fat in your blood formed from excess calories and simple carbohydrates.",
        "analogy": "Surplus fuel stored away in backup tanks for future energy."
    },
    "hdl": {
        "name": "HDL Cholesterol (Good)",
        "explanation": "High-Density Lipoprotein sweeps away excess cholesterol from arteries back to the liver for clearance.",
        "analogy": "Street sweepers that keep arterial roads clean."
    },
    "ldl": {
        "name": "LDL Cholesterol (Bad)",
        "explanation": "Low-Density Lipoprotein that can deposit along artery walls if elevated over time.",
        "analogy": "Plumbing pipes that can collect mineral buildup if levels stay high."
    },
    "glucose": {
        "name": "Blood Glucose (Sugar)",
        "explanation": "The main sugar in your blood that serves as the immediate energy source for cells.",
        "analogy": "The electrical voltage currently powering your body's systems."
    },
    "creatinine": {
        "name": "Serum Creatinine",
        "explanation": "A normal muscle waste byproduct filtered out of your blood by functioning kidneys.",
        "analogy": "Exhaust smoke filtered out through a clean car filter."
    }
}

def generate_deterministic_analysis(extracted_text: str, filename: Optional[str] = None) -> ReportAnalysisResponse:
    """
    Safe, deterministic clinical parsing engine that enforces all strict rules:
    - Never invents reference ranges or units
    - Clearly separates source facts from explanations
    - Adds notes for missing/unclear info
    """
    findings: List[TestFinding] = []
    seen = set()
    text_lower = extracted_text.lower()
    has_unclear_markers = False

    for line in extracted_text.splitlines():
        line_clean = line.strip()
        if not line_clean or len(line_clean) < 4:
            continue
        line_lower = line_clean.lower()

        matched = None
        for key, info in EDUCATIONAL_GLOSSARY.items():
            pattern = r'\b' + re.escape(key) + r'\b'
            if re.search(pattern, line_lower):
                matched = (key, info)
                break

        if not matched:
            continue

        key, info = matched
        std_name = info["name"]
        if std_name in seen:
            continue

        # Extract number strictly from this line
        nums = re.findall(r'\b\d+(?:[\.,]\d+)?\b', line_clean)
        if not nums:
            continue

        extracted_val = nums[0]

        # Extract Unit ONLY if present on line
        unit_match = re.search(r'\b(g/dL|mg/dL|/cumm|mil/cumm|%|fL|pg|uIU/mL|mL/min|U/L)\b', line_clean, re.IGNORECASE)
        unit = unit_match.group(1) if unit_match else ""

        # Extract Reference Range ONLY if present on line
        ref_match = re.search(r'([<>]?\s*\d+(?:\.\d+)?\s*(?:-\s*\d+(?:\.\d+)?)?)', line_clean[line_clean.find(extracted_val) + len(extracted_val):])
        ref_range = "Not specified on report"
        if ref_match:
            candidate = ref_match.group(1).strip()
            if "-" in candidate or "<" in candidate or ">" in candidate:
                ref_range = candidate

        # Determine status strictly based on report text or range
        status = "Normal"
        if re.search(r'\b(low|\[low\]|\*l\*)\b', line_lower):
            status = "Low"
        elif re.search(r'\b(high|\[high\]|\*h\*)\b', line_lower):
            status = "High"
        elif "borderline" in line_lower:
            status = "Borderline"
        elif "-" in ref_range and ref_range != "Not specified on report":
            try:
                parts = ref_range.split("-")
                l = float(parts[0].strip().replace(",", ""))
                h = float(parts[1].strip().replace(",", ""))
                c = float(extracted_val.replace(",", ""))
                if c < l:
                    status = "Low"
                elif c > h:
                    status = "High"
            except Exception:
                status = "Unspecified"
        elif ref_range == "Not specified on report":
            status = "Unspecified"

        # Note when information is missing or unclear
        missing_notes = []
        if not unit:
            missing_notes.append("Measurement unit was not printed on this report line.")
        if ref_range == "Not specified on report":
            missing_notes.append("No laboratory reference interval was specified on the report sheet for this test.")

        missing_or_unclear_note = " • ".join(missing_notes) if missing_notes else None
        if missing_or_unclear_note:
            has_unclear_markers = True

        seen.add(std_name)
        findings.append(TestFinding(
            test_name=std_name,
            extracted_value=extracted_val,
            unit=unit,
            reference_range=ref_range,
            status=status,
            simple_explanation=f"{info['explanation']} {info.get('analogy', '')}".strip(),
            source_extracted_fact=line_clean,
            missing_or_unclear_note=missing_or_unclear_note
        ))

    # Detect title
    title = "Clinical Laboratory Report"
    if "lipid" in text_lower or "cholesterol" in text_lower:
        title = "Fasting Lipid & Cholesterol Profile"
    elif "blood count" in text_lower or "cbc" in text_lower or "hemoglobin" in text_lower:
        title = "Complete Blood Count (CBC) Panel"
    elif "metabolic" in text_lower or "glucose" in text_lower:
        title = "Comprehensive Metabolic Panel (CMP)"

    flagged = sum(1 for f in findings if f.status in ("High", "Low", "Borderline"))

    if flagged > 0:
        summary_text = (
            f"Your {title} shows {len(findings)} identified parameter(s), with {flagged} value(s) "
            "outside standard reference intervals. Please remember that slight variations are common "
            "and can be influenced by diet, hydration, or timing. Your doctor will interpret these within your complete clinical context."
        )
    else:
        summary_text = (
            f"Your {title} shows {len(findings)} identified parameter(s), all within typical laboratory reference intervals. "
            "Continue your healthy routine and review these findings with your clinician at your next checkup."
        )

    unclear_advisory = None
    if has_unclear_markers or len(findings) == 0:
        unclear_advisory = (
            "Some reference intervals, units, or text regions in this report were missing, truncated, or unclear. "
            "Please consult a qualified clinician or request an official printout from your laboratory."
        )

    summary = ReportSummary(
        report_title=title,
        patient_context="Laboratory Examination",
        overall_summary=summary_text,
        is_clarity_sufficient=not has_unclear_markers and len(findings) > 0,
        unclear_advisory=unclear_advisory,
        questions_for_doctor=[
            "What do these specific test values indicate for my overall health?",
            "Do any of the flagged values warrant repeat testing or lifestyle modifications?",
            "Are there any additional tests (like an iron or lipid panel) you recommend?"
        ]
    )

    return ReportAnalysisResponse(
        success=True,
        status="completed_deterministic_engine",
        filename=filename,
        extracted_text=extracted_text,
        summary=summary,
        findings=findings,
        structured_data=findings,
        is_mock_demo=True,
        model_used="local_rule_engine",
        warnings=["Processed via local rule engine (GEMINI_API_KEY not configured or offline)."]
    )

def analyze_report_with_gemini(extracted_text: str, filename: Optional[str] = None) -> ReportAnalysisResponse:
    """
    Sends extracted report text to Google Gemini API and validates structured output.
    Follows all clinical safety rules:
    - Never invents reference ranges, units, or values
    - Clearly distinguishes source facts from AI explanations
    - Advises clinician consultation if report is unclear
    - Falls back safely if API key is not supplied or model call fails
    """
    api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")

    if not api_key or api_key.strip() in ("", "your_gemini_api_key_here", "test"):
        logger.info("GEMINI_API_KEY not configured in backend environment. Using validated deterministic engine.")
        return generate_deterministic_analysis(extracted_text, filename)

    try:
        client = genai.Client(api_key=api_key.strip())

        prompt = f"""
{GEMINI_SYSTEM_INSTRUCTION}

Below is the raw extracted text from a patient's medical laboratory report:
----------------------------------------
{extracted_text}
----------------------------------------

Analyze the text and return a JSON object with this EXACT structure:
{{
  "summary": {{
    "report_title": "Identified name of test panel (e.g., Complete Blood Count, Fasting Lipid Profile)",
    "patient_context": "Age, gender, fasting status, or clinical context if mentioned, otherwise null",
    "overall_summary": "Compassionate, plain-language 2-3 sentence overview of findings without making diagnostic claims",
    "is_clarity_sufficient": true or false,
    "unclear_advisory": "If any text is degraded, truncated, or reference ranges are missing, say so here and ask the user to consult a qualified clinician. Otherwise null",
    "questions_for_doctor": [
      "Constructive question 1 for physician",
      "Constructive question 2 for physician"
    ],
    "educational_disclaimer": "ReportSaathi is an educational reference tool. It does not provide medical diagnoses, treatment plans, or clinical certainty. Always consult a qualified medical clinician."
  }},
  "findings": [
    {{
      "test_name": "Test name strictly from report",
      "extracted_value": "Value strictly from report (e.g., 11.4)",
      "unit": "Unit strictly from report or empty string if not printed",
      "reference_range": "Reference range strictly from report or 'Not specified on report' if missing",
      "status": "Normal, High, Low, Borderline, or Unspecified",
      "simple_explanation": "Clear educational explanation of what this test measures in everyday language",
      "source_extracted_fact": "Verbatim line or snippet from report where this test and value were found",
      "missing_or_unclear_note": "A note if unit or reference range was missing or text was blurry, otherwise null"
    }}
  ]
}}
"""

        # Try gemini-2.5-flash first, falling back to gemini-1.5-flash
        models_to_try = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-2.0-flash"]
        response_text = None
        used_model = None
        last_error = None

        for model_name in models_to_try:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        temperature=0.1,  # Low temperature for factual fidelity
                        response_mime_type="application/json"
                    )
                )
                if response and response.text:
                    response_text = response.text
                    used_model = model_name
                    break
            except Exception as e:
                last_error = e
                logger.warning(f"Gemini model {model_name} invocation error: {e}. Trying fallback...")
                continue

        if not response_text:
            raise RuntimeError(f"All Gemini models failed: {last_error}")

        cleaned_json = clean_json_text(response_text)
        data = json.loads(cleaned_json)

        # Validate with Pydantic
        summary_raw = data.get("summary", {})
        findings_raw = data.get("findings", [])

        summary = ReportSummary(
            report_title=summary_raw.get("report_title", "Clinical Laboratory Report"),
            patient_context=summary_raw.get("patient_context"),
            overall_summary=summary_raw.get("overall_summary", "Laboratory analysis completed."),
            is_clarity_sufficient=summary_raw.get("is_clarity_sufficient", True),
            unclear_advisory=summary_raw.get("unclear_advisory"),
            questions_for_doctor=summary_raw.get("questions_for_doctor", []),
            educational_disclaimer=summary_raw.get("educational_disclaimer", "For educational purposes only.")
        )

        findings = []
        for f in findings_raw:
            ref = f.get("reference_range")
            if not ref or ref.strip() == "":
                ref = "Not specified on report"
            
            missing_note = f.get("missing_or_unclear_note")
            if ref == "Not specified on report" and not missing_note:
                missing_note = "Reference range was not specified on the uploaded report sheet."

            findings.append(TestFinding(
                test_name=f.get("test_name", "Unknown Test"),
                extracted_value=str(f.get("extracted_value", "")),
                unit=f.get("unit", "") or "",
                reference_range=ref,
                status=f.get("status", "Normal"),
                simple_explanation=f.get("simple_explanation", ""),
                source_extracted_fact=f.get("source_extracted_fact", f.get("test_name", "")),
                missing_or_unclear_note=missing_note
            ))

        return ReportAnalysisResponse(
            success=True,
            status="completed_gemini_ai",
            filename=filename,
            extracted_text=extracted_text,
            summary=summary,
            findings=findings,
            structured_data=findings,
            is_mock_demo=False,
            model_used=used_model
        )

    except Exception as e:
        logger.error(f"Gemini API processing failed: {e}. Falling back to safe deterministic engine.")
        fallback = generate_deterministic_analysis(extracted_text, filename)
        fallback.warnings.append(f"Gemini API invocation encountered an issue: {str(e)[:100]}. Fallback engine used.")
        return fallback
