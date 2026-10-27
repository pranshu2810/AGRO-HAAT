"""
Agro-Haat AI 2.0 - High Performance Crop Disease Detection FastAPI Service
Integrates Image Quality Check, ConvNeXt-Tiny / EfficientNet-B2 Inference,
Grad-CAM Saliency Maps, Agronomic Treatment Protocols, and Environmental Correlation.
"""

import io
import json
import os
from pathlib import Path
from typing import Optional

import torch
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from PIL import Image

from .pipeline import DiseaseInferencePipeline
from .evaluate import evaluate_unseen_test_dataset

app = FastAPI(
    title="Agro-Haat AI 2.0 - Crop Pathology Vision & Treatment Engine",
    description="Transfer-learning powered crop disease diagnosis with Grad-CAM visual explanations and certified treatment protocols.",
    version="2.0.0"
)

# Allow CORS for Express backend and direct frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent
SAVED_MODELS_DIR = BASE_DIR / "saved_models"
MODEL_PATH = SAVED_MODELS_DIR / "best_model.pth"
CONFIG_PATH = SAVED_MODELS_DIR / "model_config.json"
REPORT_PATH = SAVED_MODELS_DIR / "test_evaluation_report.json"
CM_IMAGE_PATH = SAVED_MODELS_DIR / "confusion_matrix.png"

# Global inference pipeline
pipeline: Optional[DiseaseInferencePipeline] = None


@app.on_event("startup")
def startup_event():
    global pipeline
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Initializing Agro-Haat ML Service on {device.upper()}...")
    
    model_p = str(MODEL_PATH) if MODEL_PATH.exists() else None
    config_p = str(CONFIG_PATH) if CONFIG_PATH.exists() else None
    
    pipeline = DiseaseInferencePipeline(
        model_path=model_p,
        class_mapping_path=config_p,
        device=device,
        min_confidence_threshold=0.45
    )
    print("Inference pipeline initialized successfully.")


@app.get("/")
@app.get("/health")
def health_check():
    gpu_name = torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU"
    has_model = MODEL_PATH.exists()
    architecture = pipeline.model_name if pipeline else "None"
    classes_count = len(pipeline.classes) if pipeline else 0

    return {
        "status": "healthy",
        "service": "Agro-Haat Crop Pathology ML Service",
        "version": "2.0.0",
        "cuda_available": torch.cuda.is_available(),
        "device": gpu_name,
        "model_loaded": has_model,
        "model_architecture": architecture,
        "num_classes": classes_count,
        "supported_classes": pipeline.classes if pipeline else []
    }


@app.post("/predict")
async def predict_disease(
    image: UploadFile = File(...),
    crop_hint: Optional[str] = Form(None),
    temperature: Optional[float] = Form(None),
    humidity: Optional[float] = Form(None),
    season: Optional[str] = Form(None),
    soil_type: Optional[str] = Form(None),
    nitrogen_status: Optional[str] = Form(None)
):
    """
    Complete Multi-Modal Diagnostic Pipeline:
    1. Image Quality Assessment (Blur, Exposure, Resolution, Chlorophyll)
    2. Plant Organ & Fruit Identification
    3. Deep ConvNeXt Pathological Feature Extraction
    4. Rejection Check (Non-leaf / Low Confidence)
    5. Top-3 Candidate Ranking
    6. Grad-CAM Lesion Saliency Heatmap
    7. Multi-factor Weather, Soil, & Seasonal Pathological Synthesis
    8. Economic Threshold & Financial Loss Assessment (ROI Analysis)
    """
    global pipeline
    if pipeline is None:
        raise HTTPException(status_code=503, detail="Inference engine not ready.")

    # Read and validate image
    contents = await image.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Empty image file received.")

    try:
        pil_img = Image.open(io.BytesIO(contents))
        pil_img.load()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image format: {e}")

    env_data = {}
    if temperature is not None:
        env_data["temperature"] = temperature
    if humidity is not None:
        env_data["humidity"] = humidity
    if season:
        env_data["season"] = season
    if soil_type:
        env_data["soil_type"] = soil_type
    if nitrogen_status:
        env_data["nitrogen_status"] = nitrogen_status

    result = pipeline.predict(pil_img, env_data=env_data, crop_hint=crop_hint)
    return JSONResponse(content=result)


@app.get("/metrics")
def get_evaluation_metrics():
    """Returns genuine unseen test set evaluation metrics and per-class reports."""
    if not REPORT_PATH.exists():
        if CONFIG_PATH.exists():
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                cfg = json.load(f)
                return {
                    "status": "partial",
                    "model_architecture": cfg.get("model_architecture"),
                    "test_metrics": cfg.get("test_metrics"),
                    "comparison": cfg.get("comparison")
                }
        raise HTTPException(status_code=404, detail="Evaluation metrics report not generated yet. Run test evaluation first.")

    with open(REPORT_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    return data


@app.get("/confusion_matrix")
def get_confusion_matrix_image():
    """Serves the generated confusion matrix heatmap image."""
    if not CM_IMAGE_PATH.exists():
        raise HTTPException(status_code=404, detail="Confusion matrix image not found. Run evaluation first.")
    return FileResponse(str(CM_IMAGE_PATH), media_type="image/png")


@app.post("/evaluate")
def trigger_evaluation():
    """Triggers an on-demand evaluation over the unseen test set."""
    try:
        report = evaluate_unseen_test_dataset(model_path=MODEL_PATH, config_path=CONFIG_PATH)
        return {
            "success": True,
            "message": "Evaluation completed successfully on unseen test dataset.",
            "metrics": report["overall_metrics"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {e}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("ml_service.main:app", host="0.0.0.0", port=8000, reload=False)
