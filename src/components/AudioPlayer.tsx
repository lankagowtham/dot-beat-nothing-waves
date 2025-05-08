import React, { useState, useRef, useEffect } from 'react';
import DotMatrixVisualizer from './DotMatrixVisualizer';
import AudioControls from './AudioControls';
import FileUploader from './FileUploader';
import { toast } from 'sonner';
import useBackgroundAudio from '@/hooks/useBackgroundAudio';
import { Button } from './ui/button';
import { Headphones, Mic } from 'lucide-react';
import anime from 'animejs';

const AudioPlayer: React.FC = () => {
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackInfo, setTrackInfo] = useState({ title: '', artist: '' });
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const visualizerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  
  const { 
    isAvailable, 
    captureBackgroundAudio, 
    mediaInfo, 
    permissionStatus,
    requestPermission,
    isCapturing
  } = useBackgroundAudio();
  
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

  // Initial entrance animation
  useEffect(() => {
    if (playerContainerRef.current) {
      anime({
        targets: playerContainerRef.current,
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 800,
        easing: 'easeOutCubic'
      });
    }
    
    if (visualizerRef.current) {
      anime({
        targets: visualizerRef.current,
        scale: [0.95, 1],
        opacity: [0, 1],
        duration: 1000,
        delay: 300,
        easing: 'easeOutElastic(1, .6)'
      });
    }
    
    if (controlsRef.current) {
      anime({
        targets: controlsRef.current.children,
        opacity: [0, 1],
        translateY: [10, 0],
        delay: anime.stagger(100, {start: 600}),
        easing: 'easeOutSine'
      });
    }
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
    
    // Add button animation
    anime({
      targets: '.play-pause-button',
      scale: [1, 1.2, 1],
      duration: 400,
      easing: 'easeInOutSine'
    });
    
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
    
    // Skip button animation
    anime({
      targets: '.skip-back-button',
      translateX: [-5, 0],
      duration: 200,
      easing: 'easeOutQuad'
    });
  };

  const handleSkipForward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.min(
      audioRef.current.duration || 0,
      audioRef.current.currentTime + 10
    );
    
    // Skip button animation
    anime({
      targets: '.skip-forward-button',
      translateX: [5, 0],
      duration: 200,
      easing: 'easeOutQuad'
    });
  };

  const handleFileUpload = (file: File) => {
    // Animate file upload button
    anime({
      targets: '.upload-button',
      backgroundColor: ['rgba(255, 255, 255, 0.2)', 'rgba(0, 0, 0, 0.5)', 'rgba(255, 255, 255, 0)'],
      duration: 800,
      easing: 'easeOutQuad'
    });
    
    // Stop any existing media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    // Revoke previous object URL to prevent memory leaks
    if (audioSrc && audioSrc.startsWith('blob:')) {
      URL.revokeObjectURL(audioSrc);
    }
    
    // If audioRef.current has srcObject, remove it
    if (audioRef.current && audioRef.current.srcObject) {
      audioRef.current.srcObject = null;
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
    
    // Animate track info
    anime({
      targets: '.track-info',
      translateY: [10, 0],
      opacity: [0, 1],
      duration: 600,
      easing: 'easeOutQuad'
    });
  };

  const handleCaptureBackgroundAudio = async () => {
    // Animate capture button
    anime({
      targets: '.capture-button',
      scale: [1, 1.1, 1],
      duration: 400,
      easing: 'easeInOutBack'
    });
    
    if (isCapturing) {
      toast.info("Already trying to capture audio");
      return;
    }
    
    // Check permission status first
    if (permissionStatus === 'prompt' || permissionStatus === 'unknown') {
      setShowPermissionPrompt(true);
      return;
    }
    
    if (permissionStatus === 'denied') {
      toast.error("Microphone permission is required to capture audio");
      return;
    }
    
    // Stop previous streams if any
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // Capture new stream
    const stream = await captureBackgroundAudio();
    
    if (stream) {
      mediaStreamRef.current = stream;
      
      // Revoke previous object URL if exists
      if (audioSrc && audioSrc.startsWith('blob:')) {
        URL.revokeObjectURL(audioSrc);
        setAudioSrc(null); // Clear the audio source URL
      }
      
      if (audioRef.current) {
        // Use srcObject instead of src for MediaStream
        audioRef.current.srcObject = stream;
        
        // Start playing the captured audio
        setIsPlaying(true);
        audioRef.current.play().catch(err => {
          console.error('Failed to play background audio:', err);
          toast.error('Failed to play background audio. Please try again.');
          setIsPlaying(false);
        });
      }
      
      // Set default track info if not available from media session
      if (!mediaInfo.title) {
        setTrackInfo({
          title: 'Background Audio',
          artist: 'System'
        });
        
        // Animate track info
        anime({
          targets: '.track-info',
          translateY: [10, 0],
          opacity: [0, 1],
          duration: 600,
          easing: 'easeOutQuad'
        });
      }
    }
  };

  const handlePermissionResponse = async (granted: boolean) => {
    setShowPermissionPrompt(false);
    
    if (granted) {
      const success = await requestPermission();
      if (success) {
        // Wait a brief moment before trying to capture audio
        setTimeout(() => {
          handleCaptureBackgroundAudio();
        }, 500);
      }
    }
  };

  return (
    <div className="flex flex-col h-full w-full" ref={playerContainerRef}>
      {/* Permission prompt modal */}
      {showPermissionPrompt && (
        <div className="fixed inset-0 bg-black/700 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-lg max-w-md mx-4">
            <h3 className="text-xl font-bold mb-2">Microphone Permission Required</h3>
            <p className="text-gray-300 mb-4">
              To capture background audio, we need permission to access your microphone.
              Your privacy is important - audio is processed locally and not sent to any server.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <Button 
                variant="outline"
                onClick={() => handlePermissionResponse(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => handlePermissionResponse(true)}
              >
                Allow Microphone
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Visualizer area */}
      <div className="flex-1 mb-4" ref={visualizerRef}>
        <DotMatrixVisualizer audioElement={audioRef.current} isPlaying={isPlaying} />
      </div>
      
      {/* Track info */}
      <div className="mb-4 text-center track-info">
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
      <div className="mb-6" ref={controlsRef}>
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
        <div className="upload-button">
          <FileUploader onFileUpload={handleFileUpload} />
        </div>
        
        {isAvailable && (
          <Button 
            variant="outline" 
            className="capture-button bg-zinc-900 border-zinc-700 flex items-center gap-2 text-white hover:bg-zinc-800"
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
