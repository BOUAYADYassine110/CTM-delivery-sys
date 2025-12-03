import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Radio, Truck, Package, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import apiClient from '../api/client';
import { useDriverTracking } from '../hooks/useDriverTracking';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom icons
const driverIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2972/2972185.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

export default function AdminLiveTracking() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeOrders, setActiveOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { driverLocation, connected } = useDriverTracking(selectedOrder?.tracking_number);
  
  useEffect(() => {
    console.log('Driver location update:', driverLocation);
    console.log('WebSocket connected:', connected);
    console.log('Selected order:', selectedOrder?.tracking_number);
  }, [driverLocation, connected, selectedOrder]);

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/dashboard');
      return;
    }
    fetchActiveOrders();
    const interval = setInterval(fetchActiveOrders, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchActiveOrders = async () => {
    try {
      const data = await apiClient.get('/orders');
      const active = data.orders.filter(order => 
        ['pickup_in_progress', 'in_transit', 'out_for_delivery'].includes(order.status)
      );
      setActiveOrders(active);
      if (!selectedOrder && active.length > 0) {
        setSelectedOrder(active[0]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pickup_in_progress: 'bg-yellow-100 text-yellow-800',
      in_transit: 'bg-blue-100 text-blue-800',
      out_for_delivery: 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pickup_in_progress: 'Ramassage en cours',
      in_transit: 'En transit',
      out_for_delivery: 'En livraison'
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Suivi en Temps Réel</h1>
              <p className="text-gray-600 mt-1">
                {activeOrders.length} livraison{activeOrders.length > 1 ? 's' : ''} active{activeOrders.length > 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {connected && (
                <div className="flex items-center text-sm text-green-600">
                  <Radio className="h-4 w-4 mr-2 animate-pulse" />
                  Connecté
                </div>
              )}
              <Button onClick={fetchActiveOrders} variant="secondary">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Radio className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-900 mb-1">
                  📍 Suivi GPS en Temps Réel
                </h3>
                <p className="text-sm text-blue-800">
                  Cette page affiche toutes les livraisons actives avec la position GPS du chauffeur mise à jour en temps réel.
                  Sélectionnez une commande dans la liste pour voir son itinéraire et suivre le chauffeur sur la carte.
                </p>
              </div>
            </div>
          </div>
        </div>

        {activeOrders.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Truck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucune livraison active pour le moment
              </h3>
              <p className="text-gray-600 mb-6">
                Les livraisons avec les statuts suivants apparaissent ici:
              </p>
              <div className="max-w-md mx-auto space-y-2 text-left">
                <div className="flex items-center space-x-2 text-sm">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Ramassage en cours
                  </span>
                  <span className="text-gray-600">- Le chauffeur va chercher le colis</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    En transit
                  </span>
                  <span className="text-gray-600">- Le colis est en route</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    En livraison
                  </span>
                  <span className="text-gray-600">- Le chauffeur livre le colis</span>
                </div>
              </div>
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>Pour tester:</strong> Créez une commande et utilisez le simulateur de chauffeur
                </p>
                <code className="text-xs text-blue-600 mt-2 block">
                  python backend/simulate_driver.py
                </code>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Orders List */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <h2 className="text-lg font-semibold mb-4">Livraisons Actives</h2>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {activeOrders.map((order) => (
                    <button
                      key={order.tracking_number}
                      onClick={() => setSelectedOrder(order)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition ${
                        selectedOrder?.tracking_number === order.tracking_number
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Package className="h-4 w-4 text-gray-500" />
                          <span className="font-mono text-sm font-semibold">
                            {order.tracking_number}
                          </span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <p>📍 {order.sender.city} → {order.recipient.city}</p>
                        <p>👤 {order.recipient.name}</p>
                        {order.assigned_pickup_driver && (
                          <p className="text-blue-600">🚗 {order.assigned_pickup_driver}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            </div>

            {/* Map View */}
            <div className="lg:col-span-2">
              <Card>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">
                    Carte - {selectedOrder?.tracking_number}
                  </h2>
                  {driverLocation && (
                    <div className="text-xs text-gray-600">
                      Dernière mise à jour: {new Date(driverLocation.timestamp).toLocaleTimeString()}
                    </div>
                  )}
                </div>
                
                {selectedOrder?.sender?.coordinates && selectedOrder?.recipient?.coordinates ? (
                  <div className="h-[600px] rounded-lg overflow-hidden">
                    <MapContainer
                      center={[
                        (selectedOrder.sender.coordinates[0] + selectedOrder.recipient.coordinates[0]) / 2,
                        (selectedOrder.sender.coordinates[1] + selectedOrder.recipient.coordinates[1]) / 2
                      ]}
                      zoom={13}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        attribution='&copy; OpenStreetMap'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      
                      {/* Route line */}
                      {selectedOrder.route_geometry && (
                        <Polyline
                          positions={selectedOrder.route_geometry}
                          pathOptions={{ color: '#0066cc', weight: 4 }}
                        />
                      )}
                      
                      {/* Sender marker */}
                      <Marker position={selectedOrder.sender.coordinates}>
                        <Popup>
                          <div className="text-center">
                            <p className="font-semibold">📦 Expéditeur</p>
                            <p className="text-sm">{selectedOrder.sender.name}</p>
                          </div>
                        </Popup>
                      </Marker>
                      
                      {/* Recipient marker */}
                      <Marker position={selectedOrder.recipient.coordinates}>
                        <Popup>
                          <div className="text-center">
                            <p className="font-semibold">🎯 Destinataire</p>
                            <p className="text-sm">{selectedOrder.recipient.name}</p>
                          </div>
                        </Popup>
                      </Marker>
                      
                      {/* Driver marker */}
                      {driverLocation?.location ? (
                        <Marker position={driverLocation.location} icon={driverIcon}>
                          <Popup>
                            <div className="text-center">
                              <p className="font-semibold">🚗 Chauffeur</p>
                              <p className="text-xs">{driverLocation.driver_id}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(driverLocation.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </Popup>
                        </Marker>
                      ) : (
                        <div className="absolute top-4 left-4 bg-yellow-100 border border-yellow-300 px-3 py-2 rounded-lg text-xs text-yellow-800 z-[1000]">
                          ⏳ En attente de la position du chauffeur...
                        </div>
                      )}
                    </MapContainer>
                  </div>
                ) : (
                  <div className="h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Coordonnées non disponibles pour cette commande</p>
                  </div>
                )}

                {/* Order Details */}
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Distance</p>
                    <p className="text-lg font-semibold">
                      {selectedOrder?.route_distance_km?.toFixed(2) || '--'} km
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Durée estimée</p>
                    <p className="text-lg font-semibold">
                      {selectedOrder?.route_duration_minutes?.toFixed(0) || '--'} min
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
