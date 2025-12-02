from datetime import datetime

class Driver:
    # Driver types
    TYPE_PICKUP = 'pickup'  # Collects packages from clients to warehouse
    TYPE_INTER_CITY = 'inter_city'  # Long-distance delivery to all clients in destination city
    
    @staticmethod
    def create(data):
        return {
            'driver_id': data.get('driver_id', f"DRV{datetime.utcnow().timestamp():.0f}"),
            'name': data['name'],
            'phone': data['phone'],
            'driver_type': data['driver_type'],  # pickup, inter_city
            'city': data['city'],  # Base city
            'vehicle': {
                'type': data['vehicle']['type'],  # motorcycle, van, truck
                'plate': data['vehicle']['plate'],
                'capacity_kg': data['vehicle']['capacity_kg']
            },
            'status': 'available',  # available, on_route, break
            'current_location': data.get('current_location'),
            'assigned_orders': [],
            'stats': {
                'total_deliveries': 0,
                'total_pickups': 0,
                'rating': 5.0
            },
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
    
    @staticmethod
    def get_default_drivers():
        """Create default drivers for each city"""
        cities = ['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir']
        drivers = []
        
        for city in cities:
            # 5 Pickup drivers per city (motorcycles for speed)
            for i in range(1, 6):
                drivers.append({
                    'driver_id': f'PKP_{city[:3].upper()}_{i}',
                    'name': f'Pickup Driver {i} - {city}',
                    'phone': f'+2126{i}0000000',
                    'driver_type': Driver.TYPE_PICKUP,
                    'city': city,
                    'vehicle': {
                        'type': 'motorcycle',
                        'plate': f'{city[:3].upper()}-{i}234',
                        'capacity_kg': 30
                    },
                    'status': 'available',
                    'current_location': None,
                    'assigned_orders': [],
                    'stats': {
                        'total_deliveries': 0,
                        'total_pickups': 0,
                        'rating': 5.0
                    }
                })
            
        # Inter-city trucks (deliver directly to all clients in destination city)
        for i in range(1, 4):
            drivers.append({
                'driver_id': f'TRK_INTER_{i}',
                'name': f'Inter-City Truck {i}',
                'phone': f'+212600{i}00000',
                'driver_type': Driver.TYPE_INTER_CITY,
                'city': 'Casablanca',  # Base city
                'vehicle': {
                    'type': 'truck',
                    'plate': f'TRK-{i}890',
                    'capacity_kg': 2000
                },
                'status': 'available',
                'current_location': None,
                'assigned_orders': [],
                'stats': {
                    'total_deliveries': 0,
                    'total_pickups': 0,
                    'rating': 5.0
                }
            })
        
        return drivers
