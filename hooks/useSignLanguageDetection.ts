// ============================================
// FIXED: hooks/useSignLanguageDetection.ts
// Remove paused check for live video streams
// ============================================

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface DetectionResult {
  type: string;
  character: string | null;
  confidence: number;
  word_completed: boolean;
  current_word: string;
  sentence: string;
  completed_word?: string;
  sentence_completed?: boolean;
}

const API_BASE = process.env.NEXT_PUBLIC_SIGN_API_URL || 'http://localhost:8000';

export const useSignLanguageDetection = (meetingId: string) => {
  const [isActive, setIsActive] = useState(false);
  const [currentWord, setCurrentWord] = useState('');
  const [sentence, setSentence] = useState('');
  const [refinedText, setRefinedText] = useState('');
  const [lastCharacter, setLastCharacter] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(false);
  const frameCountRef = useRef(0);
  const requestInFlightRef = useRef(false);

  const sendFrame = useCallback(async (base64Image: string) => {
    if (!isActiveRef.current) {
      console.log('⏭️ Skipping: not active');
      return;
    }
    
    if (requestInFlightRef.current) {
      console.log('⏭️ Skipping: request in flight');
      return;
    }
    
    requestInFlightRef.current = true;
    setIsProcessing(true);
    frameCountRef.current += 1;
    
    const frameNum = frameCountRef.current;
    console.log(`\n📤 [Frame ${frameNum}] Sending to: ${API_BASE}/api/detect-frame`);
    
    try {
      const formData = new FormData();
      formData.append('image', base64Image);
      formData.append('session_id', meetingId);
      
      const startTime = Date.now();
      
      const response = await fetch(`${API_BASE}/api/detect-frame`, {
        method: 'POST',
        body: formData,
      });
      
      const elapsed = Date.now() - startTime;
      console.log(`📥 [Frame ${frameNum}] Response: ${response.status} (${elapsed}ms)`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ [Frame ${frameNum}] Error:`, errorText);
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data: DetectionResult = await response.json();
      console.log(`✅ [Frame ${frameNum}] Detected: ${data.character || 'nothing'} (${Math.round(data.confidence * 100)}%)`);
      
      if (isActiveRef.current) {
        setLastCharacter(data.character);
        setConfidence(data.confidence);
        setCurrentWord(data.current_word);
        setSentence(data.sentence);
        setError(null);
        
        if (data.sentence_completed) {
          console.log('📝 Sentence completed, refining...');
          await refineText();
        }
      }
      
    } catch (error: any) {
      console.error(`❌ [Frame ${frameNum}] Error:`, error.message);
      setError(error.message || 'Detection failed');
    } finally {
      requestInFlightRef.current = false;
      setIsProcessing(false);
    }
  }, [meetingId]);

  const captureFrame = useCallback(() => {
    if (!isActiveRef.current) {
      return;
    }
    
    if (!videoRef.current || !canvasRef.current) {
      return;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // ⭐ CRITICAL FIX: For live video streams (like WebRTC), 
    // the video might have paused=true but still be displaying live feed
    // So we ONLY check readyState and dimensions, NOT paused state
    
    if (video.readyState < 2) {
      console.log(`⏳ Video not ready: readyState=${video.readyState}`);
      return;
    }
    
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.log(`⏳ Video dimensions not ready: ${video.videoWidth}x${video.videoHeight}`);
      return;
    }
    
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) {
      console.error('❌ Cannot get canvas context');
      return;
    }
    
    try {
      // Resize canvas if needed
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        console.log(`📐 Canvas resized to: ${canvas.width}x${canvas.height}`);
      }
      
      // Draw current video frame
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to base64
      const base64Image = canvas.toDataURL('image/jpeg', 0.7);
      console.log(`📸 Frame captured (${base64Image.length} chars)`);
      
      // Send to backend
      sendFrame(base64Image);
      
    } catch (err) {
      console.error('❌ captureFrame error:', err);
    }
  }, [sendFrame]);

  const startDetection = useCallback((video: HTMLVideoElement) => {
    console.log('\n🎥 ========== STARTING DETECTION ==========');
    console.log('📹 Video element:', {
      width: video.videoWidth,
      height: video.videoHeight,
      readyState: video.readyState,
      paused: video.paused,
      currentTime: video.currentTime
    });
    console.log('🌐 API Base:', API_BASE);
    console.log('🆔 Meeting ID:', meetingId);
    
    // Cleanup any existing detection
    if (intervalRef.current) {
      console.log('🧹 Clearing existing interval');
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Set refs
    videoRef.current = video;
    isActiveRef.current = true;
    frameCountRef.current = 0;
    requestInFlightRef.current = false;
    
    // Create canvas
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
      console.log('🖼️ Canvas created');
    }
    
    // For live video streams, we don't need to wait for playback
    // Just check if video has valid dimensions
    const startCapture = () => {
      if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
        console.log(`⏳ Waiting for video dimensions... ${video?.videoWidth || 0}x${video?.videoHeight || 0}`);
        setTimeout(startCapture, 100);
        return;
      }
      
      console.log('✅ Video dimensions ready! Starting capture loop...');
      console.log(`⏰ Capture interval: 500ms (2 FPS)`);
      
      // Start interval
      intervalRef.current = setInterval(() => {
        if (isActiveRef.current) {
          captureFrame();
        }
      }, 500);
      
      setIsActive(true);
      
      // Immediate test capture
      console.log('🧪 Testing immediate capture...');
      setTimeout(() => {
        captureFrame();
      }, 100);
      
      console.log('========== DETECTION STARTED ==========\n');
    };
    
    startCapture();
    
  }, [captureFrame, meetingId]);

  const stopDetection = useCallback(() => {
    console.log('\n🛑 ========== STOPPING DETECTION ==========');
    
    isActiveRef.current = false;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log('✅ Interval cleared');
    }
    
    videoRef.current = null;
    requestInFlightRef.current = false;
    
    setIsActive(false);
    setCurrentWord('');
    setSentence('');
    setRefinedText('');
    setLastCharacter(null);
    setConfidence(0);
    setError(null);
    setIsProcessing(false);
    frameCountRef.current = 0;
    
    console.log('========== DETECTION STOPPED ==========\n');
  }, []);

  const refineText = useCallback(async () => {
    console.log('🤖 Refining text...');
    try {
      const formData = new FormData();
      formData.append('session_id', meetingId);
      
      const response = await fetch(`${API_BASE}/api/refine-text`, {
        method: 'POST',
        body: formData,
      });
      
      console.log(`📥 Refine response: ${response.status}`);
      
      if (!response.ok) {
        throw new Error('Refinement failed');
      }
      
      const data = await response.json();
      setRefinedText(data.text);
      console.log('✅ Text refined:', data.text);
      
    } catch (error) {
      console.error('❌ Refine error:', error);
    }
  }, [meetingId]);

  useEffect(() => {
    console.log('🔧 Hook mounted');
    return () => {
      console.log('🔧 Hook unmounting - cleanup');
      isActiveRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isActive,
    isConnected: !error,
    currentWord,
    sentence,
    refinedText,
    lastCharacter,
    confidence,
    error,
    isProcessing,
    startDetection,
    stopDetection,
    refineText,
  };
};