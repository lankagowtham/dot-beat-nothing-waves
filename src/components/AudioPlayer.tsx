
import React, { useState, useRef, useEffect } from 'react';
import DotMatrixVisualizer from './DotMatrixVisualizer';
import AudioControls from './AudioControls';
import FileUploader from './FileUploader';
import { toast } from 'sonner';

const AudioPlayer: React.FC = () => {
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackInfo, setTrackInfo] = useState({ title: '', artist: '' });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio element
    if (!audioRef.current) {
      audioRef.current = new Audio();
      
      // Add event listeners
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
      });
      
      audioRef.current.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        toast.error('Error playing audio file');
        setIsPlaying(false);
      });
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current && audioSrc) {
      audioRef.current.src = audioSrc;
      audioRef.current.load();
      
      if (isPlaying) {
        audioRef.current.play()
          .catch(err => {
            console.error('Playback failed:', err);
            toast.error('Playback failed. Please try again.');
            setIsPlaying(false);
          });
      }
    }
  }, [audioSrc, isPlaying]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // If we don't have a source yet, don't try to play
      if (!audioSrc) {
        toast.info('Please upload an audio file first');
        return;
      }
      
      audioRef.current.play()
        .catch(err => {
          console.error('Playback failed:', err);
          toast.error('Playback failed. Please try again.');
        });
    }
    
    setIsPlaying(!isPlaying);
  };

  const handleSkipBackward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
  };

  const handleSkipForward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.min(
      audioRef.current.duration || 0,
      audioRef.current.currentTime + 10
    );
  };

  const handleFileUpload = (file: File) => {
    // Revoke previous object URL to prevent memory leaks
    if (audioSrc && audioSrc.startsWith('blob:')) {
      URL.revokeObjectURL(audioSrc);
    }
    
    const objectUrl = URL.createObjectURL(file);
    setAudioSrc(objectUrl);
    
    // Extract track info from filename
    const fileName = file.name.replace(/\.[^.]+$/, '');
    let title = fileName;
    let artist = '';
    
    // Try to parse artist - title format
    if (fileName.includes(' - ')) {
      [artist, title] = fileName.split(' - ', 2);
    } else if (fileName.includes('-')) {
      [artist, title] = fileName.split('-', 2);
    }
    
    setTrackInfo({
      title: title.trim(),
      artist: artist.trim()
    });
    
    // Start playing when file is uploaded
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Visualizer area */}
      <div className="flex-1 mb-4">
        <DotMatrixVisualizer audioElement={audioRef.current} isPlaying={isPlaying} />
      </div>
      
      {/* Track info */}
      <div className="mb-4 text-center">
        {trackInfo.title ? (
          <>
            <h2 className="text-xl font-medium text-white truncate">
              {trackInfo.title}
            </h2>
            {trackInfo.artist && (
              <p className="text-sm text-gray-400 truncate">
                {trackInfo.artist}
              </p>
            )}
          </>
        ) : (
          <p className="text-gray-400">No track loaded</p>
        )}
      </div>
      
      {/* Audio controls */}
      <div className="mb-6">
        <AudioControls
          audioElement={audioRef.current}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onSkipBackward={handleSkipBackward}
          onSkipForward={handleSkipForward}
        />
      </div>
      
      {/* File uploader */}
      <div className="flex justify-center mb-8">
        <FileUploader onFileUpload={handleFileUpload} />
      </div>
    </div>
  );
};

export default AudioPlayer;
