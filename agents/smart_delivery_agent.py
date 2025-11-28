from crewai import Agent, Task

def create_smart_delivery_agent():
    return Agent(
        role='Smart Delivery Coordinator',
        goal='Coordinate deliveries considering real-time weather, traffic, and optimal routes',
        backstory="""You are an intelligent delivery coordinator for CTM Messagerie.
        You analyze weather conditions, traffic patterns, and route optimization to ensure
        safe and timely deliveries across Morocco.""",
        verbose=True,
        allow_delegation=False
    )

def get_delivery_insights(order_data, route_service, weather_service, traffic_service):
    """Get delivery insights with external services"""
    origin = order_data['sender']['city']
    destination = order_data['recipient']['city']
    
    route_info = route_service.get_route(origin, destination)
    weather_info = weather_service.get_weather(destination)
    traffic_info = traffic_service.get_traffic_status(origin)
    
    base_duration = route_info['duration_minutes']
    adjusted_duration = base_duration * traffic_info['delay_factor']
    
    warnings = []
    if weather_info['temperature'] > 35:
        warnings.append('High temperature - refrigerated items need extra care')
    if weather_info['condition'] in ['Rain', 'Thunderstorm']:
        warnings.append('Adverse weather - fragile items need extra protection')
    if weather_info['wind_speed'] > 15:
        warnings.append('High winds - secure packaging required')
    
    return {
        'route': route_info,
        'weather': weather_info,
        'traffic': traffic_info,
        'estimated_delivery_minutes': round(adjusted_duration),
        'warnings': warnings,
        'recommended_vehicle': 'van' if order_data['package']['weight'] > 10 else 'motorcycle'
    }
