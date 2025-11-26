#!/usr/bin/env python3
"""Check what the last received frame looks like"""

import os
import cv2

debug_file = "debug_last_frame.jpg"

if os.path.exists(debug_file):
    img = cv2.imread(debug_file)
    if img is not None:
        print(f"✅ Debug image exists")
        print(f"📐 Shape: {img.shape}")
        print(f"📊 Size: {os.path.getsize(debug_file)} bytes")
        print(f"💡 Image is {'valid' if img.shape[0] > 10 and img.shape[1] > 10 else 'TOO SMALL'}")
    else:
        print("❌ File exists but can't be read")
else:
    print("❌ No debug image found")
    print("💡 This means either:")
    print("   1. Detection hasn't started yet")
    print("   2. No frames are being received from browser")
    print("   3. Frames are being received but not saved")
