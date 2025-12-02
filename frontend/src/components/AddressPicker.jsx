import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const CITY_COORDS = {
  'Casablanca': [33.5731, -7.6163],
  'Rabat': [34.0209, -6.8498],
  'Marrakech': [31.6295, -7.9811],
  'Fès': [34.0181, -4.9998],
  'Tanger': [35.7595, -5.8137],
  'Agadir': [30.4278, -9.5981],
  'Meknès': [33.8935, -5.5471],
  'Oujda': [34.6867, -1.9085],
  'Kenitra': [34.2610, -6.5802],
  'Tétouan': [35.5889, -5.3684],
};

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function AddressPicker({ city, onLocationSelect, initialPosition }) {
  const [position, setPosition] = useState(initialPosition || CITY_COORDS[city] || [33.5731, -7.6163]);
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (city && CITY_COORDS[city]) {
      setPosition(CITY_COORDS[city]);
    }
  }, [city]);

  useEffect(() => {
    if (position) {
      // Reverse geocode to get address
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position[0]}&lon=${position[1]}`)
        .then(res => res.json())
        .then(data => {
          if (data.display_name) {
            const detectedAddress = data.display_name;
            setAddress(detectedAddress);
            onLocationSelect(position, detectedAddress);
          } else {
            onLocationSelect(position, '');
          }
        })
        .catch(err => {
          console.error('Geocoding error:', err);
          onLocationSelect(position, '');
        });
    }
  }, [position, onLocationSelect]);

  if (!city) {
    return (
      <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Sélectionnez d'abord une ville</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
        <MapPin className="h-4 w-4 text-blue-500" />
        <p>Cliquez sur la carte pour sélectionner l'adresse exacte</p>
      </div>
      
      {address && (
        <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
          <strong>Adresse détectée:</strong> {address}
        </div>
      )}
      
      <div className="h-64 rounded-lg overflow-hidden border-2 border-gray-300">
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} />
        </MapContainer>
      </div>
    </div>
  );
}
