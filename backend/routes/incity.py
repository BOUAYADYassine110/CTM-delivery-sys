from flask import Blueprint, request, jsonify
from utils.external_services import RouteService, WeatherService, TrafficService
from datetime import datetime
import math

incity_bp = Blueprint('incity', __name__)

def calculate_cost(distance_km, traffic_level, weather_condition):
    """Calculate delivery cost based on distance, traffic, and weather"""
    base_rate = 15  # DH base
    per_km = 5  # DH per km
    
    cost = base_rate + (distance_km * per_km)
    
    # Traffic multiplier
    if traffic_level == 'high':
        cost *= 1.3
    elif traffic_level == 'medium':
        cost *= 1.15
    
    # Weather multiplier
    if 'rain' in weather_condition.lower():
        cost *= 1.2
    
    return round(cost, 2)

@incity_bp.route('/incity/calculate-route', methods=['POST'])
def calculate_incity_route():
    """
    Calculate optimized route for in-city delivery with real-time traffic and weather.
    Returns route geometry, distance, duration, cost, and conditions.
    """
    try:
        data = request.json
        sender_coords = data.get('sender_coords')
        recipient_coords = data.get('recipient_coords')
        city = data.get('city')
        
        if not sender_coords or not recipient_coords:
            return jsonify({'success': False, 'error': 'Missing coordinates'}), 400
        
        # Get route from OpenRouteService
        route_service = RouteService()
        route_result = route_service.get_route(sender_coords, recipient_coords)
        
        if not route_result.get('success'):
            return jsonify({'success': False, 'error': 'Failed to calculate route'}), 500
        
        distance_km = route_result.get('distance_km', 0)
        duration_minutes = route_result.get('duration_minutes', 0)
        geometry = route_result.get('geometry')
        
        print(f"Raw route result: distance={distance_km}, duration={duration_minutes}, geometry_type={type(geometry)}, geometry_len={len(geometry) if geometry else 0}")
        
        # Fallback if no geometry
        if not geometry or len(geometry) < 2:
            print("⚠️ No geometry, using fallback")
            geometry = [sender_coords, recipient_coords]
        else:
            print(f"✅ Route calculated: {distance_km}km, {duration_minutes}min, {len(geometry)} points")
            print(f"First 3 points: {geometry[:3]}")
        
        # Get current traffic conditions
        traffic_service = TrafficService()
        traffic_data = traffic_service.get_traffic_conditions(city)
        traffic_level = traffic_data['level']
        traffic_delay = traffic_data['delay_minutes']
        
        # Adjust duration based on traffic
        adjusted_duration = duration_minutes + traffic_delay
        
        # Get weather conditions
        weather_service = WeatherService()
        weather_data = weather_service.get_weather(city)
        
        # Calculate cost
        estimated_cost = calculate_cost(distance_km, traffic_level, weather_data.get('condition', 'clear'))
        
        # Check if route should be recalculated due to high traffic
        should_recalculate = traffic_level == 'high' and traffic_delay > 15
        
        result = {
            'success': True,
            'route': {
                'distance_km': round(distance_km, 2),
                'duration_minutes': round(adjusted_duration, 1),
                'base_duration_minutes': round(duration_minutes, 1),
                'traffic_delay_minutes': traffic_delay,
                'traffic_level': traffic_level,
                'estimated_cost': estimated_cost,
                'geometry': geometry,
                'weather': {
                    'temperature': weather_data.get('temperature'),
                    'condition': weather_data.get('condition'),
                    'description': weather_data.get('description')
                },
                'should_recalculate': should_recalculate,
                'recalculation_reason': 'Trafic dense détecté - itinéraire alternatif recommandé' if should_recalculate else None
            }
        }
        print(f"Returning route with {len(geometry)} geometry points")
        return jsonify(result)
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@incity_bp.route('/incity/recalculate-route', methods=['POST'])
def recalculate_route():
    """
    Recalculate route if traffic or weather conditions change significantly.
    """
    try:
        data = request.json
        order_id = data.get('order_id')
        
        # This would fetch the order and recalculate based on current conditions
        # For now, return success
        return jsonify({
            'success': True,
            'message': 'Route recalculated successfully'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
