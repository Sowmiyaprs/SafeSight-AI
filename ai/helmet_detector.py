import cv2
import os
from ultralytics import YOLO
from datetime import datetime

# Load YOLO model
model = YOLO("yolov8n.pt")

# Camera
cap = cv2.VideoCapture(0)

# Create violations folder
os.makedirs("static/violations", exist_ok=True)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    results = model(frame)

    for r in results:
        for box in r.boxes:
            cls = int(box.cls[0])
            label = model.names[cls]

            # Detect person riding bike (simple logic)
            if label == "person":

                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

                filename = f"static/violations/violation_{timestamp}.jpg"

                cv2.imwrite(filename, frame)

                print("Violation saved:", filename)

    cv2.imshow("Helmet Detection", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()