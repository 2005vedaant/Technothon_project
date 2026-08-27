import os, sys, time

print("="*60)
print("1. TESTING NLLB-200 TRANSLATION MODEL")
print("="*60)

from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, pipeline

MODEL_NAME = "facebook/nllb-200-distilled-600M"
print(f"Loading {MODEL_NAME} on CPU...")
t0 = time.time()
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)
translator = pipeline("translation", model=model, tokenizer=tokenizer, max_length=512)
print(f"Model loaded in {time.time() - t0:.2f}s\n")

LANG_MAP = {
    "hi": ("hin_Deva", "मुझे पानी चाहिए"),
    "bn": ("ben_Beng", "আমি স্কুলে যেতে চাই"),
    "ta": ("tam_Taml", "எனக்கு தண்ணீர் வேண்டும்"),
    "te": ("tel_Telu", "నాకు నీళ్లు కావాలి"),
    "mr": ("mar_Deva", "मला घरी जायचे आहे"),
}

results = {}
for lang, (flores_code, text) in LANG_MAP.items():
    t_start = time.time()
    res = translator(text, src_lang=flores_code, tgt_lang="eng_Latn")
    eng = res[0]["translation_text"]
    dur = time.time() - t_start
    results[lang] = eng
    print(f"[{lang.upper()}] '{text}' -> '{eng}' ({dur:.2f}s)")

print("\n" + "="*60)
print("2. TESTING gTTS (TEXT-TO-SPEECH)")
print("="*60)
from gtts import gTTS
tts_text = "I need water"
tts = gTTS(text=tts_text, lang="en")
tts_path = "test_tts.mp3"
tts.save(tts_path)
size = os.path.getsize(tts_path)
print(f"[gTTS OK] Saved '{tts_path}', size = {size} bytes")

print("\n" + "="*60)
print("3. TESTING FASTER-WHISPER SPEECH-TO-TEXT")
print("="*60)
from faster_whisper import WhisperModel
print("Loading faster-whisper 'small' model on CPU (int8)...")
t0 = time.time()
whisper = WhisperModel("small", device="cpu", compute_type="int8")
print(f"Whisper loaded in {time.time() - t0:.2f}s")

# We can transcribe the generated test_tts.mp3 audio
print("Transcribing test_tts.mp3...")
segments, info = whisper.transcribe(tts_path, beam_size=5)
transcribed = " ".join([s.text for s in segments]).strip()
print(f"[Whisper OK] Transcribed: '{transcribed}', Language: {info.language}, Confidence: {info.language_probability:.2f}")

print("\nALL OFFLINE MODEL VERIFICATION TESTS PASSED SUCCESSFULLY!")
