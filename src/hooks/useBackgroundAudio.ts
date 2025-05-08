
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface MediaSessionInfo {
  title?: string;
  artist?: string;
  album?: string;
  artwork?: MediaImage[];
}

const useBackgroundAudio = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [mediaInfo, setMediaInfo] = useState<MediaSessionInfo>({});

  useEffect(() => {
    // Check if MediaSession API is available
    if ('mediaSession' in navigator) {
      setIsAvailable(true);
    } else {
      setIsAvailable(false);
    }
  }, []);

  const captureBackgroundAudio = async () => {
    if (!isAvailable) {
      toast.error("Media Session API is not available in your browser");
      return null;
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

  return { isAvailable, captureBackgroundAudio, mediaInfo };
};

export default useBackgroundAudio;
