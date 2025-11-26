from fastapi import FastAPI, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import cv2
import numpy as np
from ultralytics import YOLO
import base64
from PIL import Image
import io
import time
from collections import defaultdict
import os
from dotenv import load_dotenv
import uvicorn

# Load environment variables
load_dotenv()

app = FastAPI(title="Sign Language Detection API")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
MODEL_PATH = os.getenv("MODEL_PATH", "../model/best.pt")
CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.6"))
BREAK_DURATION = float(os.getenv("BREAK_DURATION", "1.5"))
SENTENCE_BREAK_DURATION = float(os.getenv("SENTENCE_BREAK_DURATION", "3.0"))

# Load model
print(f"🔄 Loading YOLO model from: {MODEL_PATH}")
print(f"📦 Ultralytics version: {YOLO.__version__ if hasattr(YOLO, '__version__') else 'Unknown'}")

try:
    model = YOLO(MODEL_PATH)
    print(f"✅ Model loaded successfully!")
    print(f"📋 Model type: {type(model)}")
    print(f"📋 Available classes ({len(model.names)}): {list(model.names.values())[:10]}...")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    print(f"💡 Try: pip install --upgrade ultralytics")
    model = None

# Session storage
sessions = defaultdict(lambda: {
    'current_word': '',
    'sentence': '',
    'last_char': None,
    'last_char_time': 0,
    'char_stability_count': defaultdict(int),
    'stability_threshold': 5,
})

def clean_character(char_name):
    """Clean and normalize character from model output"""
    if not char_name:
        return None
    
    char = str(char_name).strip().upper()
    
    # Handle special gestures
    if char in ['SPACE', 'SPC', ' ']:
        return 'SPACE'
    if char in ['PERIOD', 'DOT', '.']:
        return 'PERIOD'
    if char in ['NOTHING', 'NONE', 'BLANK', '']:
        return None
    
    # Only allow single letters A-Z
    if len(char) == 1 and char.isalpha():
        return char
    
    return None

def process_detection(image_data: str, session_id: str):
    """Process frame and detect sign language"""
    if not model:
        raise HTTPException(
            status_code=503, 
            detail="Model not loaded. Run: pip install --upgrade ultralytics"
        )
    
    try:
        # Decode base64 image
        if 'base64,' in image_data:
            image_data = image_data.split('base64,')[1]
        
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        image_np = np.array(image)
        
        # Convert RGB to BGR for YOLO
        if len(image_np.shape) == 3 and image_np.shape[2] == 3:
            image_bgr = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)
        else:
            image_bgr = image_np
        
        # Run YOLO inference
        results = model(image_bgr, conf=CONFIDENCE_THRESHOLD, verbose=False)
        
        # Get session
        session = sessions[session_id]
        current_time = time.time()
        
        # Find best detection
        best_detection = None
        best_confidence = 0.0
        
        for result in results:
            if hasattr(result, 'boxes') and result.boxes is not None:
                boxes = result.boxes
                if boxes is not None and len(boxes) > 0:
                    for box in boxes:
                        conf = float(box.conf[0])
                        if conf > best_confidence:
                            best_confidence = conf
                            class_id = int(box.cls[0])
                            best_detection = model.names[class_id]
        
        # Clean character
        detected_char = clean_character(best_detection)
        
        # Calculate time since last detection
        time_since_last = current_time - session['last_char_time']
        word_completed = False
        sentence_completed = False
        completed_word = None
        
        # Check for word break
        if time_since_last > BREAK_DURATION and session['current_word']:
            completed_word = session['current_word']
            session['sentence'] += session['current_word'] + ' '
            session['current_word'] = ''
            word_completed = True
            session['char_stability_count'].clear()
        
        # Check for sentence break
        if time_since_last > SENTENCE_BREAK_DURATION and session['sentence']:
            sentence_completed = True
        
        # Process detected character
        if detected_char:
            session['last_char_time'] = current_time
            
            if detected_char == 'SPACE':
                if session['current_word']:
                    completed_word = session['current_word']
                    session['sentence'] += session['current_word'] + ' '
                    session['current_word'] = ''
                    word_completed = True
                    session['char_stability_count'].clear()
                detected_char = None
                
            elif detected_char == 'PERIOD':
                if session['current_word']:
                    session['sentence'] += session['current_word']
                    session['current_word'] = ''
                session['sentence'] += '. '
                sentence_completed = True
                detected_char = None
                session['char_stability_count'].clear()
                
            else:
                # Regular character - check stability
                session['char_stability_count'][detected_char] += 1
                
                # Add character if stable and different from last
                if (session['char_stability_count'][detected_char] >= session['stability_threshold'] 
                    and detected_char != session['last_char']):
                    session['current_word'] += detected_char
                    session['last_char'] = detected_char
                    session['char_stability_count'].clear()
        
        return {
            'type': 'detection',
            'character': detected_char,
            'confidence': round(best_confidence, 2),
            'word_completed': word_completed,
            'current_word': session['current_word'],
            'sentence': session['sentence'].strip(),
            'completed_word': completed_word,
            'sentence_completed': sentence_completed
        }
        
    except Exception as e:
        print(f"❌ Detection error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Detection failed: {str(e)}")

@app.post("/api/detect-frame")
async def detect_frame(
    image: str = Form(...),
    session_id: str = Form(default="default")
):
    """Detect sign language from video frame"""
    result = process_detection(image, session_id)
    return JSONResponse(content=result)

@app.post("/api/refine-text")
async def refine_text(session_id: str = Form(default="default")):
    """Refine sentence"""
    try:
        session = sessions[session_id]
        sentence = session['sentence'].strip()
        
        if not sentence:
            return JSONResponse(content={'text': '', 'original': ''})
        
        # Basic refinement
        refined = sentence
        if refined:
            refined = refined[0].upper() + refined[1:] if len(refined) > 1 else refined.upper()
            refined = ' '.join(refined.split())
            if not refined.endswith('.'):
                refined += '.'
        
        return JSONResponse(content={
            'text': refined,
            'original': sentence
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return JSONResponse(content={
        'status': 'healthy' if model else 'unhealthy',
        'model_loaded': model is not None,
        'model_path': MODEL_PATH,
        'model_classes': list(model.names.values()) if model else [],
        'ultralytics_available': True
    })

@app.post("/api/reset-session")
async def reset_session(session_id: str = Form(default="default")):
    """Reset session"""
    if session_id in sessions:
        del sessions[session_id]
    return JSONResponse(content={'message': 'Session reset'})

if __name__ == '__main__':
    PORT = int(os.getenv("BACKEND_PORT", "8000"))
    print(f"\n{'='*60}")
    print(f"🚀 Starting FastAPI server on http://localhost:{PORT}")
    print(f"📚 API Docs: http://localhost:{PORT}/docs")
    print(f"💡 Health Check: http://localhost:{PORT}/api/health")
    print(f"{'='*60}\n")
    
    uvicorn.run(app, host="0.0.0.0", port=PORT, log_level="info")