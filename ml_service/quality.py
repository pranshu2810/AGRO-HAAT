"""
Image Quality Assessment Module
Checks image resolution, blurriness (Laplacian variance), and illumination/exposure.
Prevents models from making unreliable predictions on blurry, pitch-black, or overexposed photos.
"""

import numpy as np
from PIL import Image
import cv2

class ImageQualityChecker:
    def __init__(self, min_resolution=(128, 128), blur_threshold=40.0, low_exp_threshold=25.0, high_exp_threshold=240.0):
        self.min_resolution = min_resolution
        self.blur_threshold = blur_threshold
        self.low_exp_threshold = low_exp_threshold
        self.high_exp_threshold = high_exp_threshold

    def check(self, pil_image: Image.Image) -> dict:
        """
        Evaluates image quality.
        Returns a dict with:
          - is_acceptable: bool
          - blur_score: float (Laplacian variance; higher is sharper)
          - brightness_score: float (mean gray pixel value 0-255)
          - resolution: (width, height)
          - issues: list of human-readable warnings
        """
        issues = []
        warnings = []
        width, height = pil_image.size

        # 1. Resolution check
        if width < self.min_resolution[0] or height < self.min_resolution[1]:
            issues.append(f"Image resolution too low ({width}x{height}). Minimum required is {self.min_resolution[0]}x{self.min_resolution[1]}.")

        # Convert PIL to OpenCV BGR and Grayscale
        rgb_arr = np.array(pil_image.convert('RGB'))
        gray = cv2.cvtColor(rgb_arr, cv2.COLOR_RGB2GRAY)

        # 2. Sharpness / Blur check using Laplacian variance
        laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        if laplacian_var < self.blur_threshold:
            warnings.append(f"Image appears blurry or out of focus (sharpness score: {laplacian_var:.1f}, threshold: {self.blur_threshold}). Leaf lesions may not be clearly visible.")

        # 3. Brightness / Exposure check
        mean_brightness = float(np.mean(gray))
        if mean_brightness < self.low_exp_threshold:
            warnings.append(f"Image is underexposed/too dark (brightness: {mean_brightness:.1f}/255). Please ensure adequate lighting.")
        elif mean_brightness > self.high_exp_threshold:
            warnings.append(f"Image is overexposed/too bright with severe glare (brightness: {mean_brightness:.1f}/255).")

        # 4. Color / Greenery content check (leaves typically have green or brown hues)
        # Convert RGB to HSV
        hsv = cv2.cvtColor(rgb_arr, cv2.COLOR_RGB2HSV)
        # Plant foliage typically falls in HSV green (H 25-85) or dry/brown (H 10-25)
        leaf_mask = cv2.inRange(hsv, np.array([10, 20, 20]), np.array([90, 255, 255]))
        leaf_pixel_ratio = float(np.sum(leaf_mask > 0)) / float(width * height)

        if leaf_pixel_ratio < 0.05:
            warnings.append("Low organic leaf surface detected in photo. Please ensure leaf fills most of the frame.")

        is_acceptable = len(issues) == 0

        # Quality tier
        if len(issues) > 0:
            quality_tier = "Poor (Unacceptable)"
        elif len(warnings) > 1:
            quality_tier = "Moderate (Quality Warnings)"
        elif len(warnings) == 1:
            quality_tier = "Good (Minor Warning)"
        else:
            quality_tier = "Excellent (Clear & Sharp)"

        return {
            "is_acceptable": is_acceptable,
            "quality_tier": quality_tier,
            "sharpness_score": round(laplacian_var, 2),
            "brightness_score": round(mean_brightness, 2),
            "leaf_pixel_ratio": round(leaf_pixel_ratio, 3),
            "resolution": [width, height],
            "issues": issues,
            "warnings": warnings
        }
