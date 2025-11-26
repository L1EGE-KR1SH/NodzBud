#!/usr/bin/env python3
"""Test both mirrored and non-mirrored versions"""

import cv2
from ultralytics import YOLO

# Load model
model = YOLO("../model/best.pt")

# Load the debug image
img = cv2.imread("debug_last_frame.jpg")
print(f"Original image shape: {img.shape}")

# Test WITHOUT mirroring
print("\n🔍 Testing WITHOUT mirroring:")
results1 = model(img, conf=0.1, verbose=False)
for result in results1:
    if hasattr(result, 'boxes') and result.boxes is not None:
        for box in result.boxes:
            conf = float(box.conf[0])
            class_id = int(box.cls[0])
            class_name = model.names[class_id]
            print(f"  ✓ {class_name}: {conf:.2f}")

# Test WITH mirroring
img_flipped = cv2.flip(img, 1)
print("\n🔍 Testing WITH mirroring:")
results2 = model(img_flipped, conf=0.1, verbose=False)
for result in results2:
    if hasattr(result, 'boxes') and result.boxes is not None:
        for box in result.boxes:
            conf = float(box.conf[0])
            class_id = int(box.cls[0])
            class_name = model.names[class_id]
            print(f"  ✓ {class_name}: {conf:.2f}")

# Save both versions
cv2.imwrite("debug_original.jpg", img)
cv2.imwrite("debug_flipped.jpg", img_flipped)

# Save annotated versions
annotated1 = results1[0].plot()
annotated2 = results2[0].plot()
cv2.imwrite("debug_annotated_original.jpg", annotated1)
cv2.imwrite("debug_annotated_flipped.jpg", annotated2)

print("\n💾 Saved comparison images:")
print("  - debug_original.jpg (what camera sees)")
print("  - debug_flipped.jpg (what model sees with MIRROR_IMAGE=true)")
print("  - debug_annotated_original.jpg (detections without mirror)")
print("  - debug_annotated_flipped.jpg (detections with mirror)")
