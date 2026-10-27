"""
Ingest Kaggle mohitsingh1804/plantvillage into Agro-Haat ML Dataset.
Extracts high-resolution images, standardizes class names,
rebalances datasets, and prevents train/val/test leakage.
"""

import os
import shutil
import random
from pathlib import Path
from PIL import Image

KAGGLE_PATH = Path(r"C:\Users\rasto\.cache\kagglehub\datasets\mohitsingh1804\plantvillage\versions\1\PlantVillage")
DATA_DIR = Path(__file__).resolve().parent / "data"
RAW_DIR = DATA_DIR / "raw"
TRAIN_DIR = DATA_DIR / "train"
VAL_DIR = DATA_DIR / "val"
TEST_DIR = DATA_DIR / "test"

# Mapping Kaggle class folder names to AgroHaat canonical class names
CLASS_MAP = {
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": "Corn_(maize)___Cercospora_leaf_spot_Gray_leaf_spot",
    "Corn_(maize)___Common_rust_": "Corn_(maize)___Common_rust_",
    "Corn_(maize)___Northern_Leaf_Blight": "Corn_(maize)___Northern_Leaf_Blight",
    "Corn_(maize)___healthy": "Corn_(maize)___healthy",
    "Pepper,_bell___Bacterial_spot": "Pepper__bell___Bacterial_spot",
    "Pepper,_bell___healthy": "Pepper__bell___healthy",
    "Potato___Early_blight": "Potato___Early_blight",
    "Potato___Late_blight": "Potato___Late_blight",
    "Potato___healthy": "Potato___healthy",
    "Tomato___Bacterial_spot": "Tomato___Bacterial_spot",
    "Tomato___Early_blight": "Tomato___Early_blight",
    "Tomato___Late_blight": "Tomato___Late_blight",
    "Tomato___Leaf_Mold": "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot": "Tomato___Septoria_leaf_spot",
    "Tomato___Target_Spot": "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus": "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy": "Tomato___healthy"
}

def ingest():
    print(f"Reading Kaggle PlantVillage from: {KAGGLE_PATH}")
    random.seed(42)

    # For each mapped class, gather images from train and val in Kaggle
    for kaggle_cls, target_cls in CLASS_MAP.items():
        target_raw = RAW_DIR / target_cls
        target_raw.mkdir(parents=True, exist_ok=True)

        candidate_files = []
        for split in ["train", "val"]:
            cls_dir = KAGGLE_PATH / split / kaggle_cls
            if cls_dir.exists():
                candidate_files.extend(list(cls_dir.glob("*.jpg")) + list(cls_dir.glob("*.JPG")) + list(cls_dir.glob("*.png")))

        print(f"Found {len(candidate_files)} images for {target_cls}")
        
        # Select up to 180 images per class for balanced, high-speed training on RTX 2050
        sample_count = min(180, len(candidate_files))
        selected = random.sample(candidate_files, sample_count)

        copied = 0
        for i, fpath in enumerate(selected):
            dest = target_raw / f"kaggle_{i:04d}_{fpath.name}"
            if not dest.exists():
                shutil.copy2(fpath, dest)
                copied += 1

        print(f" -> Added {copied} images to {target_cls}")

    print("\nRebuilding Train (70%), Val (15%), Test (15%) splits...")
    for split_dir in [TRAIN_DIR, VAL_DIR, TEST_DIR]:
        if split_dir.exists():
            shutil.rmtree(split_dir)
        split_dir.mkdir(parents=True, exist_ok=True)

    summary = {"train": {}, "val": {}, "test": {}, "total": {}}

    for cls_dir in sorted(RAW_DIR.iterdir()):
        if not cls_dir.is_dir():
            continue
        cls_name = cls_dir.name
        img_files = list(cls_dir.glob("*.jpg")) + list(cls_dir.glob("*.JPG")) + list(cls_dir.glob("*.png"))
        
        # Verify valid images
        valid_files = []
        for f in img_files:
            try:
                with Image.open(f) as img:
                    img.verify()
                valid_files.append(f)
            except Exception:
                pass

        random.shuffle(valid_files)
        n = len(valid_files)
        n_train = int(n * 0.70)
        n_val = int(n * 0.15)
        
        splits = {
            "train": valid_files[:n_train],
            "val": valid_files[n_train:n_train+n_val],
            "test": valid_files[n_train+n_val:]
        }

        for s_name, s_files in splits.items():
            dest_dir = (DATA_DIR / s_name) / cls_name
            dest_dir.mkdir(parents=True, exist_ok=True)
            for f in s_files:
                shutil.copy2(f, dest_dir / f.name)
            summary[s_name][cls_name] = len(s_files)

        summary["total"][cls_name] = n
        print(f"{cls_name}: Total {n} (Train: {len(splits['train'])}, Val: {len(splits['val'])}, Test: {len(splits['test'])})")

    import json
    sum_path = DATA_DIR / "dataset_summary.json"
    with open(sum_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    total_train = sum(summary["train"].values())
    total_val = sum(summary["val"].values())
    total_test = sum(summary["test"].values())
    print(f"\nDataset Preparation Complete!")
    print(f"Total Images: {total_train + total_val + total_test}")
    print(f"Train: {total_train} | Val: {total_val} | Test: {total_test}")

if __name__ == "__main__":
    ingest()
