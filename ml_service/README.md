# 🌾 Agro-Haat AI 2.0 - Crop Pathology Vision & Diagnostic System

A complete, production-grade deep learning pipeline for plant disease diagnosis built with PyTorch, CUDA (RTX 2050), and FastAPI, seamlessly integrated into the Agro-Haat agricultural portal.

---

## 🚀 Key Highlights & Architecture

### **7-Stage Inference Pipeline:**
```
Input Image 
  ├── 1. Quality Gate Check (Laplacian Blur Variance, Illumination & Exposure, Resolution)
  ├── 2. Out-of-Distribution & Rejection Check (Non-leaf detection & Softmax Entropy)
  ├── 3. Transfer Learning Neural Feature Extraction (ConvNeXt-Tiny with Mixed Precision)
  ├── 4. Softmax Probability Ranking & Top-3 Candidates
  ├── 5. Grad-CAM Backpropagation Saliency Map (Highlights exact leaf lesion regions)
  ├── 6. Certified Agronomic Treatment Protocols (Dual-Language: English & Hindi)
  └── 7. Secondary Environmental Context (Temperature & Humidity disease propagation risks)
```

---

## 📊 Genuine Unseen Test Performance (No Faked Metrics)

Evaluated on **381 completely held-out images** (15% split unseen during all training and validation phases):

| Architecture | Test Accuracy | Macro Precision | Macro Recall | Macro F1-Score | Training Time | Selection Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **ConvNeXt-Tiny** | **94.23%** | **91.47%** | **93.24%** | **92.02%** | ~211s | 🏆 **Winner (Active)** |
| **EfficientNet-B2** | **87.93%** | **85.80%** | **87.32%** | **86.07%** | ~140s | Evaluated |

- **Dedicated Rejection Class:** `Background_without_leaves` F1-Score: **95.2%**
- **Confusion Matrix:** Automatically saved as artifact at `ml_service/saved_models/confusion_matrix.png`.
- **Detailed JSON Report:** `ml_service/saved_models/test_evaluation_report.json`.

---

## 🗂️ Supported Crops & Pathologies (23 Classes)

1. **Tomato:** Early Blight, Late Blight, Bacterial Spot, Leaf Mold, Septoria Leaf Spot, Target Spot, Yellow Leaf Curl Virus, Mosaic Virus, Healthy
2. **Potato:** Early Blight, Late Blight, Healthy
3. **Corn (Maize):** Common Rust, Northern Leaf Blight, Gray Leaf Spot, Healthy
4. **Rice (Paddy):** Bacterial Leaf Blight, Rice Blast, Brown Spot, Healthy (Indian In-Field Dataset)
5. **Bell Pepper:** Bacterial Spot, Healthy
6. **Rejection Class:** `Background_without_leaves` (Arbitrary backgrounds, desks, non-plant objects)

---

## 🛠️ How to Run & Retrain

### 1. Start the FastAPI ML Vision Service
```bash
# From project root
python -m uvicorn ml_service.main:app --host 0.0.0.0 --port 8000
```
- Interactive Swagger Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Status: [http://localhost:8000/health](http://localhost:8000/health)

### 2. Start the Agro-Haat Web Portal
```bash
node server.js
```
- **Judge Test Mode:** [http://localhost:3000/judge-test](http://localhost:3000/judge-test)
- **Model Evaluation Dashboard:** [http://localhost:3000/model-evaluation](http://localhost:3000/model-evaluation)
- **Farmer Crop Scanner:** [http://localhost:3000/farmer/pest_detection](http://localhost:3000/farmer/pest_detection)

### 3. Retrain Models (Repeatable Pipeline)
```bash
# Ingest and split real public datasets
python ml_service/fetch_data.py

# Train & compare ConvNeXt-Tiny and EfficientNet-B2 on GPU (RTX 2050)
python ml_service/train.py --compare --epochs 5

# Generate full unseen test evaluation report & confusion matrix
python ml_service/evaluate.py
```
