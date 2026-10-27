"""
Unseen Test Set Evaluation and Metric Generator
Computes genuine, reproducible metrics on completely unseen test data:
- Overall Accuracy
- Macro & Weighted Precision, Recall, F1-Score
- Per-class detailed breakdown
- Confusion Matrix (JSON & PNG heatmap artifact)
"""

import json
import os
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
import numpy as np
import torch
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
from sklearn.metrics import confusion_matrix, classification_report, accuracy_score, precision_recall_fscore_support
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

BASE_DIR = Path(__file__).resolve().parent
TEST_DIR = BASE_DIR / "data" / "test"
MODEL_DIR = BASE_DIR / "saved_models"
MODEL_PATH = MODEL_DIR / "best_model.pth"
CONFIG_PATH = MODEL_DIR / "model_config.json"


def evaluate_unseen_test_dataset(model_path: Path = MODEL_PATH, config_path: Path = CONFIG_PATH, test_dir: Path = TEST_DIR):
    """Evaluates the trained model against the unseen test set and outputs real metrics."""
    if not model_path.exists() or not config_path.exists():
        raise FileNotFoundError(f"Model or config not found in {MODEL_DIR}. Please run train.py first.")

    with open(config_path, "r", encoding="utf-8") as f:
        config = json.load(f)

    classes = config["classes"]
    architecture = config["model_architecture"]
    img_size = config.get("input_size", 224)
    device = "cuda" if torch.cuda.is_available() else "cpu"

    print(f"Loading {architecture.upper()} from {model_path} on {device.upper()}...")
    try:
        from .train import build_model
    except ImportError:
        import sys
        sys.path.append(str(BASE_DIR))
        from train import build_model
    model = build_model(architecture, num_classes=len(classes), pretrained=False)
    state_dict = torch.load(model_path, map_location=device)
    if isinstance(state_dict, dict) and "state_dict" in state_dict:
        model.load_state_dict(state_dict["state_dict"])
    else:
        model.load_state_dict(state_dict)

    model.to(device)
    model.eval()

    eval_transform = transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    test_dataset = datasets.ImageFolder(test_dir, transform=eval_transform)
    test_loader = DataLoader(test_dataset, batch_size=16, shuffle=False, num_workers=0)

    print(f"Evaluating {len(test_dataset)} unseen test images across {len(test_dataset.classes)} classes...")

    all_preds = []
    all_targets = []
    all_probs = []

    with torch.no_grad():
        for images, labels in test_loader:
            images = images.to(device)
            logits = model(images)
            probs = torch.softmax(logits, dim=1)
            preds = torch.argmax(probs, dim=1)

            all_preds.extend(preds.cpu().numpy())
            all_targets.extend(labels.numpy())
            all_probs.extend(probs.cpu().numpy())

    all_preds = np.array(all_preds)
    all_targets = np.array(all_targets)

    # 1. Overall Metrics
    acc = float(accuracy_score(all_targets, all_preds))
    macro_prec, macro_rec, macro_f1, _ = precision_recall_fscore_support(all_targets, all_preds, average="macro", zero_division=0)
    weighted_prec, weighted_rec, weighted_f1, _ = precision_recall_fscore_support(all_targets, all_preds, average="weighted", zero_division=0)

    # 2. Per-class Breakdown
    prec_per_cls, rec_per_cls, f1_per_cls, support_per_cls = precision_recall_fscore_support(
        all_targets, all_preds, labels=range(len(classes)), zero_division=0
    )

    per_class_metrics = {}
    for i, cls in enumerate(classes):
        per_class_metrics[cls] = {
            "precision": round(float(prec_per_cls[i]), 4),
            "recall": round(float(rec_per_cls[i]), 4),
            "f1_score": round(float(f1_per_cls[i]), 4),
            "support": int(support_per_cls[i])
        }

    # 3. Confusion Matrix
    cm = confusion_matrix(all_targets, all_preds, labels=range(len(classes)))

    # Save Confusion Matrix Heatmap Image
    plt.figure(figsize=(14, 12))
    short_labels = [c.replace("Tomato___", "Tom:").replace("Potato___", "Pot:").replace("Corn_(maize)___", "Corn:").replace("Rice___", "Rice:").replace("Pepper__bell___", "Pep:") for c in classes]
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", xticklabels=short_labels, yticklabels=short_labels)
    plt.xlabel("Predicted Class", fontsize=12, fontweight="bold")
    plt.ylabel("Ground Truth Class", fontsize=12, fontweight="bold")
    plt.title(f"Unseen Test Set Confusion Matrix - {architecture.upper()} (Accuracy: {acc*100:.2f}%)", fontsize=14, fontweight="bold")
    plt.xticks(rotation=45, ha="right", fontsize=9)
    plt.yticks(rotation=0, fontsize=9)
    plt.tight_layout()

    cm_image_path = MODEL_DIR / "confusion_matrix.png"
    plt.savefig(cm_image_path, dpi=200)
    plt.close()

    # Consolidated Real Metrics Report
    report = {
        "model_architecture": architecture,
        "test_dataset_size": len(test_dataset),
        "overall_metrics": {
            "accuracy": round(acc, 4),
            "macro_precision": round(float(macro_prec), 4),
            "macro_recall": round(float(macro_rec), 4),
            "macro_f1": round(float(macro_f1), 4),
            "weighted_precision": round(float(weighted_prec), 4),
            "weighted_recall": round(float(weighted_rec), 4),
            "weighted_f1": round(float(weighted_f1), 4)
        },
        "per_class_metrics": per_class_metrics,
        "confusion_matrix": cm.tolist(),
        "classes": classes,
        "short_labels": short_labels,
        "confusion_matrix_image": str(cm_image_path)
    }

    report_path = MODEL_DIR / "test_evaluation_report.json"
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print("\n========================================================")
    print(f"📊 UNSEEN TEST EVALUATION COMPLETE")
    print(f"   Accuracy: {acc*100:.2f}%")
    print(f"   Macro F1: {macro_f1*100:.2f}%")
    print(f"   Macro Precision: {macro_prec*100:.2f}%")
    print(f"   Macro Recall: {macro_rec*100:.2f}%")
    print(f"   Report saved: {report_path}")
    print(f"   Confusion matrix image: {cm_image_path}")
    print("========================================================\n")

    return report


if __name__ == "__main__":
    evaluate_unseen_test_dataset()
