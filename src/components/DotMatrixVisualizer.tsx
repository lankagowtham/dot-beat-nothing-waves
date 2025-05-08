
import React, { useRef, useEffect, useState } from 'react';
import audioContext from '@/lib/audio-context';
import anime from 'animejs';

interface DotMatrixVisualizerProps {
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
}

const DotMatrixVisualizer: React.FC<DotMatrixVisualizerProps> = ({ audioElement, isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
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

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Initial animation for the container
    if (containerRef.current) {
      anime({
        targets: containerRef.current,
        opacity: [0, 1],
        scale: [0.98, 1],
        duration: 800,
        easing: 'easeOutQuad'
      });
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
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

    // Set up high resolution rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // Set physical size to match display size * device pixel ratio
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    // Scale the context to ensure correct drawing
    ctx.scale(dpr, dpr);
    
    // Set display size (CSS pixels)
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    // Dynamic dot configuration based on canvas size
    // Calculate optimal dot count based on available space
    const targetColumnCount = Math.floor(Math.sqrt(rect.width * 0.5));
    const targetRowCount = Math.floor(Math.sqrt(rect.height * 0.5));
    
    // Ensure we have at least 10 dots in each dimension for small screens
    const columns = Math.max(10, targetColumnCount);
    const rows = Math.max(10, targetRowCount);
    
    // Calculate dot size and spacing to fill the canvas completely
    const dotSpacingX = rect.width / columns;
    const dotSpacingY = rect.height / rows;
    const dotSize = Math.min(dotSpacingX, dotSpacingY) * 0.8; // 80% of spacing for nice visual density
    
    // Anime.js animation for play state change
    if (isPlaying) {
      anime({
        targets: canvas,
        brightness: [0.8, 1],
        easing: 'easeOutSine',
        duration: 600,
        update: function(anim) {
          // This is just to trigger the animation, the actual change happens in CSS
        }
      });
    } else {
      anime({
        targets: canvas,
        brightness: [1, 0.8],
        easing: 'easeOutSine',
        duration: 600,
        update: function(anim) {
          // This is just to trigger the animation, the actual change happens in CSS
        }
      });
    }
    
    // Animation function for drawing the visualizer
    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      
      analyser.getByteFrequencyData(dataArray);
      
      // Clear the canvas with a very dark background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, rect.width, rect.height);
      
      if (!isPlaying) {
        // Draw static dot matrix when not playing with improved alignment
        for (let i = 0; i < columns; i++) {
          for (let j = 0; j < rows; j++) {
            const x = i * dotSpacingX + dotSpacingX / 2;
            const y = j * dotSpacingY + dotSpacingY / 2;
            
            ctx.beginPath();
            ctx.arc(x, y, dotSize / 2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.fill();
          }
        }
        return;
      }
      
      // Draw the active visualization with better precision and alignment
      for (let i = 0; i < columns; i++) {
        // Map the column to a frequency bin
        const index = Math.floor(i * bufferLength / columns);
        const value = dataArray[index];
        
        // Calculate how many dots in this column should be lit based on the frequency value
        const activeDots = Math.floor((value / 255) * rows);
        
        for (let j = 0; j < rows; j++) {
          const x = i * dotSpacingX + dotSpacingX / 2;
          const y = j * dotSpacingY + dotSpacingY / 2;
          
          // Check if this dot should be lit
          let opacity = 0.15;
          
          // Bottom to top visualization with improved contrast
          const invertedJ = rows - j - 1;
          if (invertedJ < activeDots) {
            // Intensity based on frequency value and position
            opacity = 0.5 + ((activeDots - invertedJ) / activeDots) * 0.5;
          }
          
          ctx.beginPath();
          ctx.arc(x, y, dotSize / 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
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
    <div 
      ref={containerRef}
      className="w-full h-full flex items-center justify-center bg-black rounded-lg overflow-hidden transition-all"
    >
      <canvas 
        ref={canvasRef} 
        className="w-full h-full rounded-lg dot-matrix"
      />
    </div>
  );
};

export default DotMatrixVisualizer;
