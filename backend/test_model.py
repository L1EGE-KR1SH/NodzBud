#!/usr/bin/env python3
"""Test script to verify YOLO model is working correctly"""

import cv2
from ultralytics import YOLO
import os

# Load model
MODEL_PATH = "../model/best.pt"
print(f"Loading model from: {MODEL_PATH}")
model = YOLO(MODEL_PATH)
print(f"✅ Model loaded successfully")
print(f"📋 Classes: {list(model.names.values())}")

# Test with debug image
DEBUG_IMAGE = "debug_last_frame.jpg"
if os.path.exists(DEBUG_IMAGE):
    print(f"\n🔍 Testing with {DEBUG_IMAGE}...")
    img = cv2.imread(DEBUG_IMAGE)
    print(f"📐 Image shape: {img.shape}")
    
    # Run inference with low confidence
    results = model(img, conf=0.1, verbose=True)
    
    print(f"\n📊 Detection Results:")
    for result in results:
        if hasattr(result, 'boxes') and result.boxes is not None:
            boxes = result.boxes
            print(f"  Found {len(boxes)} detections")
            for i, box in enumerate(boxes):
                conf = float(box.conf[0])
                class_id = int(box.cls[0])
                class_name = model.names[class_id]
                print(f"  [{i}] {class_name}: {conf:.2f}")
        else:
            print("  No detections found")
    
    # Save annotated image
    annotated = results[0].plot()
    cv2.imwrite("debug_annotated.jpg", annotated)
    print(f"\n💾 Saved annotated image to: debug_annotated.jpg")
else:
    print(f"❌ {DEBUG_IMAGE} not found. Make sure to capture a frame first.")
