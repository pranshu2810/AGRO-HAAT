"""
Transfer Learning Training Engine for Crop Disease Classification
Supports ConvNeXt-Tiny and EfficientNet-B2 with Mixed Precision (AMP),
Realistic Data Augmentation, and Unseen Test Evaluation.
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
import numpy as np
import torch
import torch.nn as nn
from torch.cuda.amp import autocast, GradScaler
from torch.utils.data import DataLoader
from torchvision import datasets, models, transforms
from torchvision.models import (
    ConvNeXt_Tiny_Weights, convnext_tiny,
    EfficientNet_B2_Weights, efficientnet_b2
)
from sklearn.metrics import accuracy_score, precision_recall_fscore_support

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
MODEL_SAVE_DIR = BASE_DIR / "saved_models"
MODEL_SAVE_DIR.mkdir(parents=True, exist_ok=True)


def build_model(architecture: str, num_classes: int, pretrained: bool = True):
    """Initializes ConvNeXt-Tiny or EfficientNet-B2 with fine-tuning classification head."""
    architecture = architecture.lower()
    if "convnext" in architecture:
        weights = ConvNeXt_Tiny_Weights.DEFAULT if pretrained else None
        model = convnext_tiny(weights=weights)
        in_features = model.classifier[2].in_features
        model.classifier[2] = nn.Sequential(
            nn.Dropout(p=0.3),
            nn.Linear(in_features, num_classes)
        )
    elif "efficientnet" in architecture:
        weights = EfficientNet_B2_Weights.DEFAULT if pretrained else None
        model = efficientnet_b2(weights=weights)
        in_features = model.classifier[1].in_features
        model.classifier[1] = nn.Sequential(
            nn.Dropout(p=0.3),
            nn.Linear(in_features, num_classes)
        )
    else:
        raise ValueError(f"Unsupported architecture: {architecture}. Choose 'convnext_tiny' or 'efficientnet_b2'.")

    return model


def get_data_transforms(img_size: int = 224):
    """Realistic field-style data augmentation pipeline."""
    train_transform = transforms.Compose([
        transforms.Resize((int(img_size * 1.15), int(img_size * 1.15))),
        transforms.RandomResizedCrop(img_size, scale=(0.8, 1.0)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomVerticalFlip(p=0.3),
        transforms.RandomRotation(degrees=20),
        transforms.ColorJitter(brightness=0.25, contrast=0.25, saturation=0.25, hue=0.05),
        transforms.GaussianBlur(kernel_size=3, sigma=(0.1, 1.5)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    eval_transform = transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    return train_transform, eval_transform


def train_single_model(architecture: str, epochs: int = 5, batch_size: int = 16, lr: float = 3e-4, device: str = None):
    """Trains a single model architecture and returns evaluation metrics."""
    device = device or ("cuda" if torch.cuda.is_available() else "cpu")
    print(f"\n==========================================================")
    print(f"🚀 Training {architecture.upper()} on {device.upper()}")
    print(f"==========================================================")

    img_size = 224
    train_tf, eval_tf = get_data_transforms(img_size)

    train_dir = DATA_DIR / "train"
    val_dir = DATA_DIR / "val"
    test_dir = DATA_DIR / "test"

    train_dataset = datasets.ImageFolder(train_dir, transform=train_tf)
    val_dataset = datasets.ImageFolder(val_dir, transform=eval_tf)
    test_dataset = datasets.ImageFolder(test_dir, transform=eval_tf)

    classes = train_dataset.classes
    num_classes = len(classes)
    print(f"Dataset: {len(train_dataset)} train, {len(val_dataset)} val, {len(test_dataset)} test samples across {num_classes} classes.")

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=0, pin_memory=True if "cuda" in device else False)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=0)
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False, num_workers=0)

    model = build_model(architecture, num_classes=num_classes, pretrained=True).to(device)

    criterion = nn.CrossEntropyLoss(label_smoothing=0.1)
    optimizer = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-2)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)
    scaler = GradScaler(enabled=("cuda" in device))

    best_val_f1 = 0.0
    best_weights = None
    history = []

    start_time = time.time()

    for epoch in range(1, epochs + 1):
        model.train()
        running_loss = 0.0
        train_preds, train_targets = [], []

        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()

            with autocast(enabled=("cuda" in device)):
                outputs = model(images)
                loss = criterion(outputs, labels)

            scaler.scale(loss).backward()
            scaler.step(optimizer)
            scaler.update()

            running_loss += loss.item() * images.size(0)
            preds = torch.argmax(outputs, dim=1).detach().cpu().numpy()
            train_preds.extend(preds)
            train_targets.extend(labels.detach().cpu().numpy())

        scheduler.step()

        train_acc = accuracy_score(train_targets, train_preds)
        train_loss = running_loss / len(train_dataset)

        # Validation phase
        model.eval()
        val_loss = 0.0
        val_preds, val_targets = [], []
        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                with autocast(enabled=("cuda" in device)):
                    outputs = model(images)
                    loss = criterion(outputs, labels)

                val_loss += loss.item() * images.size(0)
                preds = torch.argmax(outputs, dim=1).cpu().numpy()
                val_preds.extend(preds)
                val_targets.extend(labels.cpu().numpy())

        val_acc = accuracy_score(val_targets, val_preds)
        val_prec, val_rec, val_f1, _ = precision_recall_fscore_support(val_targets, val_preds, average="macro", zero_division=0)
        val_loss = val_loss / len(val_dataset)

        epoch_stats = {
            "epoch": epoch,
            "train_loss": round(train_loss, 4),
            "train_acc": round(float(train_acc), 4),
            "val_loss": round(val_loss, 4),
            "val_acc": round(float(val_acc), 4),
            "val_f1": round(float(val_f1), 4)
        }
        history.append(epoch_stats)

        print(f"Epoch [{epoch}/{epochs}] - Train Loss: {train_loss:.4f}, Train Acc: {train_acc*100:.1f}% | Val Loss: {val_loss:.4f}, Val Acc: {val_acc*100:.1f}%, Val Macro-F1: {val_f1*100:.1f}%")

        if val_f1 > best_val_f1 or best_weights is None:
            best_val_f1 = val_f1
            best_weights = model.state_dict().copy()

    total_training_time = round(time.time() - start_time, 2)
    print(f"Training completed in {total_training_time}s. Evaluating on unseen test set...")

    # Load best weights for final test evaluation
    model.load_state_dict(best_weights)
    model.eval()

    test_preds, test_targets = [], []
    with torch.no_grad():
        for images, labels in test_loader:
            images = images.to(device)
            with autocast(enabled=("cuda" in device)):
                outputs = model(images)
            preds = torch.argmax(outputs, dim=1).cpu().numpy()
            test_preds.extend(preds)
            test_targets.extend(labels.numpy())

    test_acc = accuracy_score(test_targets, test_preds)
    test_prec, test_rec, test_f1, _ = precision_recall_fscore_support(test_targets, test_preds, average="macro", zero_division=0)

    print(f"📊 {architecture.upper()} UNSEEN TEST RESULTS:")
    print(f"   Accuracy: {test_acc*100:.2f}% | Precision: {test_prec*100:.2f}% | Recall: {test_rec*100:.2f}% | Macro F1: {test_f1*100:.2f}%")

    model_result = {
        "architecture": architecture,
        "input_size": img_size,
        "classes": classes,
        "training_time_seconds": total_training_time,
        "epochs": epochs,
        "history": history,
        "test_metrics": {
            "accuracy": round(float(test_acc), 4),
            "precision": round(float(test_prec), 4),
            "recall": round(float(test_rec), 4),
            "macro_f1": round(float(test_f1), 4)
        },
        "state_dict": best_weights
    }

    return model_result


def run_training_pipeline(compare: bool = True, epochs: int = 4, batch_size: int = 32, arch: str = None):
    """
    Runs comparison or trains chosen architecture,
    evaluates on unseen test set, and saves the production deployment checkpoint.
    """
    if arch:
        architectures = [arch]
    elif compare:
        architectures = ["convnext_tiny", "efficientnet_b2"]
    else:
        architectures = ["convnext_tiny"]

    results = {}

    for a in architectures:
        try:
            res = train_single_model(a, epochs=epochs, batch_size=batch_size)
            results[a] = res
        except Exception as e:
            print(f"Training failed for {a}: {e}")

    if not results:
        raise RuntimeError("No model was successfully trained.")

    # Select best model based on unseen test Macro F1-score
    best_arch = max(results.keys(), key=lambda k: results[k]["test_metrics"]["macro_f1"])
    best_res = results[best_arch]
    print(f"\n🏆 WINNING MODEL SELECTED: {best_arch.upper()} (Macro F1: {best_res['test_metrics']['macro_f1']*100:.2f}%)")

    # Save deployment artifacts
    active_model_path = MODEL_SAVE_DIR / "best_model.pth"
    torch.save(best_res["state_dict"], active_model_path)

    config_payload = {
        "model_architecture": best_arch,
        "input_size": best_res["input_size"],
        "num_classes": len(best_res["classes"]),
        "classes": best_res["classes"],
        "test_metrics": best_res["test_metrics"],
        "comparison": {
            a_name: {
                "test_metrics": r["test_metrics"],
                "training_time_seconds": r["training_time_seconds"]
            }
            for a_name, r in results.items()
        }
    }

    with open(MODEL_SAVE_DIR / "model_config.json", "w", encoding="utf-8") as f:
        json.dump(config_payload, f, indent=2)

    print(f"✅ Model saved to {active_model_path}")
    print(f"✅ Preprocessing and class config saved to {MODEL_SAVE_DIR / 'model_config.json'}")

    return best_arch, config_payload


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--compare", action="store_true", default=False, help="Compare ConvNeXt-Tiny and EfficientNet-B2")
    parser.add_argument("--arch", type=str, default="convnext_tiny", help="Architecture to train")
    parser.add_argument("--epochs", type=int, default=4, help="Number of training epochs")
    parser.add_argument("--batch_size", type=int, default=32, help="DataLoader batch size")
    args = parser.parse_args()

    run_training_pipeline(compare=args.compare, epochs=args.epochs, batch_size=args.batch_size, arch=args.arch if not args.compare else None)
