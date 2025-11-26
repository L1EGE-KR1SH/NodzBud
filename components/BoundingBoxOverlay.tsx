'use client';

import React, { useEffect, useRef } from 'react';

interface BoundingBoxOverlayProps {
    bbox: {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
    } | null;
    character: string | null;
    confidence: number;
    videoElement: HTMLVideoElement | null;
}

export const BoundingBoxOverlay: React.FC<BoundingBoxOverlayProps> = ({
    bbox,
    character,
    confidence,
    videoElement
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current || !videoElement) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Match canvas size to video
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw bounding box if exists
        if (bbox && character) {
            const x1 = bbox.x1 * canvas.width;
            const y1 = bbox.y1 * canvas.height;
            const x2 = bbox.x2 * canvas.width;
            const y2 = bbox.y2 * canvas.height;
            const width = x2 - x1;
            const height = y2 - y1;

            // Draw box
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 3;
            ctx.strokeRect(x1, y1, width, height);

            // Draw label background
            const label = `${character} (${(confidence * 100).toFixed(0)}%)`;
            ctx.font = 'bold 20px Arial';
            const textMetrics = ctx.measureText(label);
            const textHeight = 24;

            ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
            ctx.fillRect(x1, y1 - textHeight - 4, textMetrics.width + 10, textHeight + 4);

            // Draw label text
            ctx.fillStyle = '#000';
            ctx.fillText(label, x1 + 5, y1 - 8);
        }
    }, [bbox, character, confidence, videoElement]);

    // Debug logging
    useEffect(() => {
        console.log('🎯 BoundingBoxOverlay render:', {
            hasBbox: !!bbox,
            bbox,
            character,
            confidence,
            hasVideo: !!videoElement,
            videoSize: videoElement ? `${videoElement.videoWidth}x${videoElement.videoHeight}` : 'N/A'
        });
    }, [bbox, character, confidence, videoElement]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 10
            }}
        />
    );
};
