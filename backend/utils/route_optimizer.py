import math
from typing import List, Dict, Tuple

def calculate_distance(coord1: Tuple[float, float], coord2: Tuple[float, float]) -> float:
    """Calculate Haversine distance between two coordinates in km"""
    lat1, lon1 = coord1
    lat2, lon2 = coord2
    
    R = 6371  # Earth radius in km
    
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = (math.sin(dlat / 2) ** 2 + 
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * 
         math.sin(dlon / 2) ** 2)
    
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c

def optimize_delivery_route(warehouse_coords: Tuple[float, float], 
                            delivery_points: List[Dict]) -> List[Dict]:
    """
    Optimize route for inter-city truck starting from warehouse,
    visiting all delivery points, and returning to warehouse.
    Uses nearest neighbor algorithm.
    
    Args:
        warehouse_coords: (lat, lon) of starting warehouse
        delivery_points: List of dicts with 'order_id', 'coordinates' (lat, lon), 'address'
    
    Returns:
        Optimized list of delivery points in visit order
    """
    if not delivery_points:
        return []
    
    unvisited = delivery_points.copy()
    route = []
    current_location = warehouse_coords
    
    # Nearest neighbor algorithm
    while unvisited:
        nearest = min(unvisited, 
                     key=lambda p: calculate_distance(current_location, p['coordinates']))
        route.append(nearest)
        current_location = nearest['coordinates']
        unvisited.remove(nearest)
    
    return route

def calculate_total_distance(warehouse_coords: Tuple[float, float], 
                            route: List[Dict]) -> float:
    """Calculate total distance including return to warehouse"""
    if not route:
        return 0
    
    total = 0
    current = warehouse_coords
    
    for point in route:
        total += calculate_distance(current, point['coordinates'])
        current = point['coordinates']
    
    # Return to warehouse
    total += calculate_distance(current, warehouse_coords)
    
    return total
