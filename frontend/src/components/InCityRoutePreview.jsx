import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import { AlertCircle, TrendingUp, Clock, DollarSign } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom icons
const senderIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const recipientIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function InCityRoutePreview({ senderCoords, recipientCoords, city }) {
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (senderCoords && recipientCoords) {
      fetchRoute();
    }
  }, [senderCoords, recipientCoords]);

  const fetchRoute = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/incity/calculate-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_coords: senderCoords,
          recipient_coords: recipientCoords,
          city: city
        })
      });
      
      const data = await response.json();
      console.log('Route API response:', data);
      if (data.success) {
        console.log('Route data:', data.route);
        setRouteData(data.route);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  if (!senderCoords || !recipientCoords) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg border">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-center space-x-2">
        <AlertCircle className="h-5 w-5 text-red-500" />
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  if (!routeData) {
    console.log('No route data available');
    return null;
  }
  
  console.log('Rendering with routeData:', routeData);

  const center = [
    (senderCoords[0] + recipientCoords[0]) / 2,
    (senderCoords[1] + recipientCoords[1]) / 2
  ];

  const getTrafficColor = (level) => {
    if (level === 'high') return 'text-red-600';
    if (level === 'medium') return 'text-orange-600';
    return 'text-green-600';
  };

  const getWeatherIcon = (condition) => {
    if (condition.includes('rain')) return '🌧️';
    if (condition.includes('cloud')) return '☁️';
    return '☀️';
  };

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-lg border">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-xs text-gray-600">Durée estimée</p>
              <p className="text-sm font-bold">{routeData.duration_minutes?.toFixed(1) || '0'} min</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-3 rounded-lg border">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-xs text-gray-600">Distance</p>
              <p className="text-sm font-bold">{routeData.distance_km?.toFixed(2) || '0'} km</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-3 rounded-lg border">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-purple-500" />
            <div>
              <p className="text-xs text-gray-600">Coût estimé</p>
              <p className="text-sm font-bold">{routeData.estimated_cost} DH</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-3 rounded-lg border">
          <div className="flex items-center space-x-2">
            <span className="text-xl">{getWeatherIcon(routeData.weather?.condition || '')}</span>
            <div>
              <p className="text-xs text-gray-600">Météo</p>
              <p className="text-sm font-bold">{routeData.weather?.temperature || '--'}°C</p>
            </div>
          </div>
        </div>
      </div>

      {/* Traffic Alert */}
      {routeData.traffic_level !== 'low' && (
        <div className={`p-3 rounded-lg border ${
          routeData.traffic_level === 'high' 
            ? 'bg-red-50 border-red-200' 
            : 'bg-orange-50 border-orange-200'
        }`}>
          <p className={`text-sm font-medium ${getTrafficColor(routeData.traffic_level)}`}>
            ⚠️ Trafic {routeData.traffic_level === 'high' ? 'dense' : 'modéré'} détecté - 
            Délai supplémentaire: +{routeData.traffic_delay_minutes} min
          </p>
        </div>
      )}

      {/* Map */}
      <div className="h-64 rounded-lg overflow-hidden border-2 border-gray-300">
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {routeData.geometry && (
            <Polyline 
              positions={routeData.geometry} 
              color={routeData.traffic_level === 'high' ? 'red' : routeData.traffic_level === 'medium' ? 'orange' : 'blue'}
              weight={4}
            />
          )}
          
          <Marker position={senderCoords} icon={senderIcon}>
            <Popup>📦 Point de départ</Popup>
          </Marker>
          <Marker position={recipientCoords} icon={recipientIcon}>
            <Popup>🎯 Destination</Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}
