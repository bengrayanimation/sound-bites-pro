import { useState, useCallback, useEffect } from 'react';

interface PermissionsState {
  microphone: 'granted' | 'denied' | 'prompt' | 'unknown';
  storage: 'granted' | 'denied' | 'prompt' | 'unknown';
}

export function usePermissions() {
  const [permissions, setPermissions] = useState<PermissionsState>({
    microphone: 'unknown',
    storage: 'unknown',
  });
  const [isRequesting, setIsRequesting] = useState(false);

  // Check current permission status
  const checkPermissions = useCallback(async () => {
    try {
      // Check microphone permission
      if ('permissions' in navigator) {
        try {
          const micResult = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          setPermissions(prev => ({ ...prev, microphone: micResult.state as 'granted' | 'denied' | 'prompt' }));
          
          micResult.onchange = () => {
            setPermissions(prev => ({ ...prev, microphone: micResult.state as 'granted' | 'denied' | 'prompt' }));
          };
        } catch {
          // Permission API not supported for microphone, will check on request
          setPermissions(prev => ({ ...prev, microphone: 'prompt' }));
        }
      }

      // Storage permission is generally auto-granted on web, but we track it for native apps
      setPermissions(prev => ({ ...prev, storage: 'granted' }));
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  }, []);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  const requestMicrophonePermission = useCallback(async (): Promise<boolean> => {
    setIsRequesting(true);
    try {
      // Request microphone access - this will trigger the permission prompt
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      
      // Stop the stream immediately - we just needed the permission
      stream.getTracks().forEach(track => track.stop());
      
      setPermissions(prev => ({ ...prev, microphone: 'granted' }));
      return true;
    } catch (error: any) {
      console.error('Microphone permission denied:', error);
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setPermissions(prev => ({ ...prev, microphone: 'denied' }));
      }
      return false;
    } finally {
      setIsRequesting(false);
    }
  }, []);

  const requestStoragePermission = useCallback(async (): Promise<boolean> => {
    // On web, storage is auto-granted
    // For native apps via Capacitor/Median, this would interface with native APIs
    setPermissions(prev => ({ ...prev, storage: 'granted' }));
    return true;
  }, []);

  const requestAllPermissions = useCallback(async (): Promise<boolean> => {
    setIsRequesting(true);
    try {
      const micGranted = await requestMicrophonePermission();
      const storageGranted = await requestStoragePermission();
      return micGranted && storageGranted;
    } finally {
      setIsRequesting(false);
    }
  }, [requestMicrophonePermission, requestStoragePermission]);

  return {
    permissions,
    isRequesting,
    requestMicrophonePermission,
    requestStoragePermission,
    requestAllPermissions,
    checkPermissions,
  };
}
