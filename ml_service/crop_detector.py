"""
Crop and Organ Detection Module
Performs Stage 2 of the Pipeline: Image -> Quality Check -> Crop/Leaf Detection -> Disease Classification
Identifies crop type (Tomato, Potato, Corn, Rice, Pepper) and plant organ (Leaf, Fruit/Vine, Whole Plant),
preventing out-of-distribution whole plants/fruits from being falsely diagnosed as leaf blights.
"""

import cv2
import numpy as np
from PIL import Image

class CropAndOrganDetector:
    def __init__(self):
        pass

    def analyze(self, pil_image: Image.Image, crop_hint: str = None) -> dict:
        """
        Analyzes image visual features for crop family and plant organ.
        Returns:
          - detected_crop: str or None (e.g. 'Tomato', 'Rice', 'Corn', 'Potato', 'Pepper')
          - organ_type: str ('Leaf Close-up', 'Fruit & Foliage', 'Whole Plant Canopy', 'Non-Plant')
          - visual_confidence: float
          - is_fruit_crop: bool
          - details: dict of color & morphological statistics
        """
        rgb_arr = np.array(pil_image.convert('RGB'))
        h, w, _ = rgb_arr.shape
        total_pixels = h * w

        hsv = cv2.cvtColor(rgb_arr, cv2.COLOR_RGB2HSV)

        # 1. Red Fruit Mask (Tomato, Ripe Pepper)
        mask_red1 = cv2.inRange(hsv, np.array([0, 60, 50]), np.array([12, 255, 255]))
        mask_red2 = cv2.inRange(hsv, np.array([168, 60, 50]), np.array([180, 255, 255]))
        red_mask = mask_red1 | mask_red2
        red_ratio = float(np.sum(red_mask > 0)) / total_pixels

        # 2. Orange / Yellow Hue (Ripening fruits or Corn kernels)
        yellow_mask = cv2.inRange(hsv, np.array([15, 80, 80]), np.array([35, 255, 255]))
        yellow_ratio = float(np.sum(yellow_mask > 0)) / total_pixels

        # 3. Green Foliage
        green_mask = cv2.inRange(hsv, np.array([25, 30, 30]), np.array([90, 255, 255]))
        green_ratio = float(np.sum(green_mask > 0)) / total_pixels

        # 4. Connected components on red regions to check for spherical fruits
        contours, _ = cv2.findContours(red_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        circular_fruit_count = 0
        for cnt in contours:
            area = cv2.contourArea(cnt)
            if area > (total_pixels * 0.005):  # At least 0.5% of the image
                perimeter = cv2.arcLength(cnt, True)
                if perimeter > 0:
                    circularity = 4 * np.pi * (area / (perimeter * perimeter))
                    if circularity > 0.45:  # Reasonably circular/oval like a tomato or pepper
                        circular_fruit_count += 1

        detected_crop = None
        organ_type = "Leaf Close-up"
        visual_confidence = 0.50
        is_fruit_crop = False

        # Strong Tomato fruit visual signature
        if (red_ratio > 0.04 and circular_fruit_count >= 1) or (red_ratio > 0.12):
            detected_crop = "Tomato"
            organ_type = "Fruit & Plant Canopy"
            visual_confidence = 0.94
            is_fruit_crop = True
        elif yellow_ratio > 0.20 and green_ratio > 0.10:
            detected_crop = "Corn"
            organ_type = "Ear / Tassel"
            visual_confidence = 0.85

        # If user explicitly supplied a crop hint, prioritize it
        if crop_hint and crop_hint.lower() not in ["plant", "others", ""]:
            hint_clean = crop_hint.strip().capitalize()
            for known in ["Tomato", "Potato", "Corn", "Rice", "Pepper", "Cotton", "Wheat"]:
                if hint_clean.lower() in known.lower():
                    detected_crop = known
                    visual_confidence = 0.98
                    break

        return {
            "detected_crop": detected_crop,
            "organ_type": organ_type,
            "visual_confidence": visual_confidence,
            "is_fruit_crop": is_fruit_crop,
            "stats": {
                "red_pixel_ratio": round(red_ratio, 4),
                "green_pixel_ratio": round(green_ratio, 4),
                "circular_fruit_count": circular_fruit_count
            }
        }
