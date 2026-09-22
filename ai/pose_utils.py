"""
SafeSight AI - Pose and Head Protection Analysis Utilities
Extracts keypoint coordinates from YOLOv8-pose predictions and computes
head/helmet bounding regions to evaluate worker PPE compliance.
"""

import cv2
import numpy as np


def extract_head_region(keypoints, frame_shape, bbox=None):
    """
    Given 17 COCO pose keypoints (x, y, conf), computes the head bounding box.
    Keypoints:
        0: Nose
        1: Left Eye, 2: Right Eye
        3: Left Ear, 4: Right Ear
        5: Left Shoulder, 6: Right Shoulder
    """
    h_img, w_img = frame_shape[:2]
    
    # Check head keypoints
    head_pts = []
    for idx in [0, 1, 2, 3, 4]:
        if idx < len(keypoints):
            pt = keypoints[idx]
            conf = pt[2] if len(pt) > 2 else 1.0
            if conf > 0.3:
                head_pts.append((float(pt[0]), float(pt[1])))
                
    if len(head_pts) >= 2:
        xs = [p[0] for p in head_pts]
        ys = [p[1] for p in head_pts]
        
        min_x, max_x = min(xs), max(xs)
        min_y, max_y = min(ys), max(ys)
        
        # Calculate head width & estimate helmet dome height
        head_w = max(max_x - min_x, 30)
        padding_x = head_w * 0.45
        
        # Top of the helmet extends above eyes/ears
        head_h = head_w * 1.3
        top_y = min_y - (head_h * 0.75)
        bottom_y = min_y + (head_h * 0.45)
        
        x1 = max(0, int(min_x - padding_x))
        y1 = max(0, int(top_y))
        x2 = min(w_img, int(max_x + padding_x))
        y2 = min(h_img, int(bottom_y))
        
        return (x1, y1, x2, y2)
        
    elif bbox is not None:
        # Fallback to top 25% of the person's bounding box
        bx1, by1, bx2, by2 = bbox
        bw = bx2 - bx1
        bh = by2 - by1
        
        hx1 = max(0, int(bx1 + bw * 0.2))
        hx2 = min(w_img, int(bx2 - bw * 0.2))
        hy1 = max(0, int(by1))
        hy2 = min(h_img, int(by1 + bh * 0.25))
        return (hx1, hy1, hx2, hy2)
        
    return None


def analyze_helmet_color_and_texture(crop_bgr):
    """
    Analyzes cropped head region for safety helmet features:
    Standard industrial hard hats (Yellow, White, Orange, Blue, Red).
    Returns (has_helmet: bool, confidence: float, detected_color: str)
    """
    if crop_bgr is None or crop_bgr.size == 0:
        return False, 0.0, "Unknown"
        
    h, w = crop_bgr.shape[:2]
    if h < 10 or w < 10:
        return False, 0.0, "Unknown"
        
    # Inspect top 65% of the head crop (the helmet dome)
    dome_crop = crop_bgr[:int(h * 0.65), :]
    if dome_crop.size == 0:
        return False, 0.0, "Unknown"

    hsv = cv2.cvtColor(dome_crop, cv2.COLOR_BGR2HSV)
    total_pixels = dome_crop.shape[0] * dome_crop.shape[1]
    
    # Color ranges for industrial safety hard hats
    # 1. Yellow Hard Hat
    yellow_mask = cv2.inRange(hsv, np.array([18, 70, 80]), np.array([35, 255, 255]))
    
    # 2. White Hard Hat (High Brightness, Low Saturation)
    white_mask = cv2.inRange(hsv, np.array([0, 0, 160]), np.array([180, 50, 255]))
    
    # 3. Orange / Red Hard Hat
    orange_mask = cv2.inRange(hsv, np.array([5, 80, 100]), np.array([17, 255, 255]))
    red_mask1 = cv2.inRange(hsv, np.array([0, 100, 100]), np.array([5, 255, 255]))
    red_mask2 = cv2.inRange(hsv, np.array([170, 100, 100]), np.array([180, 255, 255]))
    
    # 4. Blue Hard Hat
    blue_mask = cv2.inRange(hsv, np.array([95, 80, 70]), np.array([130, 255, 255]))
    
    yellow_pct = np.count_nonzero(yellow_mask) / total_pixels
    white_pct = np.count_nonzero(white_mask) / total_pixels
    orange_pct = (np.count_nonzero(orange_mask) + np.count_nonzero(red_mask1) + np.count_nonzero(red_mask2)) / total_pixels
    blue_pct = np.count_nonzero(blue_mask) / total_pixels
    
    color_matches = {
        "Yellow Hard Hat": yellow_pct,
        "White Hard Hat": white_pct,
        "Orange Hard Hat": orange_pct,
        "Blue Hard Hat": blue_pct,
    }
    
    best_color = max(color_matches, key=color_matches.get)
    best_score = color_matches[best_color]
    
    # If bright helmet color occupies >= 18% of the dome area
    if best_score >= 0.18:
        conf = min(0.98, 0.65 + (best_score * 0.8))
        return True, float(conf), best_color
    
    # Smoothness / Edge check for smooth rounded hard hat shell
    gray = cv2.cvtColor(dome_crop, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    edge_density = np.count_nonzero(edges) / total_pixels
    
    # High specular highlights typical for glossy plastic shells
    _, bright_thresh = cv2.threshold(gray, 210, 255, cv2.THRESH_BINARY)
    bright_ratio = np.count_nonzero(bright_thresh) / total_pixels
    
    if bright_ratio > 0.20 and edge_density < 0.25:
        return True, 0.82, "Safety Cap (Reflective)"
        
    return False, float(1.0 - best_score), "None"
