import requests
import polyline
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
        self.api_key = Config.OPENROUTE_API_KEY
        self.base_url = "https://api.openrouteservice.org/v2/directions/driving-car"
        if self.api_key and self.api_key != 'your_openroute_api_key_here':
            print(f"✅ OpenRouteService initialized with key: {self.api_key[:20]}...")
        else:
            print("⚠️ No OpenRouteService API key configured")
    
    def get_route(self, origin, destination):
        """Get optimized route between two points (coords or city names)"""
        # Handle coordinate pairs [lat, lon]
        if isinstance(origin, (list, tuple)) and isinstance(destination, (list, tuple)):
            return self._get_route_by_coords(origin, destination)
        
        # Handle city names
        if origin not in CITY_COORDS or destination not in CITY_COORDS:
            return self._get_mock_route(origin, destination)
        
        # Convert city names to coords and use coord-based routing
        origin_coords = [CITY_COORDS[origin][1], CITY_COORDS[origin][0]]  # [lat, lon]
        dest_coords = [CITY_COORDS[destination][1], CITY_COORDS[destination][0]]
        return self._get_route_by_coords(origin_coords, dest_coords)
    
    def _get_route_by_coords(self, origin_coords, destination_coords):
        """Get route between two coordinate pairs using direct API call"""
        if not self.api_key or self.api_key == 'your_openroute_api_key_here':
            return self._get_mock_route_coords(origin_coords, destination_coords)
        
        try:
            # OpenRouteService expects [lon, lat]
            coords = [
                [origin_coords[1], origin_coords[0]],
                [destination_coords[1], destination_coords[0]]
            ]
            
            headers = {
                'Authorization': self.api_key,
                'Content-Type': 'application/json'
            }
            
            response = requests.post(
                self.base_url,
                json={'coordinates': coords},
                headers=headers,
                timeout=10
            )
            
            data = response.json()
            response.raise_for_status()
            
            if 'routes' not in data or len(data['routes']) == 0:
                raise Exception(f"API error: {data.get('error', 'No routes found')}")
            
            route = data['routes'][0]
            distance = route['summary']['distance'] / 1000
            duration = route['summary']['duration'] / 60
            
            # Decode polyline geometry
            encoded_geometry = route['geometry']
            decoded_coords = polyline.decode(encoded_geometry)
            geometry = [[lat, lon] for lat, lon in decoded_coords]
            
            print(f"✅ Real route from API: {distance:.2f}km, {duration:.1f}min, {len(geometry)} points")
            
            return {
                'success': True,
                'distance_km': round(distance, 2),
                'duration_minutes': round(duration, 2),
                'geometry': geometry,
                'source': 'openroute'
            }
        except Exception as e:
            print(f"⚠️ OpenRoute API error: {e}")
            return self._get_mock_route_coords(origin_coords, destination_coords)
    
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
        """Mock route data with realistic calculations"""
        import math
        
        # Calculate distance using Haversine formula
        if origin in CITY_COORDS and destination in CITY_COORDS:
            lon1, lat1 = CITY_COORDS[origin]
            lon2, lat2 = CITY_COORDS[destination]
            
            R = 6371  # Earth radius in km
            dlat = math.radians(lat2 - lat1)
            dlon = math.radians(lon2 - lon1)
            a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
            c = 2 * math.asin(math.sqrt(a))
            distance = R * c
        else:
            distance = 150
        
        print(f"📦 Mock route data: {origin} → {destination}: {distance:.2f}km")
        
        return {
            'success': True,
            'distance_km': round(distance, 2),
            'duration_minutes': round(distance * 1.2, 2),
            'geometry': None,
            'source': 'mock'
        }
    
    def _get_mock_route_coords(self, origin_coords, destination_coords):
        """Mock route for coordinate pairs with interpolated points"""
        import math
        
        lat1, lon1 = origin_coords
        lat2, lon2 = destination_coords
        
        # Calculate distance using Haversine
        R = 6371
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        distance = R * c
        
        # Generate intermediate points for smoother route visualization
        num_points = max(10, int(distance * 2))  # More points for longer distances
        geometry = []
        for i in range(num_points + 1):
            fraction = i / num_points
            lat = lat1 + (lat2 - lat1) * fraction
            lon = lon1 + (lon2 - lon1) * fraction
            geometry.append([lat, lon])
        
        duration = distance / 0.5  # Assume 30 km/h average in city
        
        print(f"📦 Mock route coords: {distance:.2f}km, {duration:.1f}min, {len(geometry)} points")
        
        return {
            'success': True,
            'distance_km': round(distance, 2),
            'duration_minutes': round(duration, 1),
            'geometry': geometry,
            'source': 'mock'
        }

class WeatherService:
    def __init__(self):
        self.api_key = Config.WEATHER_API_KEY
        self.base_url = "http://api.openweathermap.org/data/2.5/weather"
        if self.api_key and self.api_key != 'your_openweather_api_key_here':
            print(f"✅ Weather API initialized with key: {self.api_key[:8]}...")
        else:
            print("⚠️ No Weather API key configured")
    
    def get_weather(self, city):
        """Get current weather for a city"""
        if not self.api_key or self.api_key == 'your_openweather_api_key_here':
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
            response.raise_for_status()
            data = response.json()
            
            print(f"✅ Real weather data for {city}: {data['main']['temp']}°C")
            
            return {
                'city': city,
                'temperature': round(data['main']['temp'], 1),
                'condition': data['weather'][0]['main'],
                'description': data['weather'][0]['description'],
                'humidity': data['main']['humidity'],
                'wind_speed': round(data['wind']['speed'], 1),
                'source': 'openweather'
            }
        except Exception as e:
            print(f"⚠️ Weather API error: {e}")
            return self._get_mock_weather(city)
    
    def _get_mock_weather(self, city):
        """Mock weather data with variation"""
        import random
        
        conditions = [
            ('Clear', 'clear sky', 25, 45, 3),
            ('Clouds', 'few clouds', 22, 55, 5),
            ('Rain', 'light rain', 18, 80, 8),
        ]
        
        condition, desc, temp, humidity, wind = random.choice(conditions)
        temp_variation = random.uniform(-3, 3)
        
        print(f"🌤️ Mock weather for {city}: {temp + temp_variation:.1f}°C")
        
        return {
            'city': city,
            'temperature': round(temp + temp_variation, 1),
            'condition': condition,
            'description': desc,
            'humidity': humidity,
            'wind_speed': wind,
            'source': 'mock'
        }

class TrafficService:
    def get_traffic_conditions(self, city):
        """Get traffic conditions with level and delay"""
        import random
        from datetime import datetime
        
        hour = datetime.now().hour
        
        # Rush hours: 7-9 AM and 5-7 PM
        if (7 <= hour <= 9) or (17 <= hour <= 19):
            levels = ['high', 'high', 'medium']
            delay_range = (10, 25)
        # Night time: 10 PM - 6 AM
        elif hour >= 22 or hour <= 6:
            levels = ['low', 'low', 'low']
            delay_range = (0, 3)
        # Normal hours
        else:
            levels = ['low', 'medium', 'medium']
            delay_range = (3, 12)
        
        level = random.choice(levels)
        delay_minutes = random.randint(*delay_range)
        
        print(f"🚗 Traffic in {city} at {hour}h: {level} (+{delay_minutes}min)")
        
        return {
            'city': city,
            'level': level,
            'delay_minutes': delay_minutes,
            'hour': hour,
            'source': 'simulated'
        }
    
    def get_traffic_status(self, city):
        """Legacy method for backward compatibility"""
        conditions = self.get_traffic_conditions(city)
        delay_factor = 1.0 + (conditions['delay_minutes'] / 60)
        
        return {
            'city': city,
            'status': conditions['level'],
            'delay_factor': round(delay_factor, 2),
            'source': 'simulated'
        }

# Singleton instances
route_service = RouteService()
weather_service = WeatherService()
traffic_service = TrafficService()
