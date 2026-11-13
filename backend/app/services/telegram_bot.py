import asyncio
import os
import sys
import logging
from typing import Optional, Tuple
import httpx

from app.config import settings
from app.services.extractor import extract_document_text
from app.services.gemini import analyze_report_with_gemini

# Set up logging that explicitly excludes sensitive report text and bot tokens
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("telegram_bot")

TELEGRAM_API_BASE = "https://api.telegram.org/bot"

SUPPORTED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"]
MAX_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB limit (same as web app)

DISCLAIMER_TEXT = (
    "\n\n⚠️ *Medical Disclaimer:* ReportSaathi provides educational information only. "
    "It does not provide medical diagnoses, treatment plans, or clinical certainty. "
    "Please consult a qualified healthcare professional regarding your health."
)

def mask_token(token: str) -> str:
    """Masks bot token for safe logging without exposing credentials."""
    if not token or len(token) < 8:
        return "***"
    return f"{token[:4]}...{token[-4:]}"

async def send_telegram_message(client: httpx.AsyncClient, token: str, chat_id: int, text: str, parse_mode: str = "Markdown") -> bool:
    url = f"{TELEGRAM_API_BASE}{token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": parse_mode
    }
    try:
        res = await client.post(url, json=payload, timeout=10.0)
        if not res.is_success and parse_mode == "Markdown":
            # Fallback to plain text if markdown formatting has unmatched asterisks
            payload["parse_mode"] = None
            res = await client.post(url, json=payload, timeout=10.0)
        return res.is_success
    except Exception as e:
        logger.error(f"Failed to send Telegram message to chat_id={chat_id}: {type(e).__name__}")
        return False

def validate_file(file_name: Optional[str], file_size: Optional[int]) -> Tuple[bool, Optional[str]]:
    """Applies the exact same validation rules as the web app."""
    if not file_name:
        return False, "Could not determine file name. Please send a valid PDF, JPG, or PNG report."

    ext = os.path.splitext(file_name)[1].lower()
    if ext not in SUPPORTED_EXTENSIONS:
        return False, f"Unsupported file format ({ext or 'unknown'}). ReportSaathi accepts PDF, JPG, and PNG files only."

    if file_size and file_size > MAX_SIZE_BYTES:
        size_mb = (file_size / 1024 / 1024)
        return False, f"File size ({size_mb:.1f} MB) exceeds the 10 MB limit. Please provide a smaller document."

    return True, None

async def handle_document_or_photo(client: httpx.AsyncClient, token: str, chat_id: int, file_id: str, file_name: str, file_size: Optional[int]):
    # 1. Validation
    is_valid, err_msg = validate_file(file_name, file_size)
    if not is_valid:
        await send_telegram_message(client, token, chat_id, f"❌ {err_msg}{DISCLAIMER_TEXT}")
        return

    # 2. Inform user analysis has started
    await send_telegram_message(client, token, chat_id, "⏳ *Analyzing report with ReportSaathi...*\nExtracting test metrics and preparing your educational breakdown.", parse_mode="Markdown")

    try:
        # Get file path from Telegram API
        get_file_url = f"{TELEGRAM_API_BASE}{token}/getFile?file_id={file_id}"
        file_info_res = await client.get(get_file_url, timeout=15.0)
        if not file_info_res.is_success:
            await send_telegram_message(client, token, chat_id, "❌ Unable to download the file from Telegram. Please try again.")
            return

        file_path = file_info_res.json().get("result", {}).get("file_path")
        if not file_path:
            await send_telegram_message(client, token, chat_id, "❌ Could not retrieve file location.")
            return

        # Download file content safely in memory
        download_url = f"https://api.telegram.org/file/bot{token}/{file_path}"
        download_res = await client.get(download_url, timeout=30.0)
        if not download_res.is_success:
            await send_telegram_message(client, token, chat_id, "❌ Failed to download report file from Telegram.")
            return

        content = download_res.content

        # Log action without logging sensitive text or patient identifiers
        logger.info(f"Processing uploaded report for chat_id={chat_id}, file_type={os.path.splitext(file_name)[1]}, bytes={len(content)}")

        # Extract text using ReportSaathi's multi-engine pipeline (pdfplumber/OCR)
        extraction_res = extract_document_text(content, file_name)
        extracted_text = extraction_res.get("text", "")

        if not extracted_text or not extracted_text.strip():
            await send_telegram_message(
                client,
                token,
                chat_id,
                "⚠️ *Clarity Notice:* ReportSaathi could not extract readable text from this file. "
                "The image may be too blurry, low contrast, or handwritten. Please upload a clear digital PDF or well-lit photo." + DISCLAIMER_TEXT
            )
            return

        # Analyze with ReportSaathi Gemini/Deterministic engine
        analysis = analyze_report_with_gemini(extracted_text, filename=file_name)

        # Build educational summary message
        title = analysis.summary.report_title or "Laboratory Report"
        overview = analysis.summary.overall_summary or "Analysis complete."
        findings = analysis.findings or []

        flagged = [f for f in findings if (f.status or "").lower() not in ["normal", "unspecified"]]

        response_lines = [
            f"📋 *{title} - Plain Language Summary*",
            "",
            f"{overview}",
            "",
            f"• *Total tests identified:* {len(findings)}",
            f"• *Tests outside reference range:* {len(flagged)}"
        ]

        if flagged:
            response_lines.append("\n🔍 *Highlighted Parameters:*")
            for f in flagged[:4]:  # Show top 4 outside range to keep telegram message readable
                unit_str = f" {f.unit}" if f.unit else ""
                response_lines.append(f"• *{f.test_name}:* {f.extracted_value}{unit_str} ({f.status}) - Ref: {f.reference_range}")

        # Add doctor questions
        if analysis.summary.questions_for_doctor:
            response_lines.append("\n🩺 *Suggested Questions for Your Doctor:*")
            for q in analysis.summary.questions_for_doctor[:3]:
                response_lines.append(f"• {q}")

        # Unclear notice if present
        if analysis.summary.unclear_advisory:
            response_lines.append(f"\n⚠️ *Note:* {analysis.summary.unclear_advisory}")

        response_lines.append(DISCLAIMER_TEXT)

        full_reply = "\n".join(response_lines)
        await send_telegram_message(client, token, chat_id, full_reply)

    except Exception as e:
        logger.error(f"Error handling report file for chat_id={chat_id}: {type(e).__name__}")
        await send_telegram_message(
            client,
            token,
            chat_id,
            "❌ An error occurred while analyzing your report. Please ensure the document is clear and try again." + DISCLAIMER_TEXT
        )

async def process_update(client: httpx.AsyncClient, token: str, update: dict):
    message = update.get("message")
    if not message:
        return

    chat_id = message.get("chat", {}).get("id")
    if not chat_id:
        return

    # 1. Text commands (/start, /help)
    text = message.get("text", "")
    if text.startswith("/start") or text.startswith("/help"):
        welcome_msg = (
            "👋 *Welcome to ReportSaathi! (रिपोर्ट साथी)*\n\n"
            "I help you understand your medical laboratory reports by translating confusing clinical metrics into simple, everyday language.\n\n"
            "📤 *How to use:* Send me a laboratory report as a **PDF**, **JPG**, or **PNG** (up to 10 MB).\n\n"
            "🛡️ *Privacy & Safety:* We do not store your report files or sensitive medical text. ReportSaathi does not diagnose medical conditions or prescribe treatments."
            + DISCLAIMER_TEXT
        )
        await send_telegram_message(client, token, chat_id, welcome_msg)
        return

    # 2. Document upload (PDF, PNG, JPG)
    if "document" in message:
        doc = message["document"]
        file_id = doc.get("file_id")
        file_name = doc.get("file_name", "report.pdf")
        file_size = doc.get("file_size")
        await handle_document_or_photo(client, token, chat_id, file_id, file_name, file_size)
        return

    # 3. Photo upload
    if "photo" in message:
        photos = message["photo"]
        # Highest resolution is the last item in the list
        largest_photo = photos[-1]
        file_id = largest_photo.get("file_id")
        file_size = largest_photo.get("file_size")
        await handle_document_or_photo(client, token, chat_id, file_id, "report_photo.jpg", file_size)
        return

    # 4. Fallback for unexpected messages
    await send_telegram_message(
        client,
        token,
        chat_id,
        "Please send a medical report file (PDF, JPG, or PNG up to 10MB) to receive an educational explanation." + DISCLAIMER_TEXT
    )

async def run_bot_polling():
    token = settings.TELEGRAM_BOT_TOKEN or os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
    if not token or token in ("your_telegram_bot_token_here", ""):
        logger.info("TELEGRAM_BOT_TOKEN is not configured in backend environment. Telegram bot polling not started.")
        return

    logger.info(f"Starting ReportSaathi Telegram Bot with token {mask_token(token)}...")
    offset = 0

    async with httpx.AsyncClient() as client:
        # Check bot identity
        try:
            me_res = await client.get(f"{TELEGRAM_API_BASE}{token}/getMe", timeout=10.0)
            if me_res.is_success:
                bot_user = me_res.json().get("result", {}).get("username")
                logger.info(f"Connected to Telegram as @{bot_user}")
            else:
                logger.error(f"Failed to connect to Telegram API. Status: {me_res.status_code}")
                return
        except Exception as e:
            logger.error(f"Could not connect to Telegram API: {type(e).__name__}")
            return

        while True:
            try:
                url = f"{TELEGRAM_API_BASE}{token}/getUpdates?offset={offset}&timeout=20"
                res = await client.get(url, timeout=30.0)
                if res.is_success:
                    updates = res.json().get("result", [])
                    for update in updates:
                        offset = update["update_id"] + 1
                        await process_update(client, token, update)
                else:
                    await asyncio.sleep(5)
            except asyncio.CancelledError:
                logger.info("Telegram bot polling cancelled.")
                break
            except Exception as e:
                logger.warning(f"Telegram polling exception: {type(e).__name__}. Retrying in 5s...")
                await asyncio.sleep(5)

if __name__ == "__main__":
    try:
        asyncio.run(run_bot_polling())
    except KeyboardInterrupt:
        logger.info("Bot stopped by user.")
