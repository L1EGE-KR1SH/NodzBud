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
  const [frameCount, setFrameCount] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(false);
  const processingRef = useRef(false); // Track if currently processing

  const sendFrame = useCallback(async (base64Image: string) => {
    if (!isActiveRef.current) {
      console.log('⏭️ Skipping frame: detection not active');
      return;
    }

    // Don't skip if processing - we want continuous sending
    // Just mark that we're processing
    if (processingRef.current) {
      console.log('⏭️ Previous request still processing, skipping this frame');
      return;
    }

    processingRef.current = true;
    setIsProcessing(true);

    const frameNum = Date.now();
    console.log(`\n📤 [${new Date().toLocaleTimeString()}] Sending frame to backend...`);

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

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Server error ${response.status}:`, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data: DetectionResult = await response.json();

      console.log(`✅ Response (${elapsed}ms):`, {
        character: data.character || 'none',
        confidence: `${Math.round(data.confidence * 100)}%`,
        word: data.current_word || '-',
        sentence: data.sentence ? data.sentence.substring(0, 30) + '...' : '-'
      });

      // Update state only if still active
      if (isActiveRef.current) {
        setLastCharacter(data.character);
        setConfidence(data.confidence);
        setCurrentWord(data.current_word);
        setSentence(data.sentence);
        setError(null);
        setFrameCount(prev => prev + 1);

        // Log word completion
        if (data.word_completed && data.completed_word) {
          console.log(`📝 Word completed: "${data.completed_word}"`);
        }

        // Auto-refine on sentence completion
        if (data.sentence_completed) {
          console.log('📝 Sentence completed! Auto-refining...');
          // Don't await - let it run in background
          refineText();
        }
      }

    } catch (error: any) {
      console.error(`❌ Error sending frame:`, error.message);
      setError(error.message || 'Detection failed');

      // Don't stop on errors - just log and continue
      console.log('⚠️ Will retry on next frame...');

    } finally {
      processingRef.current = false;
      setIsProcessing(false);
    }
  }, [meetingId]);

  const captureFrame = useCallback(() => {
    // Quick checks
    if (!isActiveRef.current) return;
    if (!videoRef.current) return;
    if (!canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Check video is ready
    if (video.readyState < 2) {
      console.log('⏳ Video not ready, waiting...');
      return;
    }

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.log('⏳ Video dimensions not ready...');
      return;
    }

    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;

    try {
      // Resize canvas if dimensions changed
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        console.log(`📐 Canvas: ${canvas.width}x${canvas.height}`);
      }

      // Draw current frame
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to base64
      const base64Image = canvas.toDataURL('image/jpeg', 0.7);

      // Send to backend (async - doesn't block interval)
      sendFrame(base64Image);

    } catch (err) {
      console.error('❌ Capture error:', err);
    }
  }, [sendFrame]);

  const startDetection = useCallback((video: HTMLVideoElement) => {
    console.log('\n🎥 ==========================================');
    console.log('   STARTING CONTINUOUS SIGN DETECTION');
    console.log('==========================================');
    console.log('📹 Video:', {
      dimensions: `${video.videoWidth}x${video.videoHeight}`,
      readyState: video.readyState,
      paused: video.paused
    });
    console.log('🌐 Backend:', API_BASE);
    console.log('🆔 Session:', meetingId);
    console.log('⏰ Interval: 500ms (2 FPS)');

    // Cleanup previous if exists
    if (intervalRef.current) {
      console.log('🧹 Clearing previous interval...');
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Initialize refs
    videoRef.current = video;
    isActiveRef.current = true;
    processingRef.current = false;

    // Create canvas if needed
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
      console.log('🖼️ Canvas created');
    }

    // Reset state
    setFrameCount(0);
    setError(null);

    // Wait for video to be ready
    const startCapture = () => {
      if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
        console.log('⏳ Waiting for video...');
        setTimeout(startCapture, 100);
        return;
      }

      console.log('✅ Video ready! Starting capture loop...');

      // START CONTINUOUS INTERVAL
      intervalRef.current = setInterval(() => {
        if (isActiveRef.current) {
          captureFrame();
        } else {
          console.log('⚠️ Interval tick but not active (stopping)');
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      }, 500); // Every 500ms = 2 FPS

      setIsActive(true);

      // Immediate first capture
      console.log('🧪 Sending first frame immediately...');
      setTimeout(() => captureFrame(), 100);

      console.log('==========================================');
      console.log('   ✅ DETECTION RUNNING CONTINUOUSLY');
      console.log('==========================================\n');
    };

    startCapture();

  }, [captureFrame, meetingId]);

  const stopDetection = useCallback(() => {
    console.log('\n🛑 ==========================================');
    console.log('   STOPPING DETECTION');
    console.log('==========================================');
    console.log(`📊 Total frames processed: ${frameCount}`);

    // Stop everything
    isActiveRef.current = false;
    processingRef.current = false;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log('✅ Interval cleared');
    }

    // Clear refs
    videoRef.current = null;

    // Reset state
    setIsActive(false);
    setCurrentWord('');
    setSentence('');
    setRefinedText('');
    setLastCharacter(null);
    setConfidence(0);
    setError(null);
    setIsProcessing(false);
    setFrameCount(0);

    console.log('==========================================\n');
  }, [frameCount]);

  const refineText = useCallback(async () => {
    console.log('🤖 Refining text with AI...');
    try {
      const formData = new FormData();
      formData.append('session_id', meetingId);

      const response = await fetch(`${API_BASE}/api/refine-text`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setRefinedText(data.text);
      console.log('✅ Refined:', data.text);

    } catch (error: any) {
      console.error('❌ Refine error:', error.message);
    }
  }, [meetingId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🔧 Hook unmounting - cleanup');
      isActiveRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
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
    frameCount,
    startDetection,
    stopDetection,
    refineText,
  };
};