import time
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

MODEL_NAME = "facebook/nllb-200-distilled-600M"
print("Loading tokenizer and model...")
t0 = time.time()
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)
print(f"Loaded in {time.time()-t0:.2f}s")

TEST_CASES = [
    ("hi", "hin_Deva", "मुझे पानी चाहिए"),
    ("bn", "ben_Beng", "আমি স্কুলে যেতে চাই"),
    ("ta", "tam_Taml", "எனக்கு தண்ணீர் வேண்டும்"),
    ("te", "tel_Telu", "నాకు నీళ్లు కావాలి"),
    ("mr", "mar_Deva", "मला घरी जायचे आहे"),
    ("gu", "guj_Gujr", "મને પાણી જોઈએ છે"),
    ("pa", "pan_Guru", "ਮੈਨੂੰ ਪਾਣੀ ਚਾਹੀਦਾ ਹੈ"),
    ("kn", "kan_Knda", "ನನಗೆ ನೀರು ಬೇಕು"),
    ("ml", "mal_Mlym", "എനിക്ക് വെള്ളം വേണം"),
]

eng_id = tokenizer.convert_tokens_to_ids("eng_Latn")
print(f"Target language token 'eng_Latn' id: {eng_id}\n")

for lang_code, src_flores, text in TEST_CASES:
    tokenizer.src_lang = src_flores
    inputs = tokenizer(text, return_tensors="pt")
    t1 = time.time()
    outputs = model.generate(
        **inputs,
        forced_bos_token_id=eng_id,
        max_length=128
    )
    translated = tokenizer.batch_decode(outputs, skip_special_tokens=True)[0]
    dur = time.time() - t1
    print(f"[{lang_code.upper()} -> EN] ({dur:.2f}s)\n  Source: {text}\n  English: {translated}\n")

print("NLLB_TRANSLATION_TEST_SUCCESSFUL")
