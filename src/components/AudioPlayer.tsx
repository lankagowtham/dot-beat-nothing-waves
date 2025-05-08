
import React, { useState, useRef, useEffect } from 'react';
import DotMatrixVisualizer from './DotMatrixVisualizer';
import AudioControls from './AudioControls';
import FileUploader from './FileUploader';
import { toast } from 'sonner';
import useBackgroundAudio from '@/hooks/useBackgroundAudio';
import { Button } from './ui/button';
import { Headphones } from 'lucide-react';

const AudioPlayer: React.FC = () => {
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackInfo, setTrackInfo] = useState({ title: '', artist: '' });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { isAvailable, captureBackgroundAudio, mediaInfo } = useBackgroundAudio();
  const mediaStreamRef = useRef<MediaStream | null>(null);

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
      
      // Clean up media stream if it exists
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
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

  useEffect(() => {
    // Update track info if media session info becomes available
    if (mediaInfo.title) {
      setTrackInfo({
        title: mediaInfo.title || 'Unknown Title',
        artist: mediaInfo.artist || 'Unknown Artist'
      });
    }
  }, [mediaInfo]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // If we don't have a source yet, don't try to play
      if (!audioSrc && !mediaStreamRef.current) {
        toast.info('Please upload an audio file or capture background audio first');
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
    // Stop any existing media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
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

  const handleCaptureBackgroundAudio = async () => {
    // Stop previous streams if any
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // Capture new stream
    const stream = await captureBackgroundAudio();
    
    if (stream) {
      mediaStreamRef.current = stream;
      
      // Create a new audio context for the captured stream
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      
      // Create a destination node (a MediaStreamAudioDestinationNode)
      const destination = audioContext.createMediaStreamDestination();
      source.connect(destination);
      
      // Use the destination stream with the audio element
      if (audioRef.current) {
        // Revoke previous object URL if exists
        if (audioSrc && audioSrc.startsWith('blob:')) {
          URL.revokeObjectURL(audioSrc);
        }
        
        // Create a new MediaStream with the audio track
        const newStream = new MediaStream(destination.stream.getAudioTracks());
        const newSrc = URL.createObjectURL(newStream);
        setAudioSrc(newSrc);
        
        // Start playing the captured audio
        setIsPlaying(true);
      }
      
      // Set default track info if not available from media session
      if (!mediaInfo.title) {
        setTrackInfo({
          title: 'Background Audio',
          artist: 'System'
        });
      }
    }
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
      
      {/* File uploader and background audio capture */}
      <div className="flex justify-center gap-4 mb-8">
        <FileUploader onFileUpload={handleFileUpload} />
        
        {isAvailable && (
          <Button 
            variant="outline" 
            className="glass-morph flex items-center gap-2 text-white hover:bg-white/10"
            onClick={handleCaptureBackgroundAudio}
          >
            <Headphones size={16} />
            Capture Audio
          </Button>
        )}
      </div>
    </div>
  );
};

export default AudioPlayer;
