from typing import List, Optional
from pydantic import BaseModel, Field

class TestFinding(BaseModel):
    test_name: str = Field(description="Name of the specific medical test as identified on the report")
    extracted_value: str = Field(description="Exact value extracted directly from the report text")
    unit: Optional[str] = Field(default="", description="Measurement unit (ONLY if present in the report, never invented)")
    reference_range: Optional[str] = Field(default="Not specified on report", description="Reference interval (ONLY if present in the report, never invented)")
    status: str = Field(default="Normal", description="Status relative to range: Normal, High, Low, Borderline, or Unspecified")
    simple_explanation: str = Field(description="Clear, non-jargon educational explanation of what this test represents")
    source_extracted_fact: str = Field(description="Verbatim text extracted from the report to clearly separate fact from AI explanation")
    missing_or_unclear_note: Optional[str] = Field(
        default=None,
        description="Explicit note when unit, reference range, or test name is missing, truncated, or ambiguous"
    )

class ReportSummary(BaseModel):
    report_title: str = Field(default="Clinical Laboratory Report", description="Identified report or panel name")
    patient_context: Optional[str] = Field(default=None, description="Patient age, gender, or clinical context if explicitly stated")
    overall_summary: str = Field(description="Empathetic, compassionate educational synthesis of findings without diagnostic claims")
    is_clarity_sufficient: bool = Field(default=True, description="False if the report text is degraded, truncated, or ambiguous")
    unclear_advisory: Optional[str] = Field(
        default=None,
        description="Advisory to consult a qualified clinician if any part of the report is unclear"
    )
    questions_for_doctor: List[str] = Field(default_factory=list, description="Constructive, actionable questions to ask their doctor")
    educational_disclaimer: str = Field(
        default="ReportSaathi is an educational reference tool. It does not provide medical diagnoses, treatment plans, or clinical certainty. Always consult a qualified medical clinician.",
        description="Mandatory educational disclaimer"
    )

class ReportAnalysisResponse(BaseModel):
    success: bool = True
    status: str = "completed"
    filename: Optional[str] = None
    extracted_text: str = ""
    summary: ReportSummary
    findings: List[TestFinding]
    structured_data: List[TestFinding] = Field(default_factory=list)
    is_mock_demo: bool = False
    model_used: Optional[str] = None
    warnings: List[str] = Field(default_factory=list)
