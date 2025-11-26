from flask import Blueprint, jsonify
from utils.db import get_db

tracking_bp = Blueprint('tracking', __name__)

@tracking_bp.route('/tracking/<tracking_number>', methods=['GET'])
def track_order(tracking_number):
    try:
        db = get_db()
        order = db.orders.find_one({'tracking_number': tracking_number})
        
        if not order:
            return jsonify({'success': False, 'error': 'Order not found'}), 404
        
        # Get assigned agent details if available
        agent = None
        if order.get('assigned_agent'):
            agent = db.agents.find_one({'agent_id': order['assigned_agent']})
        
        response = {
            'success': True,
            'order': serialize_tracking_order(order),
            'agent': serialize_agent(agent) if agent else None
        }
        
        return jsonify(response)
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

def serialize_tracking_order(order):
    order['_id'] = str(order['_id'])
    order['created_at'] = order['created_at'].isoformat()
    order['updated_at'] = order['updated_at'].isoformat()
    for history in order['status_history']:
        history['timestamp'] = history['timestamp'].isoformat()
    return order

def serialize_agent(agent):
    if agent and '_id' in agent:
        agent['_id'] = str(agent['_id'])
    return agent
