from ultralytics import YOLO
import cv2
import cvzone
import math
import time

# -----------------------------
# MODEL
# -----------------------------
model = YOLO(
    "C:/Users/Admin/OneDrive/Desktop/Technothon/techno_final_model/train-3/weights/best.pt"
)

classNames = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
    'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
    'Y', 'Z', 'additional', 'alcohol', 'allergy', 'bacon', 'bad',
    'bag', 'barbecue', 'bill', 'biscuit', 'bitter', 'bread', 'burger',
    'bye', 'cake', 'cash', 'cheese', 'chicken', 'coke', 'cold',
    'correct', 'cost', 'coupon', 'credit card', 'cup', 'dessert',
    'don-t want', 'drink', 'drive', 'eat', 'eggs', 'enjoy', 'fine',
    'forget', 'fork', 'french fries', 'fresh', 'go', 'hello', 'help',
    'hot', 'icecream', 'ingredients', 'juicy', 'ketchup', 'lactose',
    'lettuce', 'lid', 'like', 'manager', 'menu', 'milk', 'more',
    'mustard', 'napkin', 'need', 'no', 'not', 'order', 'pepper',
    'pickle', 'pizza', 'please', 'ready', 'receipt', 'refill',
    'repeat', 'safe', 'salt', 'sandwich', 'sauce', 'small', 'soda',
    'sorry', 'spicy', 'spoon', 'straw', 'sugar', 'sweet', 'thank-you',
    'tissues', 'tomato', 'total', 'urgent', 'vegetables', 'wait',
    'want', 'warm', 'water', 'what', 'would', 'wrong', 'yes',
    'yoghurt', 'your'
]

# -----------------------------
# CAMERA
# -----------------------------
cap = cv2.VideoCapture(0)

cap.set(3, 1240)
cap.set(4, 780)

# -----------------------------
# SENTENCE VARIABLES
# -----------------------------
sentence = []

last_letter = ""
last_detection_time = 0

# Minimum confidence
CONF_THRESHOLD = 0.10

# Same sign must remain stable for this long
STABLE_TIME = 0.8

# -----------------------------
# MAIN LOOP
# -----------------------------
while True:

    success, img = cap.read()

    if not success:
        print("Camera failed")
        break

    detected_letter = None
    highest_conf = 0

    results = model(img, stream=True, verbose=False)

    for p in results:

        boxes = p.boxes

        for box in boxes:

            x1, y1, x2, y2 = box.xyxy[0]

            x1 = int(x1)
            y1 = int(y1)
            x2 = int(x2)
            y2 = int(y2)

            conf = float(box.conf[0])

            cls = int(box.cls[0])

            # Only accept confident detections
            if conf >= CONF_THRESHOLD:

                # Keep highest-confidence detection
                if conf > highest_conf:

                    highest_conf = conf
                    detected_letter = classNames[cls]

                cv2.rectangle(
                    img,
                    (x1, y1),
                    (x2, y2),
                    (255, 2, 27),
                    3
                )

                cvzone.putTextRect(
                    img,
                    f"{classNames[cls]} {conf:.2f}",
                    (x1, max(35, y1)),
                    colorT=(255, 255, 255),
                    colorR=(255, 2, 27),
                    scale=0.8,
                    thickness=3
                )

    # -----------------------------
    # ADD STABLE SIGN TO SENTENCE
    # -----------------------------

    current_time = time.time()

    if detected_letter is not None:

        # New detection
        if detected_letter != last_letter:

            last_letter = detected_letter
            last_detection_time = current_time

        # Same detection remained stable
        elif current_time - last_detection_time >= STABLE_TIME:

            # Don't add same sign repeatedly
            if len(sentence) == 0 or sentence[-1] != detected_letter:

                sentence.append(detected_letter)

            # Reset timer
            last_detection_time = current_time

    # -----------------------------
    # DISPLAY SENTENCE
    # -----------------------------

    sentence_text = " ".join(sentence)

    cvzone.putTextRect(
        img,
        f"Sentence: {sentence_text}",
        (50, 50),
        scale=1.5,
        thickness=3
    )

    # Current detection
    if detected_letter:

        cvzone.putTextRect(
            img,
            f"Detected: {detected_letter}",
            (50, 110),
            scale=1.2,
            thickness=3
        )

    # Instructions
    cvzone.putTextRect(
        img,
        "Q = Quit | C = Clear",
        (50, 670),
        scale=1,
        thickness=2
    )

    cv2.imshow("ISL Sign Language Detection", img)

    key = cv2.waitKey(1) & 0xFF

    # Quit
    if key == ord('q'):
        break

    # Clear sentence
    if key == ord('c'):
        sentence = []
        last_letter = ""


cap.release()
cv2.destroyAllWindows()