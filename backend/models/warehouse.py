from datetime import datetime

class Warehouse:
    # Warehouse locations in major cities
    WAREHOUSES = {
        'Casablanca': {
            'name': 'CTM Casablanca Hub',
            'address': 'Zone Industrielle Ain Sebaa',
            'coordinates': [33.6091, -7.5372],
            'capacity': 5000
        },
        'Rabat': {
            'name': 'CTM Rabat Hub',
            'address': 'Zone Industrielle Technopolis',
            'coordinates': [34.0132, -6.8326],
            'capacity': 3000
        },
        'Marrakech': {
            'name': 'CTM Marrakech Hub',
            'address': 'Route de Safi',
            'coordinates': [31.6369, -8.0089],
            'capacity': 2500
        },
        'Fès': {
            'name': 'CTM Fès Hub',
            'address': 'Route de Sefrou',
            'coordinates': [34.0372, -5.0158],
            'capacity': 2000
        },
        'Tanger': {
            'name': 'CTM Tanger Hub',
            'address': 'Zone Franche',
            'coordinates': [35.7473, -5.8363],
            'capacity': 2000
        },
        'Agadir': {
            'name': 'CTM Agadir Hub',
            'address': 'Zone Industrielle Tassila',
            'coordinates': [30.4202, -9.5982],
            'capacity': 1500
        }
    }
    
    @staticmethod
    def get_warehouse_by_city(city):
        return Warehouse.WAREHOUSES.get(city)
    
    @staticmethod
    def get_all_warehouses():
        return Warehouse.WAREHOUSES
