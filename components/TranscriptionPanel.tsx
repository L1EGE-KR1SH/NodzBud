'use client';

import React from 'react';

interface TranscriptionPanelProps {
  currentWord: string;
  sentence: string;
  refinedText: string;
  lastCharacter: string | null;
  confidence: number;
  isConnected: boolean;
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
  onClose,
  onRefine
}) => {
  return (
    <div className="fixed bottom-24 right-6 w-96 bg-gray-900 border-2 border-gray-700 rounded-xl p-5 shadow-2xl z-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-white font-bold text-lg">Sign Detection</h3>
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
        </div>
        <button 
          onClick={onClose} 
          className="text-gray-400 hover:text-white text-2xl leading-none"
        >
          ×
        </button>
      </div>

      {/* Current Character */}
      <div className="mb-4">
        <div className="text-xs text-gray-400 mb-2">Detected Letter</div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-5xl font-bold text-blue-400">
            {lastCharacter || '-'}
          </div>
          <div className="text-sm text-gray-400 mt-2">
            {(confidence * 100).toFixed(1)}% confidence
          </div>
        </div>
      </div>

      {/* Current Word */}
      <div className="mb-4">
        <div className="text-xs text-gray-400 mb-2">Current Word</div>
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-xl font-mono text-white">
            {currentWord || 'Waiting...'}
          </div>
        </div>
      </div>

      {/* Raw Sentence */}
      <div className="mb-4">
        <div className="text-xs text-gray-400 mb-2">Raw Text</div>
        <div className="bg-gray-800 rounded-lg p-3 max-h-24 overflow-y-auto">
          <div className="text-sm text-gray-300">
            {sentence || 'Start signing...'}
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
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition"
      >
        🤖 Refine with AI
      </button>
    </div>
  );
};