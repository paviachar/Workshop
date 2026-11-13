import sys
import os

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.gemini import analyze_report_with_gemini
from app.schemas.report import ReportAnalysisResponse

def test_cbc_analysis():
    print("--- 1. Testing Complete Blood Count Analysis ---")
    cbc_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "sample_reports", "sample_cbc_report.txt"))
    with open(cbc_path, "r", encoding="utf-8") as f:
        text = f.read()
        
    analysis = analyze_report_with_gemini(text)
    print("Report Title:", analysis.summary.report_title)
    print("Findings Count:", len(analysis.findings))
    print("Is Demo/Fallback:", analysis.is_mock_demo)
    print("Key Highlights:", analysis.summary.key_highlights)
    print("Questions for Doctor:", analysis.summary.questions_for_doctor)
    
    # Check that findings include key tests
    test_names = [f.test_name for f in analysis.findings]
    print("Extracted Test Names:", test_names)
    
    assert any("Hemoglobin" in name for name in test_names), "Hemoglobin missing from findings"
    assert any("Platelet" in name for name in test_names), "Platelet missing from findings"
    assert len(analysis.summary.questions_for_doctor) >= 2, "Insufficient doctor questions"
    assert analysis.summary.educational_disclaimer != "", "Missing educational disclaimer"
    print("--> CBC Analysis Test PASSED!")

def test_lipid_analysis():
    print("\n--- 2. Testing Lipid Profile Analysis ---")
    lipid_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "sample_reports", "sample_lipid_panel.txt"))
    with open(lipid_path, "r", encoding="utf-8") as f:
        text = f.read()
        
    analysis = analyze_report_with_gemini(text)
    print("Report Title:", analysis.summary.report_title)
    print("Findings Count:", len(analysis.findings))
    
    test_names = [f.test_name for f in analysis.findings]
    print("Extracted Test Names:", test_names)
    
    assert any("Cholesterol" in name for name in test_names), "Cholesterol missing from findings"
    assert any("Triglycerides" in name for name in test_names), "Triglycerides missing from findings"
    print("--> Lipid Analysis Test PASSED!")

if __name__ == "__main__":
    test_cbc_analysis()
    test_lipid_analysis()
    print("\nALL GEMINI EXPLANATION TESTS PASSED SUCCESSFULLY!")
