#!/usr/bin/env python3
"""Test the annotated debug image"""

import cv2
from ultralytics import YOLO

# Load model
model = YOLO("../model/best.pt")

# Test the annotated image
img = cv2.imread("debug_annotated.jpg")
if img is None:
    print("❌ debug_annotated.jpg not found")
    exit(1)

print(f"📐 Image shape: {img.shape}")

# Run inference
print("\n🔍 Testing debug_annotated.jpg:")
results = model(img, conf=0.1, verbose=False)

for result in results:
    if hasattr(result, 'boxes') and result.boxes is not None:
        boxes = result.boxes
        print(f"  Found {len(boxes)} detections:")
        for i, box in enumerate(boxes):
            conf = float(box.conf[0])
            class_id = int(box.cls[0])
            class_name = model.names[class_id]
            print(f"    [{i}] {class_name}: {conf:.2f}")
    else:
        print("  No detections found")
