#!/usr/bin/env python3
"""
Visualize YOLO detection on images.jpeg
"""
import cv2
from ultralytics import YOLO
import os

print("🔍 Analyzing images.jpeg with YOLO model...\n")

# Load model
MODEL_PATH = "../model/best.pt"
IMAGE_PATH = "images.jpg"

if not os.path.exists(MODEL_PATH):
    print(f"❌ Model not found: {MODEL_PATH}")
    exit(1)

if not os.path.exists(IMAGE_PATH):
    print(f"❌ Image not found: {IMAGE_PATH}")
    exit(1)

print(f"✅ Loading model: {MODEL_PATH}")
model = YOLO(MODEL_PATH)

print(f"✅ Loading image: {IMAGE_PATH}")
img = cv2.imread(IMAGE_PATH)

if img is None:
    print("❌ Could not read image")
    exit(1)

print(f"📸 Image size: {img.shape[1]}x{img.shape[0]}\n")

# Run inference with different confidence thresholds
print("="*60)
print("Testing different confidence thresholds:")
print("="*60)

for conf_threshold in [0.1, 0.2, 0.3, 0.4, 0.5]:
    print(f"\n🔍 Threshold: {conf_threshold}")
    results = model(img, conf=conf_threshold, verbose=False)
    
    detections = 0
    for result in results:
        if result.boxes is not None and len(result.boxes) > 0:
            detections = len(result.boxes)
            for box in result.boxes:
                conf = float(box.conf[0])
                class_id = int(box.cls[0])
                class_name = model.names[class_id]
                print(f"   ✅ Detected: {class_name} (confidence: {conf:.2%})")
    
    if detections == 0:
        print(f"   ❌ No detections")

print("\n" + "="*60)
print("Running inference with visualization...")
print("="*60)

# Run with lowest threshold to see anything
results = model(img, conf=0.1, verbose=False)

# Draw results
annotated = results[0].plot()

# Save annotated image
output_path = "images_detected.jpg"
cv2.imwrite(output_path, annotated)

print(f"\n✅ Saved visualization: {output_path}")
print("💡 Open this file to see what YOLO detected")

# Display image info
print(f"\n📊 Image Analysis:")
print(f"   Size: {img.shape[1]}x{img.shape[0]}")
print(f"   Channels: {img.shape[2] if len(img.shape) > 2 else 1}")
print(f"   Mean brightness: {img.mean():.1f}")
print(f"   Min/Max: {img.min()}/{img.max()}")

# Check if image is too dark
if img.mean() < 50:
    print("\n⚠️  WARNING: Image is very dark!")
    print("   Try with better lighting")

# Check if image is too small
if img.shape[0] < 480 or img.shape[1] < 640:
    print("\n⚠️  WARNING: Image is quite small!")
    print("   Model trained on larger images may not work well")

print("\n" + "="*60)
print("Summary:")
if len(results[0].boxes) == 0:
    print("❌ NO DETECTIONS at any confidence level")
    print("\nPossible reasons:")
    print("  1. No hand visible in image")
    print("  2. Image quality too poor")
    print("  3. Sign not in training data")
    print("  4. Hand too small in frame")
    print("  5. Model needs retraining")
else:
    print("✅ Found detections! Check images_detected.jpg")
print("="*60)