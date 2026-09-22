# ==============================
# SafeSight AI Prototype
# ==============================

import os
import cv2
import time
import winsound
import logging
from datetime import datetime
from ultralytics import YOLO

# ==============================
# CONFIG
# ==============================
STOP_FILE = "stop_signal.txt"
SAVE_COOLDOWN = 5  # seconds between evidence saves
last_saved_time = 0

# Silence YOLO logs
logging.getLogger("ultralytics").setLevel(logging.ERROR)

# Create violations folder
os.makedirs("static/violations", exist_ok=True)

# ==============================
# LOAD MODELS
# ==============================
print("🔄 Loading AI models...")
person_model = YOLO("yolov8n.pt", verbose=False)
helmet_model = YOLO("helmet.pt", verbose=False)

# ==============================
# START WEBCAM
# ==============================
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("❌ Webcam not found")
    exit()

print("🚀 SafeSight running... Press Q to quit")

# ==============================
# MAIN LOOP
# ==============================
while True:

    # 🛑 Stop signal check
    if os.path.exists(STOP_FILE):
        print("🛑 Stop signal received")
        break

    ret, frame = cap.read()
    if not ret:
        break

    # Run detection
    person_results = person_model(frame, verbose=False)
    helmet_results = helmet_model(frame, verbose=False)

    violation = False
    helmet_detected = False

    # ==============================
    # PERSON DETECTION LOOP
    # ==============================
    for r in person_results:
        boxes = r.boxes
        if boxes is None:
            continue

        for box in boxes:
            cls = int(box.cls[0])

            # YOLO class 0 = person
            if cls == 0:
                violation = True

                x1, y1, x2, y2 = map(int, box.xyxy[0])

                # Draw red violation box
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)

                cv2.putText(
                    frame,
                    "PERSON",
                    (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.7,
                    (0, 0, 255),
                    2,
                )

    # ==============================
    # HELMET DETECTION LOOP
    # ==============================
    for r in helmet_results:
        boxes = r.boxes
        if boxes is None:
            continue

        for box in boxes:
            helmet_detected = True

            x1, y1, x2, y2 = map(int, box.xyxy[0])

            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)

            cv2.putText(
                frame,
                "HELMET",
                (x1, y1 - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 255, 0),
                2,
            )

    # ==============================
    # SAVE + ALARM (FIXED LOGIC)
    # ==============================
    if violation and not helmet_detected:
        current_time = time.time()

        if current_time - last_saved_time > SAVE_COOLDOWN:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"static/violations/violation_{timestamp}.jpg"
            cv2.imwrite(filename, frame)

            # 🔊 Alarm
            winsound.Beep(2500, 500)

            last_saved_time = current_time
            print(f"⚠️ Evidence saved: {filename}")

    # ==============================
    # DISPLAY
    # ==============================
    cv2.imshow("SafeSight AI Monitor", frame)

    # Press Q to quit manually
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

# ==============================
# CLEANUP
# ==============================
cap.release()
cv2.destroyAllWindows()
print("✅ SafeSight stopped")