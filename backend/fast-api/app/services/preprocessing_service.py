import cv2
import numpy as np
import base64
import io
from PIL import Image
import torch
from torchvision import transforms

class PreprocessingService:
    def __init__(self, target_size=(224, 224)):
        self.target_size = target_size
        self.transform = transforms.Compose([
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])

    def _cv2_to_base64(self, img_bgr_or_rgb, is_rgb=False) -> str:
        if is_rgb:
            img_bgr = cv2.cvtColor(img_bgr_or_rgb, cv2.COLOR_RGB2BGR)
        else:
            img_bgr = img_bgr_or_rgb
        _, buffer = cv2.imencode('.png', img_bgr)
        b64_str = base64.b64encode(buffer).decode('utf-8')
        return f"data:image/png;base64,{b64_str}"

    def process_image(self, image_bytes: bytes):
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Could not decode valid image from bytes.")

        h, w = img.shape[:2]

        # 1. Original RGB
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        stage1_b64 = self._cv2_to_base64(img_rgb, is_rgb=True)

        # 2. Grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        gray_bgr = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)
        stage2_b64 = self._cv2_to_base64(gray_bgr)

        # 3. Gaussian Blur & maxLoc
        blurred = cv2.GaussianBlur(gray, (15, 15), 0)
        _, _, _, maxLoc = cv2.minMaxLoc(blurred)
        x, y = maxLoc

        blurred_marked = cv2.cvtColor(blurred, cv2.COLOR_GRAY2BGR)
        cv2.circle(blurred_marked, (x, y), max(10, int(min(h, w) * 0.02)), (0, 0, 255), -1)
        stage3_b64 = self._cv2_to_base64(blurred_marked)

        # 4. Crop ROI
        crop_size = min(300, min(h, w) // 2)
        x1, y1 = max(0, x - crop_size), max(0, y - crop_size)
        x2, y2 = min(w, x + crop_size), min(h, y + crop_size)
        roi = img[y1:y2, x1:x2]
        if roi.size == 0:
            roi = img
        stage4_b64 = self._cv2_to_base64(roi)

        # 5. CLAHE on L-channel in LAB space
        lab = cv2.cvtColor(roi, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        cl = clahe.apply(l)
        cl_bgr = cv2.cvtColor(cl, cv2.COLOR_GRAY2BGR)
        stage5_b64 = self._cv2_to_base64(cl_bgr)

        # 6. Re-merge LAB & Resize to target 224x224
        merged = cv2.merge((cl, a, b))
        enhanced_bgr = cv2.cvtColor(merged, cv2.COLOR_LAB2BGR)
        resized_bgr = cv2.resize(enhanced_bgr, self.target_size)
        resized_rgb = cv2.cvtColor(resized_bgr, cv2.COLOR_BGR2RGB)
        stage6_b64 = self._cv2_to_base64(resized_rgb, is_rgb=True)

        # Convert to PyTorch Tensor
        tensor = self.transform(resized_rgb).unsqueeze(0)

        stages = [
            {"title": "1. Original Fundus", "description": "Raw RGB retinal fundus capture", "image_base64": stage1_b64},
            {"title": "2. 2D Grayscale", "description": "Luminance intensity conversion", "image_base64": stage2_b64},
            {"title": "3. Optic Disc Centroid", "description": f"Gaussian Blur & maxLoc peak detection at ({x}, {y})", "image_base64": stage3_b64},
            {"title": "4. Cropped Optic Disc ROI", "description": f"Targeted bounding box [{x1}:{x2}, {y1}:{y2}]", "image_base64": stage4_b64},
            {"title": "5. CLAHE Enhancement", "description": "Contrast Limited Adaptive Histogram Equalization on L-channel", "image_base64": stage5_b64},
            {"title": "6. Standardized Input Tensor", "description": "Resized 224x224 RGB tensor with ImageNet normalization", "image_base64": stage6_b64},
        ]

        return tensor, stages, [h, w], [x1, y1, x2, y2], [x, y]

preprocessing_service = PreprocessingService()
