from datetime import datetime

class Agent:
    @staticmethod
    def create(name, role, vehicle_type):
        return {
            'agent_id': f'AGT{datetime.utcnow().timestamp():.0f}',
            'name': name,
            'role': role,
            'vehicle_type': vehicle_type,
            'status': 'available',
            'current_orders': [],
            'total_deliveries': 0,
            'created_at': datetime.utcnow()
        }
    
    @staticmethod
    def get_default_agents():
        return [
            {
                'agent_id': 'AGT001',
                'name': 'Order Processing Agent',
                'role': 'order_processor',
                'vehicle_type': None,
                'status': 'active',
                'current_orders': [],
                'total_deliveries': 0
            },
            {
                'agent_id': 'AGT002',
                'name': 'Warehouse Agent',
                'role': 'warehouse_manager',
                'vehicle_type': None,
                'status': 'active',
                'current_orders': [],
                'total_deliveries': 0
            },
            {
                'agent_id': 'AGT003',
                'name': 'Route Optimizer Agent',
                'role': 'route_optimizer',
                'vehicle_type': 'Van',
                'status': 'active',
                'current_orders': [],
                'total_deliveries': 0
            }
        ]
