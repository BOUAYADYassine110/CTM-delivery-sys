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
                'city': data['sender']['city']
            },
            'recipient': {
                'name': data['recipient']['name'],
                'phone': data['recipient']['phone'],
                'address': data['recipient']['address'],
                'city': data['recipient']['city']
            },
            'package': {
                'weight': data['package']['weight'],
                'type': data['package']['type'],
                'urgency': data['package']['urgency']
            },
            'status': 'pending',
            'status_history': [{
                'status': 'pending',
                'timestamp': datetime.utcnow(),
                'message': 'Order received'
            }],
            'assigned_agent': None,
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
