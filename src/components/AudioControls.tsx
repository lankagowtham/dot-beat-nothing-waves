
import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { formatTime } from '@/lib/utils';

interface AudioControlsProps {
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onSkipBackward: () => void;
  onSkipForward: () => void;
}

const AudioControls: React.FC<AudioControlsProps> = ({
  audioElement,
  isPlaying,
  onPlayPause,
  onSkipBackward,
  onSkipForward,
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [muted, setMuted] = useState(false);
  
  useEffect(() => {
    if (!audioElement) return;
    
    const timeUpdate = () => {
      setCurrentTime(audioElement.currentTime);
    };
    
    const durationChange = () => {
      setDuration(audioElement.duration || 0);
    };
    
    // Initial values
    setVolume(audioElement.volume);
    setMuted(audioElement.muted);
    setDuration(audioElement.duration || 0);
    
    audioElement.addEventListener('timeupdate', timeUpdate);
    audioElement.addEventListener('durationchange', durationChange);
    
    return () => {
      audioElement.removeEventListener('timeupdate', timeUpdate);
      audioElement.removeEventListener('durationchange', durationChange);
    };
  }, [audioElement]);
  
  const handleTimeChange = (value: number[]) => {
    if (!audioElement) return;
    audioElement.currentTime = value[0];
    setCurrentTime(value[0]);
  };
  
  const handleVolumeChange = (value: number[]) => {
    if (!audioElement) return;
    const newVolume = value[0];
    audioElement.volume = newVolume;
    setVolume(newVolume);
    
    // Unmute if volume is changed and was muted
    if (muted && newVolume > 0) {
      audioElement.muted = false;
      setMuted(false);
    }
  };
  
  const toggleMute = () => {
    if (!audioElement) return;
    const newMuted = !muted;
    audioElement.muted = newMuted;
    setMuted(newMuted);
  };
  
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg w-full max-w-xl mx-auto">
      {/* Progress bar */}
      <div className="mb-4">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleTimeChange}
          className="mb-1"
        />
        <div className="flex justify-between text-xs text-gray-300">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Volume control */}
          <Button
            variant="ghost"
            size="icon"
            className="text-white"
            onClick={toggleMute}
          >
            {muted || volume === 0 ? (
              <VolumeX size={20} />
            ) : (
              <Volume2 size={20} />
            )}
          </Button>
          <div className="w-24">
            <Slider
              value={[muted ? 0 : volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Skip backward */}
          <Button
            variant="ghost"
            size="icon"
            className="text-white"
            onClick={onSkipBackward}
          >
            <SkipBack size={20} />
          </Button>
          
          {/* Play/Pause */}
          <Button
            variant="outline"
            size="icon"
            className="rounded-full w-12 h-12 bg-white/5 border-white/20 hover:bg-white/10 text-white"
            onClick={onPlayPause}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </Button>
          
          {/* Skip forward */}
          <Button
            variant="ghost"
            size="icon"
            className="text-white"
            onClick={onSkipForward}
          >
            <SkipForward size={20} />
          </Button>
        </div>
        
        {/* Spacer div to balance layout */}
        <div className="w-28"></div>
      </div>
    </div>
  );
};

export default AudioControls;
