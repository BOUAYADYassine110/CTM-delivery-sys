import requests
import time
import random
from datetime import datetime

def simulate_driver_movement(tracking_number, driver_id, route_geometry):
    """
    Simulate driver movement along a route
    """
    print(f"Starting driver simulation for order {tracking_number}")
    print(f"Driver: {driver_id}")
    print(f"Route points: {len(route_geometry)}")
    
    for i, point in enumerate(route_geometry):
        try:
            # Add small random variation to simulate real movement
            lat = point[0] + random.uniform(-0.0001, 0.0001)
            lng = point[1] + random.uniform(-0.0001, 0.0001)
            
            response = requests.post('http://localhost:5000/api/driver/location', json={
                'driver_id': driver_id,
                'location': [lat, lng],
                'tracking_number': tracking_number
            })
            
            if response.status_code == 200:
                print(f"[{datetime.now().strftime('%H:%M:%S')}] Point {i+1}/{len(route_geometry)}: [{lat:.6f}, {lng:.6f}]")
            else:
                print(f"Error updating location: {response.text}")
            
            # Wait 3 seconds between updates
            time.sleep(3)
            
        except Exception as e:
            print(f"Error: {e}")
            break
    
    print("Driver simulation completed!")

if __name__ == '__main__':
    # Example usage - you'll need to provide actual values
    tracking_number = input("Enter tracking number: ")
    driver_id = input("Enter driver ID (or press Enter for 'DRV001'): ") or 'DRV001'
    
    # Get order details to fetch route
    try:
        response = requests.get(f'http://localhost:5000/api/tracking/{tracking_number}')
        if response.status_code == 200:
            order = response.json()['order']
            
            # Check if route geometry exists
            if order.get('route_geometry'):
                route_geometry = order['route_geometry']
                print(f"\nFound saved route with {len(route_geometry)} points")
            else:
                # Calculate route if not saved
                sender_coords = order['sender']['coordinates']
                recipient_coords = order['recipient']['coordinates']
                
                if sender_coords and recipient_coords:
                    route_response = requests.post('http://localhost:5000/api/incity/calculate-route', json={
                        'sender_coords': sender_coords,
                        'recipient_coords': recipient_coords,
                        'city': order['sender']['city']
                    })
                    
                    if route_response.status_code == 200:
                        route_data = route_response.json()
                        route_geometry = route_data['route']['geometry']
                        print(f"\nCalculated route with {len(route_geometry)} points")
                    else:
                        print("Failed to calculate route")
                        exit(1)
                else:
                    print("Order doesn't have coordinates")
                    exit(1)
            
            simulate_driver_movement(tracking_number, driver_id, route_geometry)
        else:
            print(f"Order not found: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
