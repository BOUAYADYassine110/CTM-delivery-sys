import requests
import openrouteservice
from config import Config

# Moroccan cities coordinates
CITY_COORDS = {
    'Casablanca': [-7.6163, 33.5731],
    'Rabat': [-6.8498, 34.0209],
    'Marrakech': [-7.9811, 31.6295],
    'Fès': [-4.9998, 34.0181],
    'Tanger': [-5.8137, 35.7595],
    'Agadir': [-9.5981, 30.4278],
    'Meknès': [-5.5471, 33.8935],
    'Oujda': [-1.9085, 34.6867],
    'Kenitra': [-6.5802, 34.2610],
    'Tétouan': [-5.3684, 35.5889],
}

class RouteService:
    def __init__(self):
        self.client = openrouteservice.Client(key=Config.OPENROUTE_API_KEY) if Config.OPENROUTE_API_KEY else None
    
    def get_route(self, origin_city, destination_city):
        """Get optimized route between two cities"""
        if not self.client:
            return self._get_mock_route(origin_city, destination_city)
        
        try:
            coords = [CITY_COORDS[origin_city], CITY_COORDS[destination_city]]
            route = self.client.directions(
                coordinates=coords,
                profile='driving-car',
                format='geojson'
            )
            
            distance = route['features'][0]['properties']['segments'][0]['distance'] / 1000  # km
            duration = route['features'][0]['properties']['segments'][0]['duration'] / 60  # minutes
            
            return {
                'distance_km': round(distance, 2),
                'duration_minutes': round(duration, 2),
                'geometry': route['features'][0]['geometry']
            }
        except:
            return self._get_mock_route(origin_city, destination_city)
    
    def optimize_multi_stop_route(self, cities):
        """Optimize route for multiple cities"""
        if not self.client or len(cities) < 2:
            return {'cities': cities, 'total_distance': 0, 'total_duration': 0}
        
        try:
            coords = [CITY_COORDS[city] for city in cities if city in CITY_COORDS]
            route = self.client.directions(
                coordinates=coords,
                profile='driving-car',
                optimize_waypoints=True
            )
            
            total_distance = sum(seg['distance'] for seg in route['routes'][0]['segments']) / 1000
            total_duration = sum(seg['duration'] for seg in route['routes'][0]['segments']) / 60
            
            return {
                'cities': cities,
                'total_distance_km': round(total_distance, 2),
                'total_duration_minutes': round(total_duration, 2),
                'optimized': True
            }
        except:
            return {'cities': cities, 'total_distance': 0, 'total_duration': 0, 'optimized': False}
    
    def _get_mock_route(self, origin, destination):
        """Mock route data when API is not available"""
        mock_distances = {
            ('Casablanca', 'Rabat'): 87,
            ('Casablanca', 'Marrakech'): 240,
            ('Rabat', 'Fès'): 200,
            ('Marrakech', 'Agadir'): 250,
        }
        
        distance = mock_distances.get((origin, destination), 150)
        return {
            'distance_km': distance,
            'duration_minutes': distance * 1.2,
            'geometry': None
        }

class WeatherService:
    def __init__(self):
        self.api_key = Config.WEATHER_API_KEY
        self.base_url = "http://api.openweathermap.org/data/2.5/weather"
    
    def get_weather(self, city):
        """Get current weather for a city"""
        if not self.api_key:
            return self._get_mock_weather(city)
        
        try:
            coords = CITY_COORDS.get(city)
            if not coords:
                return self._get_mock_weather(city)
            
            params = {
                'lat': coords[1],
                'lon': coords[0],
                'appid': self.api_key,
                'units': 'metric'
            }
            
            response = requests.get(self.base_url, params=params, timeout=5)
            data = response.json()
            
            return {
                'city': city,
                'temperature': data['main']['temp'],
                'condition': data['weather'][0]['main'],
                'description': data['weather'][0]['description'],
                'humidity': data['main']['humidity'],
                'wind_speed': data['wind']['speed']
            }
        except:
            return self._get_mock_weather(city)
    
    def _get_mock_weather(self, city):
        """Mock weather data"""
        return {
            'city': city,
            'temperature': 22,
            'condition': 'Clear',
            'description': 'clear sky',
            'humidity': 60,
            'wind_speed': 5
        }

class TrafficService:
    def get_traffic_status(self, city):
        """Get traffic status for a city (mock for now)"""
        # In production, integrate with TomTom or Google Maps Traffic API
        import random
        statuses = ['light', 'moderate', 'heavy']
        return {
            'city': city,
            'status': random.choice(statuses),
            'delay_factor': random.uniform(1.0, 1.5)
        }

# Singleton instances
route_service = RouteService()
weather_service = WeatherService()
traffic_service = TrafficService()
