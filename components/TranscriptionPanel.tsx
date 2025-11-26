'use client';

import React from 'react';

interface TranscriptionPanelProps {
  currentWord: string;
  sentence: string;
  refinedText: string;
  lastCharacter: string | null;
  confidence: number;
  isConnected: boolean;
  isProcessing?: boolean;
  frameCount?: number;
  onClose: () => void;
  onRefine: () => void;
}

export const TranscriptionPanel: React.FC<TranscriptionPanelProps> = ({
  currentWord,
  sentence,
  refinedText,
  lastCharacter,
  confidence,
  isConnected,
  isProcessing = false,
  frameCount = 0,
  onClose,
  onRefine
}) => {
  return (
    <div className="fixed bottom-24 right-6 w-96 bg-gray-900 border-2 border-gray-700 rounded-xl p-5 shadow-2xl z-50">
      {/* Header with Live Indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-white font-bold text-lg">Sign Detection</h3>

          {/* Live Indicator */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <div className="absolute inset-0 w-3 h-3 rounded-full bg-red-500 animate-ping" />
            </div>
            <span className="text-xs text-red-400 font-semibold">LIVE</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-2xl leading-none"
        >
          ×
        </button>
      </div>

      {/* Stats Bar */}
      <div className="mb-4 bg-gray-800 rounded-lg p-3">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <div className="text-gray-400 mb-1">Frames Analyzed</div>
            <div className="text-green-400 font-bold text-lg">{frameCount}</div>
          </div>
          <div>
            <div className="text-gray-400 mb-1">Status</div>
            <div className={`font-bold text-lg ${isProcessing ? 'text-yellow-400' : 'text-green-400'}`}>
              {isProcessing ? 'Processing...' : 'Ready'}
            </div>
          </div>
        </div>
      </div>

      {/* Current Character */}
      <div className="mb-4">
        <div className="text-xs text-gray-400 mb-2">Detected Letter</div>
        <div className="bg-gray-800 rounded-lg p-4 text-center relative overflow-hidden">
          {isProcessing && (
            <div className="absolute inset-0 bg-blue-500 opacity-10 animate-pulse" />
          )}

          <div className="text-5xl font-bold text-blue-400 relative z-10">
            {lastCharacter || '-'}
          </div>
          <div className="text-sm text-gray-400 mt-2 relative z-10">
            {(confidence * 100).toFixed(1)}% confidence
          </div>
        </div>
      </div>

      {/* Current Word */}
      <div className="mb-4">
        <div className="text-xs text-gray-400 mb-2">Building Word</div>
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-xl font-mono text-white">
            {currentWord || 'Waiting...'}
            {currentWord && <span className="animate-pulse">|</span>}
          </div>
        </div>
      </div>

      {/* Sentence */}
      <div className="mb-4">
        <div className="text-xs text-gray-400 mb-2">Sentence</div>
        <div className="bg-gray-800 rounded-lg p-3 max-h-24 overflow-y-auto">
          <div className="text-sm text-gray-300">
            {sentence || 'Start signing to build a sentence...'}
          </div>
        </div>
      </div>

      {/* Refined Text */}
      {refinedText && (
        <div className="mb-4">
          <div className="text-xs text-gray-400 mb-2">✨ AI Refined</div>
          <div className="bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg p-3">
            <div className="text-sm text-white">
              {refinedText}
            </div>
          </div>
        </div>
      )}

      {/* Refine Button */}
      <button
        onClick={onRefine}
        disabled={!sentence}
        className={`w-full py-3 rounded-lg font-medium transition ${sentence
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
      >
        🤖 Refine with AI
      </button>

      {/* Instructions */}
      <div className="mt-3 text-xs text-gray-500 text-center">
        💡 Pause between words for auto-spacing
      </div>
    </div>
  );
};