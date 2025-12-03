import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import apiClient from '../api/client';
import { useDriverTracking } from '../hooks/useDriverTracking';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons with actual representations
const senderIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3774/3774299.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35]
});

const recipientIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3774/3774278.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35]
});

const motorcycleIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2972/2972185.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

const vanIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3097/3097136.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

const truckIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1355/1355463.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

function MapBounds({ bounds }) {
  const map = useMap();
  
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  
  return null;
}

export default function RouteMap({ order }) {
  const [routeData, setRouteData] = useState(null);
  const [driverPosition, setDriverPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const { driverLocation, connected } = useDriverTracking(order?.tracking_number);
  
  const senderCoords = order?.sender?.coordinates;
  const recipientCoords = order?.recipient?.coordinates;
  const isInCity = order?.sender?.city === order?.recipient?.city;
  
  // Select vehicle icon based on recommended vehicle or package weight
  const getVehicleIcon = () => {
    const vehicleType = order?.delivery_insights?.recommended_vehicle;
    const weight = order?.package?.weight || 0;
    
    if (vehicleType === 'motorcycle' || weight <= 5) return motorcycleIcon;
    if (vehicleType === 'van' || weight <= 15) return vanIcon;
    return truckIcon;
  };
  
  useEffect(() => {
    if (!senderCoords || !recipientCoords) {
      console.log('Missing coordinates:', { senderCoords, recipientCoords });
      setLoading(false);
      return;
    }
    
    console.log('Fetching route for:', { senderCoords, recipientCoords, isInCity, city: order?.sender?.city });
    
    const fetchRoute = async () => {
      try {
        // For in-city, use incity route calculation
        if (isInCity) {
          console.log('Calling incity route API...');
          const response = await apiClient.post('/incity/calculate-route', {
            sender_coords: senderCoords,
            recipient_coords: recipientCoords,
            city: order.sender.city
          });
          
          console.log('Route API response:', response);
          
          if (response?.success && response?.route) {
            console.log('Route data:', response.route);
            console.log('Geometry structure:', response.route.geometry);
            console.log('First point:', response.route.geometry?.[0]);
            console.log('Geometry is array?', Array.isArray(response.route.geometry));
            setRouteData(response.route);
            // Start driver animation
            if (order.status !== 'delivered' && response.route.geometry) {
              animateDriver(response.route.geometry);
            }
          } else {
            console.warn('No route data in response', response);
            setRouteData({
              geometry: [senderCoords, recipientCoords],
              distance_km: 0,
              duration_minutes: 0
            });
          }
        } else {
          // Inter-city: just show straight line for now
          console.log('Inter-city order, showing straight line');
          setRouteData({
            geometry: [senderCoords, recipientCoords],
            distance_km: 0,
            duration_minutes: 0
          });
        }
      } catch (error) {
        console.error('Error fetching route:', error);
        setRouteData({
          geometry: [senderCoords, recipientCoords],
          distance_km: 0,
          duration_minutes: 0
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoute();
  }, [senderCoords, recipientCoords, isInCity, order]);
  
  // Update driver position from real-time tracking
  useEffect(() => {
    if (driverLocation?.location) {
      setDriverPosition(driverLocation.location);
    }
  }, [driverLocation]);
  
  const animateDriver = (routeGeometry) => {
    if (!routeGeometry || routeGeometry.length < 2) return;
    
    // Only animate if no real-time tracking
    if (connected) return;
    
    let index = 0;
    const interval = setInterval(() => {
      if (index >= routeGeometry.length) {
        clearInterval(interval);
        return;
      }
      setDriverPosition(routeGeometry[index]);
      index++;
    }, 2000);
    
    return () => clearInterval(interval);
  };
  
  if (!senderCoords || !recipientCoords) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-gray-700 font-medium mb-2">📍 Carte non disponible</p>
          <p className="text-sm text-gray-600 mb-4">
            Cette commande a été créée avant l'ajout de la fonctionnalité de carte.
          </p>
          <p className="text-xs text-gray-500">
            Itinéraire: {order?.sender?.city} → {order?.recipient?.city}
          </p>
        </div>
      </div>
    );
  }

  const bounds = L.latLngBounds([senderCoords, recipientCoords]);
  const center = [
    (senderCoords[0] + recipientCoords[0]) / 2,
    (senderCoords[1] + recipientCoords[1]) / 2
  ];

  return (
    <div className="h-96 rounded-lg overflow-hidden shadow-lg">
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
        
        <Marker position={senderCoords} icon={senderIcon}>
          <Popup>
            <div className="text-center">
              <p className="font-semibold">📦 Expéditeur</p>
              <p className="text-sm">{order.sender.name}</p>
              <p className="text-xs text-gray-600">{order.sender.address}</p>
            </div>
          </Popup>
        </Marker>
        
        <Marker position={recipientCoords} icon={recipientIcon}>
          <Popup>
            <div className="text-center">
              <p className="font-semibold">🎯 Destinataire</p>
              <p className="text-sm">{order.recipient.name}</p>
              <p className="text-xs text-gray-600">{order.recipient.address}</p>
            </div>
          </Popup>
        </Marker>
        
        {driverPosition && order.status !== 'delivered' && (
          <Marker position={driverPosition} icon={getVehicleIcon()}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold">
                  {order?.delivery_insights?.recommended_vehicle === 'motorcycle' ? '🏍️' : 
                   order?.delivery_insights?.recommended_vehicle === 'van' ? '🚐' : '🚚'} Chauffeur
                </p>
                <p className="text-xs">En route vers la destination</p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Main route polyline */}
        {routeData?.geometry && routeData.geometry.length > 1 && (() => {
          console.log('Rendering polyline with points:', routeData.geometry.length);
          console.log('Sample points:', routeData.geometry.slice(0, 5));
          return (
            <Polyline
              positions={routeData.geometry}
              pathOptions={{
                color: '#0066cc',
                weight: 6,
                opacity: 1
              }}
            />
          );
        })()}
        
        <MapBounds bounds={bounds} />
      </MapContainer>
    </div>
  );
}
