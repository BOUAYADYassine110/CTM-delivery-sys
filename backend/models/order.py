from datetime import datetime
import random
import string

def generate_tracking_number():
    return 'CTM' + ''.join(random.choices(string.digits, k=10))

class Order:
    @staticmethod
    def create(data):
        return {
            'tracking_number': generate_tracking_number(),
            'sender': {
                'name': data['sender']['name'],
                'phone': data['sender']['phone'],
                'address': data['sender']['address'],
                'city': data['sender']['city'],
                'coordinates': data['sender'].get('coordinates', None)
            },
            'recipient': {
                'name': data['recipient']['name'],
                'phone': data['recipient']['phone'],
                'address': data['recipient']['address'],
                'city': data['recipient']['city'],
                'coordinates': data['recipient'].get('coordinates', None)
            },
            'package': {
                'weight': data['package']['weight'],
                'type': data['package']['type'],
                'urgency': data['package']['urgency']
            },
            'delivery_type': 'in_city' if data['sender']['city'] == data['recipient']['city'] else 'inter_city',
            'delivery_option': data.get('delivery_option', 'standard'),  # For inter-city: standard, express, economy
            'status': 'assigned' if data['sender']['city'] == data['recipient']['city'] else 'pickup_scheduled',
            'status_history': [{
                'status': 'assigned' if data['sender']['city'] == data['recipient']['city'] else 'pickup_scheduled',
                'timestamp': datetime.utcnow(),
                'message': 'In-city express delivery' if data['sender']['city'] == data['recipient']['city'] else 'Inter-city delivery - pickup scheduled'
            }],
            'warehouse_city': None if data['sender']['city'] == data['recipient']['city'] else data['sender']['city'],
            'assigned_agent': None,
            'assigned_pickup_driver': None,  # Driver who picks up from sender
            'assigned_intercity_driver': None,  # Inter-city truck that delivers to recipient city
            'route': None,
            'estimated_delivery': None,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
    
    @staticmethod
    def update_status(order, new_status, message='', agent_id=None):
        order['status'] = new_status
        order['updated_at'] = datetime.utcnow()
        order['status_history'].append({
            'status': new_status,
            'timestamp': datetime.utcnow(),
            'message': message
        })
        if agent_id:
            order['assigned_agent'] = agent_id
        return order
