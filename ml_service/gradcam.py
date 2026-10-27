"""
PyTorch Grad-CAM (Gradient-weighted Class Activation Mapping) Implementation
Generates high-resolution saliency heatmaps highlighting diseased leaf lesions.
Works seamlessly with ConvNeXt-Tiny and EfficientNet architectures.
"""

import base64
import io
import cv2
import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image

class GradCAM:
    def __init__(self, model: torch.nn.Module, target_layer: torch.nn.Module = None):
        self.model = model
        self.model.eval()
        self.target_layer = target_layer or self._find_target_layer()
        self.gradients = None
        self.activations = None
        self._hook_layers()

    def _find_target_layer(self):
        """Auto-detects the deepest feature convolutional block in the model."""
        if hasattr(self.model, "features"):
            # ConvNeXt, EfficientNet, DenseNet, VGG all use model.features
            return self.model.features[-1]
        elif hasattr(self.model, "layer4"):
            # ResNet family uses layer4
            return self.model.layer4[-1]
        else:
            # Fallback to the last convolutional module
            last_conv = None
            for module in self.model.modules():
                if isinstance(module, torch.nn.Conv2d):
                    last_conv = module
            if last_conv is not None:
                return last_conv
            raise ValueError("Could not automatically locate target convolutional layer in model.")

    def _hook_layers(self):
        def forward_hook(module, input, output):
            self.activations = output

        def backward_hook(module, grad_input, grad_output):
            self.gradients = grad_output[0]

        self.target_layer.register_forward_hook(forward_hook)
        self.target_layer.register_full_backward_hook(backward_hook)

    def generate(self, input_tensor: torch.Tensor, target_class: int = None) -> np.ndarray:
        """
        Computes Grad-CAM heatmap for a single input tensor of shape (1, 3, H, W).
        Returns a 2D numpy array with values in [0.0, 1.0].
        """
        self.model.zero_grad()
        output = self.model(input_tensor)

        if target_class is None:
            target_class = torch.argmax(output, dim=1).item()

        # Target class score
        score = output[0, target_class]
        score.backward(retain_graph=True)

        gradients = self.gradients.detach()
        activations = self.activations.detach()

        # Global average pooling of gradients across spatial dimensions (H, W)
        if gradients.dim() == 4:
            weights = torch.mean(gradients, dim=(2, 3), keepdim=True)
            cam = torch.sum(weights * activations, dim=1, keepdim=True)
        else:
            # For channel-last tensor layouts (e.g. some ConvNeXt variants)
            weights = torch.mean(gradients, dim=(1, 2), keepdim=True)
            cam = torch.sum(weights * activations, dim=-1, keepdim=True)

        # Apply ReLU to focus only on features that positively contribute to the class score
        cam = F.relu(cam)

        # Normalize between 0 and 1
        cam = cam.squeeze().cpu().numpy()
        cam_min, cam_max = np.min(cam), np.max(cam)
        if cam_max > cam_min:
            cam = (cam - cam_min) / (cam_max - cam_min)
        else:
            cam = np.zeros_like(cam)

        return cam

    def overlay_on_image(self, pil_image: Image.Image, cam: np.ndarray, alpha: float = 0.5) -> dict:
        """
        Overlays the 2D CAM heatmap on top of the original PIL image.
        Returns:
          - overlay_pil: PIL image with color blended heatmap
          - overlay_base64: Base64 data URL for instant HTML/Web display
          - hotspot_bbox: [x, y, w, h] bounding box around primary lesion hotspot
        """
        orig_w, orig_h = pil_image.size
        # Resize CAM to match original image dimensions
        cam_resized = cv2.resize(cam, (orig_w, orig_h), interpolation=cv2.INTER_LINEAR)
        cam_uint8 = np.uint8(255 * cam_resized)

        # Apply JET colormap (Red = high attention/lesion, Blue = background)
        heatmap = cv2.applyColorMap(cam_uint8, cv2.COLORMAP_JET)
        heatmap_rgb = cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB)

        # Blend with original image
        orig_np = np.array(pil_image.convert('RGB'))
        blended = np.uint8(alpha * heatmap_rgb + (1 - alpha) * orig_np)
        overlay_pil = Image.fromarray(blended)

        # Compute hotspot bounding box (thresholding highest activation >= 0.6)
        _, thresh = cv2.threshold(cam_uint8, 150, 255, cv2.THRESH_BINARY)
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        hotspot_bbox = None
        if contours:
            largest_c = max(contours, key=cv2.contourArea)
            if cv2.contourArea(largest_c) > 100:
                x, y, w, h = cv2.boundingRect(largest_c)
                hotspot_bbox = {
                    "x": int(x), "y": int(y), "w": int(w), "h": int(h),
                    "relative_x": round(x / orig_w, 3),
                    "relative_y": round(y / orig_h, 3),
                    "relative_w": round(w / orig_w, 3),
                    "relative_h": round(h / orig_h, 3)
                }

        # Convert to base64
        buf = io.BytesIO()
        overlay_pil.save(buf, format="JPEG", quality=85)
        base64_str = base64.b64encode(buf.getvalue()).decode("utf-8")
        data_url = f"data:image/jpeg;base64,{base64_str}"

        return {
            "overlay_pil": overlay_pil,
            "base64": data_url,
            "hotspot_bbox": hotspot_bbox
        }
