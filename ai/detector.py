"""
SafeSight AI - Main Computer Vision Detection Engine
Implements YOLOv8 + Pose Estimation for Industrial PPE & Hard Hat Compliance.
"""

import os
import cv2
import time
import logging
import threading
from datetime import datetime
import numpy as np

# Suppress noisy ultralytics output
logging.getLogger("ultralytics").setLevel(logging.ERROR)
from ultralytics import YOLO
from ai.pose_utils import extract_head_region, analyze_helmet_color_and_texture

# Windows sound alarm
try:
    import winsound
    HAS_WINSOUND = True
except ImportError:
    HAS_WINSOUND = False


class SafeSightDetector:
    def __init__(self, models_dir=None, violations_dir=None):
        self.base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.models_dir = models_dir or os.path.join(self.base_dir, "models")
        self.violations_dir = violations_dir or os.path.join(self.base_dir, "static", "violations")
        os.makedirs(self.violations_dir, exist_ok=True)
        
        self.save_cooldown = 4.0  # seconds between violation saves
        self.last_saved_time = 0
        self.alarm_enabled = True
        
        # Live session metrics
        self.lock = threading.Lock()
        self.stats = {
            "total_workers": 0,
            "compliant_count": 0,
            "violations_today": 0,
            "compliance_rate": 100.0,
            "fps": 0.0,
            "last_violation_time": None
        }
        
        self._load_models()

    def _load_models(self):
        """Loads YOLOv8 object and pose estimation models."""
        pose_path = os.path.join(self.models_dir, "yolov8n-pose.pt")
        person_path = os.path.join(self.models_dir, "yolov8n.pt")
        custom_helmet_path = os.path.join(self.models_dir, "helmet.pt")
        
        # Fallbacks to root if needed
        if not os.path.exists(pose_path):
            pose_path = os.path.join(self.base_dir, "yolov8n-pose.pt")
        if not os.path.exists(person_path):
            person_path = os.path.join(self.base_dir, "yolov8n.pt")

        print(f"🔄 Loading YOLOv8 Person Model from: {person_path}")
        self.person_model = YOLO(person_path, verbose=False)
        
        print(f"🔄 Loading YOLOv8 Pose Model from: {pose_path}")
        self.pose_model = YOLO(pose_path, verbose=False) if os.path.exists(pose_path) else None
        
        if os.path.exists(custom_helmet_path):
            print(f"🎯 Loading Custom Helmet Model: {custom_helmet_path}")
            self.helmet_model = YOLO(custom_helmet_path, verbose=False)
        else:
            self.helmet_model = None

    def trigger_alarm(self):
        """Triggers audible alarm if enabled."""
        if not self.alarm_enabled:
            return
        def _beep():
            try:
                if HAS_WINSOUND:
                    winsound.Beep(2400, 400)
            except Exception:
                pass
        threading.Thread(target=_beep, daemon=True).start()

    def process_frame(self, frame):
        """
        Runs YOLOv8 & Pose detection on a frame.
        Returns:
            annotated_frame (numpy array)
            frame_detections (list of dicts)
            has_new_violation (bool)
        """
        if frame is None:
            return None, [], False
            
        t_start = time.time()
        h_img, w_img = frame.shape[:2]
        
        person_boxes = []
        # 1. Person Detection
        results = self.person_model(frame, verbose=False, conf=0.4)
        for r in results:
            if r.boxes is None:
                continue
            for box in r.boxes:
                if int(box.cls[0]) == 0:  # COCO class 0: person
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    conf = float(box.conf[0])
                    person_boxes.append(((x1, y1, x2, y2), conf))
                    
        # 2. Pose & Helmet Analysis
        detections = []
        violation_in_frame = False
        
        # If pose model is loaded, run pose prediction
        pose_results = self.pose_model(frame, verbose=False, conf=0.35) if self.pose_model else []
        keypoints_list = []
        for pr in pose_results:
            if pr.keypoints is not None and len(pr.keypoints.data) > 0:
                for kpts in pr.keypoints.data.cpu().numpy():
                    keypoints_list.append(kpts)
                    
        # Match each person with head / helmet state
        for i, (pbox, pconf) in enumerate(person_boxes):
            px1, py1, px2, py2 = pbox
            
            # Find closest matching pose keypoints (head inside person bbox)
            matched_kpts = None
            for kpts in keypoints_list:
                if len(kpts) > 0:
                    nose_x, nose_y = kpts[0][:2]
                    if px1 <= nose_x <= px2 and py1 <= nose_y <= py2:
                        matched_kpts = kpts
                        break
                        
            head_box = extract_head_region(matched_kpts if matched_kpts is not None else [], frame.shape, bbox=pbox)
            
            has_helmet = False
            helmet_type = "None"
            h_conf = 0.0
            
            # Custom helmet model if present
            if self.helmet_model is not None and head_box is not None:
                hx1, hy1, hx2, hy2 = head_box
                head_crop = frame[hy1:hy2, hx1:hx2]
                if head_crop.size > 0:
                    h_res = self.helmet_model(head_crop, verbose=False, conf=0.4)
                    for hr in h_res:
                        if hr.boxes and len(hr.boxes) > 0:
                            has_helmet = True
                            h_conf = float(hr.boxes[0].conf[0])
                            helmet_type = "Verified Hard Hat"
                            break

            # Pose + Color/Feature heuristic analysis
            if not has_helmet and head_box is not None:
                hx1, hy1, hx2, hy2 = head_box
                head_crop = frame[hy1:hy2, hx1:hx2]
                has_helmet, h_conf, helmet_type = analyze_helmet_color_and_texture(head_crop)
                
            is_compliant = has_helmet
            if not is_compliant:
                violation_in_frame = True
                
            detections.append({
                "worker_id": f"W-{400 + i}",
                "person_box": pbox,
                "head_box": head_box,
                "has_helmet": is_compliant,
                "helmet_type": helmet_type,
                "confidence": h_conf
            })

        # 3. Draw Annotations & Styling
        annotated = frame.copy()
        for d in detections:
            px1, py1, px2, py2 = d["person_box"]
            is_safe = d["has_helmet"]
            
            box_color = (46, 204, 113) if is_safe else (52, 73, 235)  # Green vs Red (BGR)
            label = f"SAFE - HELMET OK" if is_safe else "VIOLATION - NO HELMET"
            tag_color = (46, 204, 113) if is_safe else (52, 73, 235)
            
            # Worker Bounding Box
            cv2.rectangle(annotated, (px1, py1), (px2, py2), box_color, 2)
            
            # Corner accents
            corner_len = 16
            for (cx, cy, dx, dy) in [(px1, py1, 1, 1), (px2, py1, -1, 1), (px1, py2, 1, -1), (px2, py2, -1, -1)]:
                cv2.line(annotated, (cx, cy), (cx + dx * corner_len, cy), box_color, 3)
                cv2.line(annotated, (cx, cy), (cx, cy + dy * corner_len), box_color, 3)
                
            # Head/Helmet bounding box
            if d["head_box"]:
                hx1, hy1, hx2, hy2 = d["head_box"]
                h_color = (0, 255, 255) if is_safe else (0, 100, 255)
                cv2.rectangle(annotated, (hx1, hy1), (hx2, hy2), h_color, 1)
                
            # Label banner
            (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.55, 2)
            cv2.rectangle(annotated, (px1, py1 - th - 8), (px1 + tw + 12, py1), tag_color, -1)
            cv2.putText(annotated, label, (px1 + 6, py1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 2)
            
        # 4. Handle Violation Capture & Evidence Saving
        now = time.time()
        saved_filename = None
        if violation_in_frame and (now - self.last_saved_time > self.save_cooldown):
            timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
            saved_filename = f"violation_{timestamp_str}.jpg"
            save_path = os.path.join(self.violations_dir, saved_filename)
            cv2.imwrite(save_path, annotated)
            self.last_saved_time = now
            self.trigger_alarm()
            
            with self.lock:
                self.stats["violations_today"] += 1
                self.stats["last_violation_time"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                
            print(f"⚠️ SafeSight AI Captured Violation: {save_path}")

        # 5. Update Live Session Metrics
        elapsed = time.time() - t_start
        fps = 1.0 / max(elapsed, 0.001)
        total = len(detections)
        compliant = sum(1 for d in detections if d["has_helmet"])
        comp_rate = (compliant / total * 100.0) if total > 0 else 100.0
        
        with self.lock:
            self.stats["total_workers"] = total
            self.stats["compliant_count"] = compliant
            self.stats["compliance_rate"] = round(comp_rate, 1)
            self.stats["fps"] = round(fps, 1)
            
        # 6. HUD Overlay (Top-Left)
        hud_bg = (15, 23, 42)
        cv2.rectangle(annotated, (15, 15), (280, 85), hud_bg, -1)
        cv2.rectangle(annotated, (15, 15), (280, 85), (51, 65, 85), 1)
        cv2.putText(annotated, "SafeSight AI™ Monitor", (25, 38), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (56, 189, 248), 2)
        cv2.putText(annotated, f"Workers: {total} | Compliance: {comp_rate:.1f}%", (25, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (226, 232, 240), 1)
        cv2.putText(annotated, f"Engine: YOLOv8+Pose | FPS: {fps:.1f}", (25, 78), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (148, 163, 184), 1)

        return annotated, detections, (saved_filename is not None)

    def get_stats(self):
        """Thread-safe getter for dashboard stats."""
        with self.lock:
            return dict(self.stats)
