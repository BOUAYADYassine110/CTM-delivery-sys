import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export function useDriverTracking(trackingNumber) {
  const [driverLocation, setDriverLocation] = useState(null);
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!trackingNumber) return;

    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      console.log('Driver tracking connected');
      setConnected(true);
      newSocket.emit('subscribe_order', { tracking_number: trackingNumber });
    });

    newSocket.on('disconnect', () => {
      console.log('Driver tracking disconnected');
      setConnected(false);
    });

    newSocket.on('driver_location_update', (data) => {
      console.log('Driver location update:', data);
      if (data.tracking_number === trackingNumber) {
        setDriverLocation({
          location: data.location,
          timestamp: data.timestamp,
          driver_id: data.driver_id
        });
      }
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.emit('unsubscribe_order', { tracking_number: trackingNumber });
        newSocket.disconnect();
      }
    };
  }, [trackingNumber]);

  return { driverLocation, connected, socket };
}
