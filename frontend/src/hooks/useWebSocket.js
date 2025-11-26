import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export const useWebSocket = (trackingNumber) => {
  const [orderStatus, setOrderStatus] = useState(null);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!trackingNumber) return;

    const newSocket = io(import.meta.env.VITE_WS_URL || 'http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setConnected(true);
      newSocket.emit('subscribe_order', { tracking_number: trackingNumber });
    });

    newSocket.on('order_update', (data) => {
      setOrderStatus(data);
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    return () => {
      newSocket.emit('unsubscribe_order', { tracking_number: trackingNumber });
      newSocket.close();
    };
  }, [trackingNumber]);

  return { orderStatus, socket, connected };
};
