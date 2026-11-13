# ReportSaathi (रिपोर्ट साथी)
> Explaining medical laboratory reports in simple, compassionate, and educational language.

ReportSaathi is an open educational application that takes medical laboratory reports (PDF or images such as CBC, Lipid Profile, Thyroid Function, LFT, KFT), extracts their structured contents via direct text extraction and Tesseract OCR, and leverages the Gemini API to explain tests and findings in easy-to-understand terms.

---

## Tech Stack
* **Frontend:** React 19, Vite 8, Tailwind CSS v4, Lucide Icons
* **Backend:** Python 3.12, FastAPI, Uvicorn, Pydantic
* **Extraction:** `pdfplumber`, `pypdf`, `pytesseract` (Tesseract v5.5)
* **AI Engine:** Google Gemini API (`google-genai`)
* **Persistence & Accounts:** Supabase (optional; supports Guest Mode out of the box)

---

## Project Structure
```text
WRK/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── services/
│   │   ├── schemas/
│   │   ├── config.py
│   │   └── main.py
│   ├── venv/
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── .env
└── sample_reports/
```

---

## Running Locally

### Backend
```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```
Swagger API documentation: `http://localhost:8000/docs`

### Frontend
```powershell
cd frontend
npm run dev
```
Frontend web application: `http://localhost:5173`

---

## Medical Disclaimer
*ReportSaathi is an educational reference tool. It does not provide medical diagnoses, treatment recommendations, or replace consultations with licensed healthcare professionals.*
