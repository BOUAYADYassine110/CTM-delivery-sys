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
        
        # Calculate route if missing and coordinates are available
        if (not order.get('route_distance_km') and 
            order.get('delivery_type') == 'in_city' and
            order.get('sender', {}).get('coordinates') and 
            order.get('recipient', {}).get('coordinates')):
            
            from utils.external_services import route_service
            print(f"📍 Calculating missing route for order {tracking_number}...")
            
            route_result = route_service.get_route(
                order['sender']['coordinates'],
                order['recipient']['coordinates']
            )
            
            if route_result.get('success'):
                order['route_distance_km'] = route_result.get('distance_km', 0)
                order['route_duration_minutes'] = route_result.get('duration_minutes', 0)
                order['route_geometry'] = route_result.get('geometry', [])
                
                # Update in database
                db.orders.update_one(
                    {'tracking_number': tracking_number},
                    {'$set': {
                        'route_distance_km': order['route_distance_km'],
                        'route_duration_minutes': order['route_duration_minutes'],
                        'route_geometry': order['route_geometry']
                    }}
                )
                print(f"✅ Route calculated and saved: {order['route_distance_km']}km, {order['route_duration_minutes']}min")
        
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
