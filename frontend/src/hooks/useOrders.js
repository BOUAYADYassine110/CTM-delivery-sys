import { useState, useEffect } from 'react';
import apiClient from '../api/client';

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get('/orders');
      setOrders(data.orders || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData) => {
    setLoading(true);
    try {
      const data = await apiClient.post('/orders', orderData);
      setError(null);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const trackOrder = async (trackingNumber) => {
    setLoading(true);
    try {
      const data = await apiClient.get(`/tracking/${trackingNumber}`);
      setError(null);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return { orders, loading, error, createOrder, trackOrder, fetchOrders };
};
