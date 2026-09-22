"""
SafeSight AI - Standalone Computer Vision Detector Runner
Run this script to launch real-time helmet & PPE monitoring via webcam or video feed.
"""

import sys
import os
import cv2

# Ensure project root is in python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from ai.detector import SafeSightDetector


def main():
    print("=" * 60)
    print("🚀 SafeSight AI™ - Industrial Safety Surveillance Engine")
    print("=" * 60)
    print("Press 'Q' on the video window to stop monitoring.\n")

    detector = SafeSightDetector()
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("⚠️ Webcam 0 not detected, switching to fallback test video/image...")
        test_img = cv2.imread("bus.jpg")
        if test_img is not None:
            annotated, detections, is_viol = detector.process_frame(test_img)
            cv2.imshow("SafeSight AI Monitor (Test Frame)", annotated)
            cv2.waitKey(0)
            cv2.destroyAllWindows()
            return
        else:
            print("❌ No video source available.")
            return

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        annotated, detections, has_violation = detector.process_frame(frame)
        cv2.imshow("SafeSight AI Monitor (Press Q to quit)", annotated)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    print("✅ SafeSight AI stopped successfully.")


if __name__ == "__main__":
    main()