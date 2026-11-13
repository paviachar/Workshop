# ReportSaathi (रिपोर्ट साथी)
### Compassionate Medical Report Educator & Patient Literacy Companion

ReportSaathi is an open-source educational health literacy web application and Telegram bot. It translates confusing medical laboratory reports (Complete Blood Count, Lipid Panels, Metabolic Tests) into simple, everyday language while enforcing strict non-diagnostic safety guardrails.

---

## 🚀 Key Features

- **Multi-Engine Document Pipeline**: Handles digital PDFs, scanned PDFs, and high-resolution photos (JPG, PNG) using `pdfplumber`, `pypdfium2`, and `Tesseract OCR`.
- **Strict Clinical Non-Diagnostic Guardrails**:
  - Distinguishes verbatim source facts from educational AI explanations.
  - Never invents reference intervals or units if not printed on the physical sheet.
  - Never provides medical diagnoses or alters treatment/medication prescriptions.
- **Report-Specific Grounded Chat**:
  - In-app interactive chat assistant strictly restricted to the currently viewed report.
  - If a patient asks about a test or condition not present on their report (e.g. asking for Thyroid on a CBC panel), the system identifies the information as **unavailable** and directs them to their healthcare provider.
- **Supabase Cloud Sync & Privacy Control**:
  - Row Level Security (RLS) ensures signed-in users only access their own records.
  - Strict opt-in saving (unchecked by default).
  - Raw report files and unformatted OCR text are never stored in the database.
  - In-memory Guest/Demo mode runs with full utility if Supabase credentials are not configured.
- **Optional Telegram Bot**:
  - Direct laboratory report analysis over Telegram.
  - Enforces the same 10 MB limit and file validations.
  - Masks bot tokens and excludes sensitive medical content from logs.

---

## 🛠️ Local Development & Setup

### Prerequisites
- Python 3.10+ (Python 3.12 recommended)
- Node.js 18+ and npm
- [Tesseract OCR](https://github.com/UB-Mannheim/tesseract/wiki) (optional for scanned image OCR)

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env from template
cp .env.example .env
```

Start the FastAPI development server:
```bash
uvicorn app.main:app --reload --port 8000
```
API Documentation will be available at: `http://localhost:8000/docs`

### 2. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install packages
npm install

# Create .env from template
cp .env.example .env

# Run Vite dev server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🔑 Environment Variables Reference

> **Security Note:** Never commit `.env` files or real secret keys to source control.

### Backend (`backend/.env`)
| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `PORT` | Backend server port | `8000` |
| `HOST` | Backend bind host | `0.0.0.0` |
| `CORS_ORIGINS` | Permitted client origins (comma-separated) | `http://localhost:5173,http://localhost:3000` |
| `GEMINI_API_KEY` | Google Gemini API Key for explanations | `AIzaSy...` (Optional, local fallback used if blank) |
| `SUPABASE_URL` | Supabase Project URL | `https://xyzcompany.supabase.co` (Optional) |
| `SUPABASE_KEY` | Supabase Service Role or Anon Key | `eyJhbGci...` (Optional) |
| `TELEGRAM_BOT_TOKEN` | Telegram Bot API token from @BotFather | `123456789:ABCdefGhI...` (Optional) |
| `TESSERACT_CMD` | Custom path to Tesseract binary if not in PATH | `C:\Program Files\Tesseract-OCR\tesseract.exe` |

### Frontend (`frontend/.env`)
| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base URL of the FastAPI backend | `http://localhost:8000/api` |
| `VITE_SUPABASE_URL` | Supabase Project URL for client auth & sync | `https://xyzcompany.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase Anonymous Client Key | `eyJhbGci...` |

---

## 🧪 Testing Commands

### Backend Automated Test Suite
Run the comprehensive QA test suite (upload validation, extraction, Gemini fallbacks, report-grounded chat, and token protection):
```bash
backend\venv\Scripts\python backend/tests/test_qa_suite.py
```

Run specific test modules:
```bash
# Gemini parsing and dictionary fallback tests
backend\venv\Scripts\python backend/tests/test_gemini_analysis.py
```

### Frontend Build & Lint
```bash
# Build production bundle
npm run build --prefix frontend

# Run linter
npm run lint --prefix frontend
```

---

## 🚢 Production Deployment Guide

### A. Backend on Render (Web Service)
1. Fork or push the ReportSaathi repository to GitHub.
2. Log in to [Render](https://render.com) and click **New +** -> **Web Service**.
3. Select your repository and configure the settings:
   - **Environment**: `Python 3`
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add Environment Variables under the **Environment** tab:
   - `PORT`: `10000`
   - `CORS_ORIGINS`: `https://<your-cloudflare-pages-subdomain>.pages.dev`
   - `GEMINI_API_KEY`: `<your-gemini-api-key>`
   - `SUPABASE_URL`: `<your-supabase-url>`
   - `SUPABASE_KEY`: `<your-supabase-service-role-or-anon-key>`
   - `TELEGRAM_BOT_TOKEN`: `<your-telegram-bot-token>` (if running bot)
5. **Health Check Path**: Set to `/api/health`.
6. Click **Create Web Service**. Note your public URL (e.g., `https://reportsaathi-backend.onrender.com`).

### B. Frontend on Cloudflare Pages
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/) and navigate to **Workers & Pages** -> **Create application** -> **Pages**.
2. Connect your Git repository.
3. Configure the Build settings:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `frontend`
4. Configure Environment Variables under **Settings** -> **Environment variables**:
   - `VITE_API_BASE_URL`: `https://reportsaathi-backend.onrender.com/api`
   - `VITE_SUPABASE_URL`: `https://<your-supabase-url>.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `<your-supabase-anon-key>`
5. Click **Save and Deploy**. Cloudflare Pages will build and deploy your global frontend.
6. Copy your production Cloudflare URL and ensure it is included in Render's `CORS_ORIGINS` variable.

---

## 📋 QA & Pre-Deployment Checklist

- [x] **Frontend Production Build**: `npm run build` succeeds without syntax or bundling errors.
- [x] **Backend QA Test Suite**: `test_qa_suite.py` passes all 5 functional and safety test groups.
- [x] **Upload Validation**: File formats restricted to `.pdf`, `.jpg`, `.jpeg`, and `.png`; sizes capped at 10 MB.
- [x] **Non-Diagnostic Safety Guardrails**: All summaries and chat endpoints disclaim diagnostic authority.
- [x] **Report-Grounded Chat**: Questions on unlisted tests (e.g. Thyroid on a CBC report) are rejected as unavailable and directed to a doctor.
- [x] **Privacy & RLS**: Database policies enforce row-level tenant isolation; opt-in saving default is false.
- [x] **Demo Mode Resilience**: App runs smoothly in memory if Supabase or Gemini keys are absent.
- [x] **Telegram Security**: Tokens and patient data are strictly excluded from logs.
- [x] **Responsive Mobile Layout**: Grid collapses smoothly on small viewports (`sm:` / `md:` breakpoints).

---

## ⚠️ Known Limitations & Considerations

1. **Scanned PDF Processing in Serverless Environments**: OCR on scanned image-based PDFs requires native Tesseract libraries. On hosting platforms without apt-level packages, digital text-based PDFs extract immediately, while image-based PDFs fall back gracefully or require a Docker container.
2. **Cold Starts on Free Cloud Tiers**: Free tier hosting on Render spins down instances after 15 minutes of inactivity; the initial request may experience a 30–50 second wake-up delay.
3. **Telegram Webhooks vs Polling**: The included Telegram bot uses long polling (`getUpdates`). In high-traffic production environments, converting the polling loop into a webhook endpoint mounted on the FastAPI router is recommended.
