
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface MediaSessionInfo {
  title?: string;
  artist?: string;
  album?: string;
  artwork?: readonly MediaImage[];
}

const useBackgroundAudio = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [mediaInfo, setMediaInfo] = useState<MediaSessionInfo>({});
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied' | 'unknown'>('unknown');

  useEffect(() => {
    // Check if MediaSession API is available
    if ('mediaSession' in navigator) {
      setIsAvailable(true);
    } else {
      setIsAvailable(false);
    }

    // Check if we can access permission status
    if (navigator.permissions) {
      checkPermissionStatus();
    }
  }, []);

  const checkPermissionStatus = async () => {
    try {
      const status = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      setPermissionStatus(status.state);
      
      // Listen for changes to permission state
      status.addEventListener('change', () => {
        setPermissionStatus(status.state);
      });
    } catch (error) {
      console.error("Error checking permission status:", error);
    }
  };

  const requestPermission = async () => {
    try {
      // Just asking for audio permission - this will trigger the permission prompt
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop tracks immediately, we just needed the permission
      setPermissionStatus('granted');
      toast.success("Microphone permission granted");
      return true;
    } catch (error) {
      console.error("Error requesting permission:", error);
      toast.error("Microphone permission denied");
      setPermissionStatus('denied');
      return false;
    }
  };

  const captureBackgroundAudio = async () => {
    if (!isAvailable) {
      toast.error("Media Session API is not available in your browser");
      return null;
    }

    // If permission status is unknown or prompt, request it first
    if (permissionStatus !== 'granted') {
      const permissionGranted = await requestPermission();
      if (!permissionGranted) return null;
    }

    try {
      // Request audio capture permission
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        audio: true,
        video: false
      });
      
      // Get the audio track
      const audioTrack = stream.getAudioTracks()[0];
      
      if (!audioTrack) {
        toast.error("No audio track found");
        return null;
      }

      // Get current media session info if available
      if (navigator.mediaSession.metadata) {
        const { title, artist, album, artwork } = navigator.mediaSession.metadata;
        setMediaInfo({ title, artist, album, artwork });
      }
      
      toast.success("Background audio captured successfully");
      return stream;
      
    } catch (error) {
      console.error("Error capturing background audio:", error);
      toast.error("Failed to capture background audio");
      return null;
    }
  };

  return { 
    isAvailable, 
    captureBackgroundAudio, 
    mediaInfo, 
    permissionStatus, 
    requestPermission 
  };
};

export default useBackgroundAudio;
