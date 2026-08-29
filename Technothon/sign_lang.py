# -*- coding: utf-8 -*-
"""
Sign Language Translator Backend
Single-Model Architecture:
Model: Custom 120-Class Indian Sign Language (ISL) Model
"""

import os
import sys
import time
import math
import io
import threading
import base64
from pathlib import Path
from typing import List, Dict, Any, Optional

from flask import (
    Flask,
    render_template,
    Response,
    jsonify,
    request,
    send_file
)
from flask_cors import CORS
import cv2
import cvzone
import numpy as np
import requests
import torch
from gtts import gTTS
from dotenv import load_dotenv
from ultralytics import YOLO

# ============================================================
# PROJECT PATHS & ENVIRONMENT CONFIGURATION
# ============================================================

BASE_DIR = Path(__file__).resolve().parent
ENV_FILE = BASE_DIR / ".env"

if ENV_FILE.exists():
    load_dotenv(dotenv_path=ENV_FILE, override=True)
else:
    load_dotenv(override=True)

# EXACT MODEL PATH AS REQUIRED (Using raw string to prevent escape sequence issues)
MODEL_PATH = BASE_DIR / "techno_final_model" / "train-3" / "weights" / "best.pt"

if not MODEL_PATH.exists():
    raise FileNotFoundError(f"[MODEL ERROR] best.pt not found at: {MODEL_PATH}")

CONFIDENCE_THRESHOLD = float(os.getenv("MODEL_CONFIDENCE_THRESHOLD", "0.10"))
MODEL_IMAGE_SIZE = int(os.getenv("MODEL_IMAGE_SIZE", "640"))

# Device selection (GPU if available, CPU otherwise)
DEVICE = 0 if torch.cuda.is_available() else "cpu"
device_name = "CUDA" if torch.cuda.is_available() else "CPU"

# ============================================================
# LOAD MODEL & VERIFY 120 CLASSES
# ============================================================

try:
    model = YOLO(str(MODEL_PATH))
    class_names = model.names if hasattr(model, "names") else {}
    class_count = len(class_names)

    print("========================================")
    print("SIGN LANGUAGE MODEL")
    print("========================================")
    print("Model path:")
    print(rf"{MODEL_PATH}")
    print()
    print(f"Model loaded: {'YES' if model is not None else 'NO'}")
    print(f"Class count: {class_count}")
    print(f"Device: {device_name}")
    print(f"Confidence threshold: {CONFIDENCE_THRESHOLD:.2f}")
    print("========================================")

    if class_count != 120:
        print(f"[MODEL WARNING] Expected 120 classes, found {class_count} classes.")
    else:
        print("[MODEL CHECK] Verified exactly 120 Indian Sign Language classes.")

    print(f"[MODEL] Classes: {model.names}")
    print("=" * 60)

except Exception as e:
    print(f"[MODEL ERROR] Failed to load best.pt: {e}")
    sys.exit(1)

# ============================================================
# FLASK & CORS INITIALIZATION
# ============================================================

app = Flask(__name__)
CORS(
    app,
    resources={
        r"/*": {
            "origins": "*"
        }
    }
)

# ============================================================
# PREDICTION ENGINE (best.pt ONLY)
# ============================================================

def predict_frame(img_bgb: np.ndarray, confidence: float = CONFIDENCE_THRESHOLD) -> List[Dict[str, Any]]:
    """Run streaming inference on a single BGR frame using the custom best.pt model.

    Returns a list of prediction dicts sorted by confidence descending.
    Each dict contains:
        "class": class name,
        "confidence": rounded confidence,
        "bbox": {"x": int, "y": int, "width": int, "height": int}
    """
    if img_bgb is None or img_bgb.size == 0:
        return []

    predictions: List[Dict[str, Any]] = []
    try:
        results = model(
            img_bgb,
            stream=True,
            imgsz=MODEL_IMAGE_SIZE,
            conf=confidence,
            device=DEVICE,
            verbose=False,
        )
        for result in results:
            boxes = result.boxes
            if boxes is None:
                continue
            for box in boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                conf = math.ceil(float(box.conf[0]) * 100) / 100
                if conf < confidence:
                    continue
                cls_id = int(box.cls[0])
                cls_name = class_names.get(cls_id, str(cls_id)).strip()
                w_box = max(1, x2 - x1)
                h_box = max(1, y2 - y1)
                predictions.append({
                    "class": cls_name,
                    "confidence": conf,
                    "bbox": {
                        "x": max(0, x1),
                        "y": max(0, y1),
                        "width": w_box,
                        "height": h_box,
                    },
                })
        predictions.sort(key=lambda p: p["confidence"], reverse=True)
        return predictions
    except Exception as e:
        print(f"[MODEL ERROR] best.pt inference failed: {e}")
        return []
    """Run streaming inference on a single BGR frame using the custom best.pt model.

    Returns a list of prediction dicts sorted by confidence descending.
    Each dict contains:
        "class": class name,
        "confidence": rounded confidence,
        "bbox": {"x": int, "y": int, "width": int, "height": int}
    """
    if img_bgr is None or img_bgr.size == 0:
        return []

    predictions: List[Dict[str, Any]] = []
    try:
        # Stream inference for consistency with original YOLO workflow
        results = model(
            img_bgr,
            stream=True,
            imgsz=MODEL_IMAGE_SIZE,
            conf=confidence,
            device=DEVICE,
            verbose=False,
        )
        for result in results:
            boxes = result.boxes
            if boxes is None:
                continue
            for box in boxes:
                # Extract bounding box coordinates
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                # Confidence rounding as per original implementation
                conf = math.ceil(float(box.conf[0]) * 100) / 100
                if conf < confidence:
                    continue
                cls_id = int(box.cls[0])
                cls_name = class_names.get(cls_id, str(cls_id)).strip()
                w_box = max(1, x2 - x1)
                h_box = max(1, y2 - y1)
                predictions.append({
                    "class": cls_name,
                    "confidence": conf,
                    "bbox": {
                        "x": max(0, x1),
                        "y": max(0, y1),
                        "width": w_box,
                        "height": h_box,
                    },
                })
        # Sort predictions by confidence descending
        predictions.sort(key=lambda p: p["confidence"], reverse=True)
        return predictions
    except Exception as e:
        print(f"[MODEL ERROR] best.pt inference failed: {e}")
        return []
    """Run streaming inference on a single BGR frame using the custom best.pt model.

    Returns a list of prediction dicts sorted by confidence descending.
    Each dict contains:
        "class": class name,
        "confidence": rounded confidence,
        "bbox": {"x": int, "y": int, "width": int, "height": int}
    """
    if img_bgr is None or img_bgr.size == 0:
        return []

    predictions: List[Dict[str, Any]] = []
    try:
        # Stream inference for consistency with original YOLO workflow
        results = model(
            img_bgr,
            stream=True,
            imgsz=MODEL_IMAGE_SIZE,
            conf=confidence,
            device=DEVICE,
            verbose=False,
        )
        for result in results:
            boxes = result.boxes
            if boxes is None:
                continue
            for box in boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                conf = math.ceil(float(box.conf[0]) * 100) / 1024
                if conf < confidence:
                    continue
                cls_id = int(box.cls[0])
                cls_name = class_names.get(cls_id, str(cls_id)).strip()
                w_box = max(1, x2 - x1)
                h_box = max(1, y2 - y1)
                predictions.append({
                    "class": cls_name,
                    "confidence": conf,
                    "bbox": {
                        "x": max(0, x1),
                        "y": max(0, y1),
                        "width": w_box,
                        "height": h_box,
                    },
                })
        predictions.sort(key=lambda p: p["confidence"], reverse=True)
        return predictions
    except Exception as e:
        print(f"[MODEL ERROR] best.pt inference failed: {e}")
        return []

# ============================================================
# ASYNCHRONOUS WEBCAM INFERENCE WORKER
# ============================================================

latest_predictions: List[Dict[str, Any]] = []
predictions_lock = threading.Lock()
inference_in_progress = False

# Temporal Stabilization Parameters
REQUIRED_DETECTIONS = 1
WORD_COOLDOWN = 1.5
EMPTY_RESET_THRESHOLD = 10

candidate_word = ""
candidate_count = 0
empty_inference_count = 0

def run_async_inference(frame_bgr: np.ndarray):
    """Runs local best.pt inference in a background thread to keep camera feed at 30 FPS."""
    global inference_in_progress

    if inference_in_progress:
        return

    inference_in_progress = True

    def _worker(img_copy: np.ndarray):
        global inference_in_progress, latest_predictions, candidate_word, candidate_count, empty_inference_count
        try:
            preds = predict_frame(img_copy, confidence=CONFIDENCE_THRESHOLD)

            with predictions_lock:
                latest_predictions = preds

            # Temporal Stabilization based on inference cycles
            if preds:
                empty_inference_count = 0
                best_pred = preds[0]
                best_word = best_pred["class"]
                best_conf = best_pred["confidence"]

                print(f"[PREDICTION] class={best_word} confidence={best_conf:.3f}")

                if best_word == candidate_word:
                    candidate_count += 1
                else:
                    candidate_word = best_word
                    candidate_count = 1

                if candidate_count >= REQUIRED_DETECTIONS:
                    print(f"[STABLE] class={best_word} count={candidate_count}")
                    queue_word(best_word)
                    candidate_count = 0
            else:
                empty_inference_count += 1
                if empty_inference_count >= EMPTY_RESET_THRESHOLD:
                    candidate_word = ""
                    candidate_count = 0

        finally:
            inference_in_progress = False

    thread = threading.Thread(target=_worker, args=(frame_bgr.copy(),), daemon=True)
    thread.start()

# ============================================================
# WORD QUEUE & DEBOUNCE CONTROL
# ============================================================

word_queue: List[str] = []
word_lock = threading.Lock()

last_detected_word = ""
last_detection_time = 0.0

def queue_word(word: str):
    """Adds stabilized word to queue with cooldown debouncing."""
    global last_detected_word, last_detection_time
    word = str(word).strip()
    if not word:
        return

    current_time = time.time()
    with word_lock:
        if word == last_detected_word and (current_time - last_detection_time < WORD_COOLDOWN):
            return

        if word_queue and word_queue[-1] == word:
            return

        word_queue.append(word)
        if len(word_queue) > 50:
            del word_queue[:-50]

        last_detected_word = word
        last_detection_time = current_time
        print(f"[QUEUE] WORD QUEUED: '{word}'")

def clear_queue_data():
    global candidate_word, candidate_count, empty_inference_count, last_detected_word, last_detection_time
    with word_lock:
        word_queue.clear()
    candidate_word = ""
    candidate_count = 0
    empty_inference_count = 0
    last_detected_word = ""
    last_detection_time = 0.0

# ============================================================
# CAMERA & LIVE STREAMING
# ============================================================

cap = None
latest_frame = None
camera_lock = threading.Lock()

def initialize_camera() -> bool:
    global cap
    print("[CAMERA] Opening webcam device 0...")
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

    if not cap.isOpened():
        print("[CAMERA] ERROR: Could not open webcam.")
        return False
    print("[CAMERA] Webcam opened successfully.")
    return True

def camera_loop():
    global latest_frame

    if not initialize_camera():
        return

    while True:
        success, img = cap.read()
        if not success:
            time.sleep(0.1)
            continue

        # Mirror image for natural user interaction
        img = cv2.flip(img, 1)

        # Trigger background local inference on latest frame
        run_async_inference(img)

        # Read latest predictions for visual overlay
        with predictions_lock:
            current_preds = list(latest_predictions)

        # Draw bounding boxes and labels for ISL sign predictions
        for pred in current_preds:
            b = pred["bbox"]
            x1, y1 = b["x"], b["y"]
            x2, y2 = x1 + b["width"], y1 + b["height"]
            word = pred["class"]
            conf = pred["confidence"]

            # Vibrant Red bounding box
            box_color = (255, 2, 27)
            cv2.rectangle(img, (x1, y1), (x2, y2), box_color, 3)

            label_text = f"{word} {conf:.2f}"
            cvzone.putTextRect(
                img,
                label_text,
                (x1, max(35, y1)),
                colorT=(255, 255, 255),
                colorR=box_color,
                scale=0.8,
                thickness=3
            )

        # Header overlay
        cv2.putText(
            img,
            "LIVE CAMERA - ISL SIGN DETECTION (best.pt)",
            (20, 40),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.85,
            (255, 255, 255),
            2
        )

        # Encode JPEG
        success_encode, buffer = cv2.imencode(".jpg", img, [int(cv2.IMWRITE_JPEG_QUALITY), 85])
        if not success_encode:
            continue

        frame_bytes = buffer.tobytes()
        with camera_lock:
            latest_frame = frame_bytes

# ============================================================
# API ENDPOINTS
# ============================================================

LANGUAGES = {
    "hi": {"name": "Hindi", "tts": "hi"},
    "bn": {"name": "Bengali", "tts": "bn"},
    "te": {"name": "Telugu", "tts": "te"},
    "ta": {"name": "Tamil", "tts": "ta"},
    "mr": {"name": "Marathi", "tts": "mr"},
    "gu": {"name": "Gujarati", "tts": "gu"},
    "kn": {"name": "Kannada", "tts": "kn"},
    "ml": {"name": "Malayalam", "tts": "ml"},
    "pa": {"name": "Punjabi", "tts": "pa"},
    "ur": {"name": "Urdu", "tts": "ur"},
    "en": {"name": "English", "tts": "en"}
}

def generate_frames():
    """Generates MJPEG streaming frames for web browser."""
    while True:
        with camera_lock:
            frame = latest_frame

        if frame is not None:
            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n"
                + frame
                + b"\r\n"
            )
        time.sleep(0.03)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/video")
def video():
    return Response(
        generate_frames(),
        mimetype="multipart/x-mixed-replace; boundary=frame"
    )

@app.route("/word")
def get_word():
    with word_lock:
        if len(word_queue) == 0:
            return jsonify({"word": ""})
        word = word_queue.pop(0)

    print(f"[API] /word → {word}")
    return jsonify({"word": word})

@app.route("/queue")
def get_queue():
    with word_lock:
        current_queue = list(word_queue)
    return jsonify({"queue": current_queue})

@app.route("/clear")
def clear_queue():
    clear_queue_data()
    return jsonify({"success": True})

@app.route("/predict-sign", methods=["POST"])
def predict_sign_endpoint():
    """
    Dedicated endpoint for single-frame prediction using ONLY best.pt.
    Accepts image via multipart form upload ("file" or "image") or JSON base64 ("image").
    """
    start_time = time.time()
    try:
        img = None
        if "file" in request.files or "image" in request.files:
            file_storage = request.files.get("file") or request.files.get("image")
            if file_storage:
                file_bytes = np.frombuffer(file_storage.read(), np.uint8)
                if len(file_bytes) > 0:
                    img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
        elif request.is_json:
            data = request.get_json() or {}
            base64_data = data.get("image", "")
            if base64_data and isinstance(base64_data, str) and len(base64_data.strip()) > 0:
                if "," in base64_data:
                    base64_data = base64_data.split(",", 1)[1]
                try:
                    img_bytes = base64.b64decode(base64_data.strip())
                    if img_bytes:
                        img_np = np.frombuffer(img_bytes, np.uint8)
                        img = cv2.imdecode(img_np, cv2.IMREAD_COLOR)
                except Exception:
                    img = None

        if img is None:
            return jsonify({"success": False, "error": "No valid image provided"}), 400

        predictions = predict_frame(img, confidence=CONFIDENCE_THRESHOLD)
        inference_time_ms = int((time.time() - start_time) * 1000)

        return jsonify({
            "success": True,
            "model": MODEL_PATH.name,
            "predictions": predictions,
            "inferenceTimeMs": inference_time_ms
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/translate", methods=["POST"])
def translate_text():
    try:
        data = request.get_json(silent=True) or {}
        text = str(data.get("text", "")).strip()
        target = data.get("target", "hi")

        if not text:
            return jsonify({"success": False, "error": "No text provided."}), 400

        if target not in LANGUAGES:
            return jsonify({"success": False, "error": "Unsupported language."}), 400

        if target == "en":
            return jsonify({
                "success": True,
                "translated_text": text,
                "language": "English"
            })

        translated_text = ""
        clients = ["gtx", "dict-chrome-ex", "t"]
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

        for client_name in clients:
            try:
                url = "https://translate.googleapis.com/translate_a/single"
                params = {
                    "client": client_name,
                    "sl": "en",
                    "tl": target,
                    "dt": "t",
                    "q": text
                }
                resp = requests.get(url, params=params, headers=headers, timeout=8)
                if resp.status_code == 200:
                    result = resp.json()
                    if result and result[0]:
                        for item in result[0]:
                            if item and item[0]:
                                translated_text += item[0]
                        if translated_text:
                            break
            except Exception:
                continue

        if not translated_text:
            translated_text = text

        return jsonify({
            "success": True,
            "translated_text": translated_text,
            "language": LANGUAGES[target]["name"]
        })
    except Exception as e:
        print(f"[TRANSLATION] Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/speak", methods=["POST"])
def speak():
    try:
        data = request.get_json(silent=True) or {}
        text = str(data.get("text", "")).strip()
        target = data.get("target", "hi")

        if not text:
            return jsonify({"success": False, "error": "No text provided."}), 400

        if target not in LANGUAGES:
            return jsonify({"success": False, "error": "Unsupported language."}), 400

        language = LANGUAGES[target]["tts"]
        print(f"[TTS] Text: '{text}', Language: '{language}'")

        tts = gTTS(text=text, lang=language, slow=False)
        audio = io.BytesIO()
        tts.write_to_fp(audio)
        audio.seek(0)

        return send_file(
            audio,
            mimetype="audio/mpeg",
            as_attachment=False,
            download_name="speech.mp3"
        )
    except Exception as e:
        print(f"[TTS] ERROR: {repr(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

# ============================================================
# START CAMERA WORKER THREAD
# ============================================================

camera_thread = threading.Thread(
    target=camera_loop,
    daemon=True
)
camera_thread.start()

# ============================================================
# APPLICATION ENTRYPOINT
# ============================================================

if __name__ == "__main__":
    print()
    print("=" * 55)
    print("   SIGN LANGUAGE TRANSLATOR - 120-CLASS ISL (best.pt)")
    print("=" * 55)
    print()
    print("Backend Service:     http://127.0.0.1:8080")
    print("Word Polling API:    http://127.0.0.1:8080/word")
    print("Predict Endpoint:    http://127.0.0.1:8080/predict-sign")
    print("Live Video Stream:   http://127.0.0.1:8080/video")
    print()

    app.run(
        host="0.0.0.0",
        port=int(os.getenv('PORT', 8080)),
        debug=False,
        threaded=True,
        use_reloader=False
    )



