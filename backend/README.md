# ReportSaathi Backend

FastAPI backend for medical laboratory report extraction and educational explanation using Google Gemini API and Tesseract OCR.

---

## Prerequisites
* Python 3.11+
* Tesseract OCR installed on the system (e.g. `C:\Program Files\Tesseract-OCR\tesseract.exe` on Windows or `brew install tesseract` / `apt install tesseract-ocr`)

---

## Setup Instructions

### 1. Create and Activate Virtual Environment
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### 2. Install Dependencies
```powershell
pip install -r requirements.txt
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```env
PORT=8000
HOST=0.0.0.0
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Server-side Gemini API key (Get from https://aistudio.google.com/)
# NEVER expose this key in frontend code
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Tesseract binary path if not in system PATH
# TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe
```

### 4. Run the Server
```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## API Endpoints

### `GET /api/health`
Health check reporting OCR status, supported formats, and server state.

### `POST /api/reports/analyze`
* **Content-Type:** `multipart/form-data`
* **Parameter:** `file` (PDF, JPG, or PNG up to 10MB)
* **Returns:** Structured JSON with:
  * `extracted_text`: Raw extracted text
  * `structured_data`: Extracted test metrics, values, units, reference ranges (only if present in report), status, simple educational explanations, and explicit missing/unclear notes.
  * `summary`: Overview of findings, doctor questions, and mandatory educational disclaimer.
