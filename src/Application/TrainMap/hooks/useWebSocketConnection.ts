import { useEffect, useState } from 'react';
import { trainDataService } from '../services/trainDataService';

export const useWebSocketConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize WebSocket connection
  useEffect(() => {
    const connectToServer = async () => {
      try {
        setIsLoading(true);
        await trainDataService.connect();
        trainDataService.startAutoPing();
      } catch (error) {
        console.error('Failed to connect to WebSocket server:', error);
      } finally {
        setIsLoading(false);
      }
    };

    connectToServer();

    // Cleanup on unmount
    return () => {
      trainDataService.disconnect();
    };
  }, []);

  // Listen for connection status changes
  useEffect(() => {
    const unsubscribe = trainDataService.onConnectionChange((connected) => {
      setIsConnected(connected);
    });

    return unsubscribe;
  }, []);

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      await trainDataService.connect();
    } catch (error) {
      console.error('Failed to reconnect:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    trainDataService.disconnect();
  };

  return {
    isConnected,
    isLoading,
    handleConnect,
    handleDisconnect,
  };
};
