import os
import re
import json
import logging
from typing import Dict, Any, List, Optional
from google import genai
from google.genai import types
from app.config import settings

logger = logging.getLogger(__name__)

REPORT_CHAT_SYSTEM_PROMPT = """
You are ReportSaathi's dedicated report-specific educational companion (रिपोर्ट साथी).
You are having a conversation with a patient or family member about ONE specific laboratory report that has been uploaded and analyzed.

MANDATORY RULES & GUARDRAILS:
1. STRICT REPORT SCOPE:
   - Answer questions ONLY using the extracted information from the current report provided in the context (test names, extracted values, units, reference ranges, status, and summary).
   - If a question asks about a lab test, organ function, diagnosis, medical history, or parameter NOT present in this specific report, you MUST explicitly state that the information is unavailable in this report and recommend asking their healthcare professional.
   - Example if asking about Thyroid when only CBC was uploaded: "This Complete Blood Count report does not include thyroid tests (such as TSH, T3, or T4). Because this information is unavailable in your report, please consult your doctor to request thyroid testing if you have concerns."
2. NO DIAGNOSES & NO TREATMENT RECOMMENDATIONS:
   - NEVER diagnose any condition (do NOT say "You have anemia", "You have infection", "You have high cholesterol disease").
   - NEVER prescribe or recommend medications, dosages, or altering prescribed treatments (e.g., do NOT recommend iron supplements, statins, or stopping any medication).
   - Instead, explain what the numbers mean physiologically and suggest constructive discussion points to explore with their doctor: "In general laboratory science, hemoglobin measures... Your doctor will interpret this in light of your symptoms and clinical history."
3. NO INVENTING OR HALLUCINATING DATA:
   - If reference intervals or units were not on the original report, explicitly state that they were missing on the uploaded lab sheet. Never guess what lab's normal range might be.
4. TONE:
   - Compassionate, objective, clear, and reassuring in plain everyday language.
5. MANDATORY DISCLAIMER:
   - Keep answers focused, and always remind the user that ReportSaathi provides educational explanations only and does not replace professional medical judgment.
"""

def generate_deterministic_chat_response(
    report_data: Dict[str, Any],
    question: str
) -> Dict[str, Any]:
    """
    Offline/deterministic fallback question answerer strictly grounded in the report data.
    """
    q_lower = question.lower().strip()
    summary = report_data.get("summary", {})
    report_title = summary.get("report_title") or report_data.get("title") or "Laboratory Report"
    findings = report_data.get("findings") or report_data.get("structured_data") or []
    doctor_questions = summary.get("questions_for_doctor") or report_data.get("doctorQuestions") or []

    # 1. Greetings / General "What is this report?"
    if any(k in q_lower for k in ["what is this report", "overview", "summarize", "summary", "explain report", "hello", "hi"]):
        overview = summary.get("overall_summary") or summary.get("overall_overview") or report_data.get("overallSummary") or ""
        total = len(findings)
        flagged = sum(1 for f in findings if (f.get("status") or "").lower() not in ["normal", "unspecified"])
        text = (
            f"This is your **{report_title}**. {overview}\n\n"
            f"• **Parameters analyzed:** {total}\n"
            f"• **Flagged outside standard reference intervals:** {flagged}\n\n"
            "Would you like me to explain any specific test parameter (e.g. Hemoglobin, Platelets, Cholesterol)?"
        )
        return {
            "reply": text,
            "grounded_in_report": True,
            "disclaimer": "ReportSaathi is an educational tool. Always consult a qualified physician for clinical evaluation."
        }

    # 2. Doctor questions inquiry
    if any(k in q_lower for k in ["what should i ask", "questions for doctor", "ask my doctor", "physician"]):
        if doctor_questions:
            q_list = "\n".join([f"{idx+1}. {q}" for idx, q in enumerate(doctor_questions)])
            text = (
                f"Here are constructive questions tailored to your {report_title} to discuss at your appointment:\n\n{q_list}\n\n"
                "Your doctor will be happy to review these in context with how you are feeling."
            )
        else:
            text = (
                f"When discussing your {report_title} with your doctor, you might ask:\n"
                "1. What do these test values indicate for my overall health?\n"
                "2. Do any of the numbers outside typical ranges require follow-up or lifestyle adjustments?"
            )
        return {
            "reply": text,
            "grounded_in_report": True,
            "disclaimer": "ReportSaathi provides educational guidance, not medical diagnoses or treatment recommendations."
        }

    # 3. Check if matching any specific test in findings
    matched_finding = None
    for f in findings:
        name = (f.get("test_name") or f.get("testName") or "").lower()
        # Look for partial matches (e.g., 'hemoglobin', 'platelet', 'wbc', 'cholesterol', 'hdl', 'ldl', 'glucose')
        words = [w for w in name.replace("(", " ").replace(")", " ").replace("/", " ").split() if len(w) > 2]
        if any(w in q_lower for w in words) or (name and name in q_lower):
            matched_finding = f
            break

    if matched_finding:
        t_name = matched_finding.get("test_name") or matched_finding.get("testName")
        val = matched_finding.get("extracted_value") or matched_finding.get("value")
        unit = matched_finding.get("unit") or ""
        ref = matched_finding.get("reference_range") or matched_finding.get("referenceRange") or "Not specified on report"
        status = matched_finding.get("status") or "Observed"
        explanation = matched_finding.get("simple_explanation") or matched_finding.get("plainExplanation") or ""
        source_fact = matched_finding.get("source_extracted_fact") or f"{t_name}: {val} {unit}"
        missing_note = matched_finding.get("missing_or_unclear_note")

        lines = [
            f"### **{t_name}** in your report:",
            f"• **Extracted Value:** {val} {unit}".strip(),
            f"• **Report Reference Interval:** {ref} {unit}".strip(),
            f"• **Observed Status:** {status}",
            f"• **Source Document Fact:** \"{source_fact}\"",
            "",
            f"**Educational Explanation:** {explanation}"
        ]
        if missing_note:
            lines.append(f"• *Note on clarity:* {missing_note}")
        lines.append("\n*Please discuss this parameter with your doctor to determine what it means for your specific medical situation.*")

        return {
            "reply": "\n".join(lines),
            "grounded_in_report": True,
            "disclaimer": "ReportSaathi is for educational purposes only. It does not provide medical diagnoses or treatment plans."
        }

    # 4. Out of report scope fallback (Strict rule: state information is unavailable in this report)
    return {
        "reply": (
            f"This information is **unavailable** in your currently selected {report_title}. "
            "ReportSaathi can only answer questions about the specific test parameters and values present in this document. "
            "Because this test or clinical topic was not part of this laboratory panel, please consult a qualified healthcare professional or doctor for guidance."
        ),
        "grounded_in_report": False,
        "disclaimer": "ReportSaathi provides educational information only and does not diagnose conditions or prescribe treatment."
    }

def ask_report_chat(
    report_data: Dict[str, Any],
    question: str,
    chat_history: Optional[List[Dict[str, str]]] = None
) -> Dict[str, Any]:
    """
    Answers user questions strictly grounded in the currently selected report.
    Uses Gemini when configured, or the deterministic grounded engine as fallback.
    """
    api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")

    if not api_key or api_key.strip() in ("", "your_gemini_api_key_here", "test"):
        return generate_deterministic_chat_response(report_data, question)

    try:
        client = genai.Client(api_key=api_key.strip())

        # Construct context strictly from this report
        summary = report_data.get("summary", {})
        findings = report_data.get("findings") or report_data.get("structured_data") or []
        report_title = summary.get("report_title") or report_data.get("title") or "Laboratory Report"
        patient_context = summary.get("patient_context") or report_data.get("patientContext") or "Not specified"
        overall = summary.get("overall_summary") or summary.get("overall_overview") or report_data.get("overallSummary") or ""
        doctor_questions = summary.get("questions_for_doctor") or report_data.get("doctorQuestions") or []

        findings_lines = []
        for idx, f in enumerate(findings):
            t_name = f.get("test_name") or f.get("testName")
            val = f.get("extracted_value") or f.get("value")
            unit = f.get("unit") or ""
            ref = f.get("reference_range") or f.get("referenceRange") or "Not specified on report"
            st = f.get("status") or "Normal"
            expl = f.get("simple_explanation") or f.get("plainExplanation") or ""
            findings_lines.append(f"{idx+1}. {t_name}: {val} {unit} | Range: {ref} | Status: {st} | Context: {expl}")

        findings_block = "\n".join(findings_lines) if findings_lines else "No test parameters identified."
        questions_block = "\n".join([f"- {q}" for q in doctor_questions])

        context_prompt = f"""
{REPORT_CHAT_SYSTEM_PROMPT}

CURRENT REPORT CONTEXT:
Report Title: {report_title}
Patient Context: {patient_context}
Overall Summary: {overall}
Identified Findings:
{findings_block}

Questions for Doctor:
{questions_block}

USER QUESTION:
"{question}"

INSTRUCTIONS FOR YOUR ANSWER:
- If the question is about any test, value, or topic present above, provide a clear, supportive, educational explanation.
- If the question is about ANY medical condition, test, organ, or medication NOT mentioned in the context above, explicitly state: "This information is unavailable in this report. Because this test or topic is not in your uploaded {report_title}, please consult a qualified healthcare professional."
- DO NOT DIAGNOSE ("You have ...").
- DO NOT PRESCRIBE OR SUGGEST TREATMENTS OR MEDICATIONS.
- End with a short reminder to consult a healthcare professional.
"""

        models_to_try = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-2.0-flash"]
        reply_text = None
        last_err = None

        for m in models_to_try:
            try:
                res = client.models.generate_content(
                    model=m,
                    contents=context_prompt,
                    config=types.GenerateContentConfig(
                        temperature=0.2  # Low temperature for factual precision
                    )
                )
                if res and res.text:
                    reply_text = res.text.strip()
                    break
            except Exception as e:
                last_err = e
                continue

        if not reply_text:
            raise RuntimeError(f"All Gemini chat models failed: {last_err}")

        # Basic check to determine if the reply signaled unavailable info
        unavailable = "unavailable in this report" in reply_text.lower() or "not included in this report" in reply_text.lower()

        return {
            "reply": reply_text,
            "grounded_in_report": not unavailable,
            "disclaimer": "ReportSaathi is an educational companion. It does not provide medical diagnoses or treatment recommendations. Always consult a healthcare professional."
        }

    except Exception as e:
        logger.warning(f"Gemini chat failed, falling back to deterministic response: {e}")
        fallback = generate_deterministic_chat_response(report_data, question)
        return fallback
