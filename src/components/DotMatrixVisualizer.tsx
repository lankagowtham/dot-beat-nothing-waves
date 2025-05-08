
import React, { useRef, useEffect, useState } from 'react';
import audioContext from '@/lib/audio-context';

interface DotMatrixVisualizerProps {
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
}

const DotMatrixVisualizer: React.FC<DotMatrixVisualizerProps> = ({ audioElement, isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!audioElement) return;

    // Initialize audio context with our audio element
    audioContext.initialize(audioElement);
    
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    if (canvasRef.current) {
      resizeObserver.observe(canvasRef.current);
    }

    return () => {
      if (canvasRef.current) {
        resizeObserver.unobserve(canvasRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioElement]);

  useEffect(() => {
    if (!canvasRef.current || !audioElement) return;
    
    const analyser = audioContext.getAnalyser();
    if (!analyser) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const dotSize = 4;
    const dotSpacing = 8;
    const columns = Math.floor(canvas.width / dotSpacing);
    const rows = Math.floor(canvas.height / dotSpacing);
    
    // Animation function for drawing the visualizer
    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      
      analyser.getByteFrequencyData(dataArray);
      
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (!isPlaying) {
        // Draw static dot matrix when not playing
        for (let i = 0; i < columns; i++) {
          for (let j = 0; j < rows; j++) {
            const x = i * dotSpacing;
            const y = j * dotSpacing;
            
            ctx.beginPath();
            ctx.arc(x, y, dotSize / 2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(142, 145, 150, 0.3)';
            ctx.fill();
          }
        }
        return;
      }
      
      // Draw the active visualization
      for (let i = 0; i < columns; i++) {
        // Map the column to a frequency bin
        const index = Math.floor(i * bufferLength / columns);
        const value = dataArray[index];
        
        // Calculate how many dots in this column should be lit based on the frequency value
        const activeDots = Math.floor((value / 255) * rows);
        
        for (let j = 0; j < rows; j++) {
          const x = i * dotSpacing;
          const y = j * dotSpacing;
          
          // Check if this dot should be lit
          let opacity = 0.3;
          let color = '#8E9196';
          
          // Bottom to top visualization
          const invertedJ = rows - j - 1;
          if (invertedJ < activeDots) {
            opacity = 0.7 + (invertedJ / rows) * 0.3;
            
            // Change color based on frequency intensity
            if (invertedJ < activeDots * 0.2) {
              color = '#0FA0CE'; // Top dots are accent color
            } else if (invertedJ < activeDots * 0.5) {
              color = '#AAADB0'; // Middle dots are brighter
            }
          }
          
          ctx.beginPath();
          ctx.arc(x, y, dotSize / 2, 0, Math.PI * 2);
          ctx.fillStyle = `${color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
          ctx.fill();
        }
      }
    };
    
    if (isPlaying) {
      audioContext.resume();
    }
    draw();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions, audioElement, isPlaying]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full rounded-lg"
      />
    </div>
  );
};

export default DotMatrixVisualizer;
