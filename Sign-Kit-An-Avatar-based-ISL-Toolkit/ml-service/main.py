"""
ml-service/main.py
FastAPI ML service for Sign-Kit Indian-Language Voice-to-ISL Translator
Endpoints:
  GET  /health
  POST /speech-to-text     (faster-whisper, local CPU)
  POST /translate-to-english (NLLB-200, local CPU)
  POST /text-to-speech    (gTTS, English audio)
"""

import os
import sys
import logging
import tempfile
import shutil
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Ensure utf-8 stdout
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("signkit-ml")

from dotenv import load_dotenv
load_dotenv()

# ─── Configuration ───────────────────────────────────────────────────────────
WHISPER_MODEL    = os.getenv("WHISPER_MODEL", "base")
WHISPER_DEVICE   = os.getenv("WHISPER_DEVICE", "cpu")
INDICTRANS_MODEL = os.getenv("INDICTRANS_MODEL", "facebook/nllb-200-distilled-600M")

# ISO-639-1 -> NLLB FLORES-200 code
LANG_CODE_MAP = {
    "auto": None,
    "en": "eng_Latn",
    "hi": "hin_Deva",
    "bn": "ben_Beng",
    "gu": "guj_Gujr",
    "mr": "mar_Deva",
    "ta": "tam_Taml",
    "te": "tel_Telu",
    "kn": "kan_Knda",
    "ml": "mal_Mlym",
    "pa": "pan_Guru",
    "or": "ory_Orya",
    "as": "asm_Beng",
    "ur": "urd_Arab",
}

# Whisper detected language -> ISO-639-1 code
WHISPER_LANG_TO_ISO = {
    "english": "en", "hindi": "hi", "bengali": "bn", "marathi": "mr",
    "gujarati": "gu", "tamil": "ta", "telugu": "te", "kannada": "kn",
    "malayalam": "ml", "punjabi": "pa", "odia": "or", "oriya": "or",
    "assamese": "as",
    "en": "en", "hi": "hi", "bn": "bn", "mr": "mr", "gu": "gu",
    "ta": "ta", "te": "te", "kn": "kn", "ml": "ml", "pa": "pa",
    "or": "or", "as": "as",
}

def detect_dominant_script(text: str) -> str:
    """Detect dominant Indic or Latin script in text."""
    if not text:
        return "unknown"
    counts = {
        "bn": 0, "hi": 0, "gu": 0, "pa": 0, "or": 0,
        "ta": 0, "te": 0, "kn": 0, "ml": 0, "en": 0
    }
    for ch in text:
        cp = ord(ch)
        if 0x0980 <= cp <= 0x09FF:
            counts["bn"] += 1  # Bengali / Assamese script
        elif 0x0900 <= cp <= 0x097F:
            counts["hi"] += 1  # Devanagari (Hindi / Marathi)
        elif 0x0A80 <= cp <= 0x0AFF:
            counts["gu"] += 1  # Gujarati
        elif 0x0A00 <= cp <= 0x0A7F:
            counts["pa"] += 1  # Gurmukhi
        elif 0x0B00 <= cp <= 0x0B7F:
            counts["or"] += 1  # Odia
        elif 0x0B80 <= cp <= 0x0BFF:
            counts["ta"] += 1  # Tamil
        elif 0x0C00 <= cp <= 0x0C7F:
            counts["te"] += 1  # Telugu
        elif 0x0C80 <= cp <= 0x0CFF:
            counts["kn"] += 1  # Kannada
        elif 0x0D00 <= cp <= 0x0D7F:
            counts["ml"] += 1  # Malayalam
        elif (0x0041 <= cp <= 0x005A) or (0x0061 <= cp <= 0x007A):
            counts["en"] += 1  # Latin

    max_script = max(counts, key=counts.get)
    if counts[max_script] == 0:
        return "unknown"
    return max_script

# Global model references
whisper_model = None
nllb_tokenizer = None
nllb_model = None
eng_token_id = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global whisper_model, nllb_tokenizer, nllb_model, eng_token_id

    # 1. Load faster-whisper
    logger.info("Loading faster-whisper '%s' on device='%s'...", WHISPER_MODEL, WHISPER_DEVICE)
    try:
        from faster_whisper import WhisperModel
        compute_type = "int8" if WHISPER_DEVICE == "cpu" else "float16"
        whisper_model = WhisperModel(WHISPER_MODEL, device=WHISPER_DEVICE, compute_type=compute_type)
        logger.info("faster-whisper loaded successfully.")
    except Exception as e:
        logger.error("Failed to load faster-whisper: %s", e)
        whisper_model = None

    # 2. Load NLLB-200
    logger.info("Loading translation model '%s' on CPU...", INDICTRANS_MODEL)
    try:
        from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
        nllb_tokenizer = AutoTokenizer.from_pretrained(INDICTRANS_MODEL)
        nllb_model = AutoModelForSeq2SeqLM.from_pretrained(INDICTRANS_MODEL)
        eng_token_id = nllb_tokenizer.convert_tokens_to_ids("eng_Latn")
        logger.info("NLLB-200 translation model loaded successfully (eng_Latn id=%s).", eng_token_id)
    except Exception as e:
        logger.error("Failed to load NLLB translation model: %s", e)
        nllb_model = None

    yield
    logger.info("Shutting down Sign-Kit ML service.")


app = FastAPI(title="Sign-Kit ML Service", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class TranslateRequest(BaseModel):
    text: str
    sourceLanguage: str

class TTSRequest(BaseModel):
    text: str

@app.get("/health")
def health():
    return {
        "status": "ok",
        "whisper": whisper_model is not None,
        "nllb_translator": nllb_model is not None,
    }

@app.post("/speech-to-text")
async def speech_to_text(
    audio: UploadFile = File(...),
    language: str = None,
):
    if whisper_model is None:
        raise HTTPException(503, "Whisper model not initialized.")

    if not audio.filename:
        raise HTTPException(400, "No audio file provided.")

    requested_lang = None
    if language:
        cleaned = language.strip().lower()
        if cleaned != "auto" and cleaned in LANG_CODE_MAP:
            requested_lang = cleaned

    suffix = Path(audio.filename).suffix or ".webm"
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            shutil.copyfileobj(audio.file, tmp)
            tmp_path = tmp.name

        transcribe_kwargs = {"beam_size": 5}
        if requested_lang:
            transcribe_kwargs["language"] = requested_lang

        logger.info("[STT] Transcribing with options: %s", transcribe_kwargs)
        segments, info = whisper_model.transcribe(tmp_path, **transcribe_kwargs)
        text_parts = [s.text for s in segments]
        full_text = " ".join(text_parts).strip()

        detected_lang = info.language if hasattr(info, "language") else "unknown"
        detected_iso = WHISPER_LANG_TO_ISO.get(detected_lang.lower(), detected_lang)
        confidence = round(float(info.language_probability) if hasattr(info, "language_probability") else 1.0, 3)

        final_lang = requested_lang if requested_lang else detected_iso
        dominant_script = detect_dominant_script(full_text)

        logger.info(
            "[STT] Result -> text: '%s', requested: %s, detected: %s (%s), final: %s, script: %s, confidence: %s",
            full_text, requested_lang, detected_lang, detected_iso, final_lang, dominant_script, confidence
        )

        if not full_text:
            raise HTTPException(422, "No speech detected in audio.")

        return {
            "text": full_text,
            "language": final_lang,
            "detectedLanguage": detected_iso,
            "confidence": confidence,
            "script": dominant_script,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("STT error")
        raise HTTPException(500, f"Speech recognition failed: {str(e)}")
    finally:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.unlink(tmp_path)
            except Exception:
                pass

@app.post("/translate-to-english")
def translate_to_english(body: TranslateRequest):
    if not body.text or not body.text.strip():
        raise HTTPException(400, "Text is empty.")

    src_iso = body.sourceLanguage.strip().lower()
    logger.info("[Translate] Request: src_iso='%s', text='%s'", src_iso, body.text.strip())

    if src_iso == "en":
        return {
            "englishText": body.text.strip(),
            "sourceLanguage": "en",
            "sourceText": body.text.strip(),
        }

    if nllb_model is None or nllb_tokenizer is None:
        raise HTTPException(503, "Translation model not initialized.")

    flores_src = LANG_CODE_MAP.get(src_iso)
    if not flores_src:
        raise HTTPException(400, f"Unsupported source language code: '{src_iso}'.")

    try:
        nllb_tokenizer.src_lang = flores_src
        inputs = nllb_tokenizer(body.text.strip(), return_tensors="pt")
        outputs = nllb_model.generate(
            **inputs,
            forced_bos_token_id=eng_token_id,
            max_length=128
        )
        english_text = nllb_tokenizer.batch_decode(outputs, skip_special_tokens=True)[0].strip()

        logger.info("[Translate] Source (%s): '%s' -> English: '%s'", src_iso, body.text.strip(), english_text)

        return {
            "englishText": english_text,
            "sourceLanguage": src_iso,
            "sourceText": body.text.strip(),
        }
    except Exception as e:
        logger.exception("Translation error")
        raise HTTPException(500, f"Translation failed: {str(e)}")

@app.post("/text-to-speech")
def text_to_speech(body: TTSRequest):
    if not body.text or not body.text.strip():
        raise HTTPException(400, "Text is empty.")

    try:
        from gtts import gTTS
        tts = gTTS(text=body.text.strip(), lang="en")
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
            tmp_path = tmp.name
        tts.save(tmp_path)

        return FileResponse(
            tmp_path,
            media_type="audio/mpeg",
            filename="tts.mp3"
        )
    except Exception as e:
        logger.exception("TTS error")
        raise HTTPException(500, f"Text-to-speech failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

