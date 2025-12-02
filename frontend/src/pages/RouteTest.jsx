import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from 'react-leaflet';
import { motion } from 'framer-motion';
import L from 'leaflet';
import apiClient from '../api/client';
import Card from '../components/ui/Card';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function MapClickHandler({ onPickup, onDelivery, mode }) {
  useMapEvents({
    click(e) {
      const coords = [e.latlng.lat, e.latlng.lng];
      if (mode === 'pickup') {
        onPickup(coords);
      } else if (mode === 'delivery') {
        onDelivery(coords);
      }
    },
  });
  return null;
}

export default function RouteTest() {
  const [pickupPoint, setPickupPoint] = useState(null);
  const [deliveryPoint, setDeliveryPoint] = useState(null);
  const [mode, setMode] = useState('pickup');
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchRoute = async (pickup, delivery) => {
    setLoading(true);
    try {
      const response = await apiClient.post('/incity/calculate-route', {
        sender_coords: pickup,
        recipient_coords: delivery,
        city: 'Casablanca'
      });
      
      console.log('Route response:', response);
      
      if (response.success) {
        setRouteData(response.route);
      }
    } catch (error) {
      console.error('Route error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePickup = (coords) => {
    setPickupPoint(coords);
    if (deliveryPoint) {
      fetchRoute(coords, deliveryPoint);
    }
  };

  const handleDelivery = (coords) => {
    setDeliveryPoint(coords);
    if (pickupPoint) {
      fetchRoute(pickupPoint, coords);
    }
  };

  const reset = () => {
    setPickupPoint(null);
    setDeliveryPoint(null);
    setRouteData(null);
    setMode('pickup');
  };

  return (
    <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Test de Route API</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card>
              <h3 className="font-semibold mb-3">Instructions</h3>
              <div className="space-y-2 text-sm">
                <p>1. Cliquez sur "Définir Pickup" puis cliquez sur la carte</p>
                <p>2. Cliquez sur "Définir Livraison" puis cliquez sur la carte</p>
                <p>3. La route s'affichera automatiquement</p>
              </div>
              
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => setMode('pickup')}
                  className={`w-full px-4 py-2 rounded-lg font-medium transition ${
                    mode === 'pickup'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  🟢 Définir Pickup
                </button>
                
                <button
                  onClick={() => setMode('delivery')}
                  className={`w-full px-4 py-2 rounded-lg font-medium transition ${
                    mode === 'delivery'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  🔴 Définir Livraison
                </button>
                
                <button
                  onClick={reset}
                  className="w-full px-4 py-2 rounded-lg font-medium bg-gray-700 text-white hover:bg-gray-800 transition"
                >
                  🔄 Réinitialiser
                </button>
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold mb-3">Points</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="font-medium text-green-600">Pickup:</p>
                  <p className="text-xs text-gray-600">
                    {pickupPoint ? `${pickupPoint[0].toFixed(6)}, ${pickupPoint[1].toFixed(6)}` : 'Non défini'}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-red-600">Livraison:</p>
                  <p className="text-xs text-gray-600">
                    {deliveryPoint ? `${deliveryPoint[0].toFixed(6)}, ${deliveryPoint[1].toFixed(6)}` : 'Non défini'}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold mb-3">Résultats</h3>
              {loading && <p className="text-sm text-gray-600">Chargement...</p>}
              {routeData && (
                <div className="space-y-2 text-sm">
                  <p><strong>Distance:</strong> {routeData.distance_km} km</p>
                  <p><strong>Durée:</strong> {routeData.duration_minutes} min</p>
                  <p><strong>Coût:</strong> {routeData.estimated_cost} DH</p>
                  <p><strong>Trafic:</strong> {routeData.traffic_level}</p>
                  <p><strong>Points:</strong> {routeData.geometry?.length || 0}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Météo: {routeData.weather?.temperature}°C - {routeData.weather?.condition}
                  </p>
                </div>
              )}
            </Card>
          </div>

          <Card>
            <div className="h-[600px] rounded-lg overflow-hidden">
              <MapContainer
                center={[33.5731, -7.6163]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                <MapClickHandler 
                  onPickup={handlePickup}
                  onDelivery={handleDelivery}
                  mode={mode}
                />
                
                {pickupPoint && (
                  <Marker position={pickupPoint} icon={greenIcon} />
                )}
                
                {deliveryPoint && (
                  <Marker position={deliveryPoint} icon={redIcon} />
                )}
                
                {routeData?.geometry && routeData.geometry.length > 1 && (
                  <Polyline
                    positions={routeData.geometry}
                    pathOptions={{
                      color: routeData.traffic_level === 'high' ? '#ef4444' : routeData.traffic_level === 'medium' ? '#f59e0b' : '#0066cc',
                      weight: 6,
                      opacity: 0.8
                    }}
                  />
                )}
              </MapContainer>
            </div>
          </Card>
        </motion.div>
    </div>
  );
}
