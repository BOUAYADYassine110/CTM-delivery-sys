from flask import Blueprint, request, jsonify
from bson import ObjectId
from utils.db import get_db
from utils.websocket import emit_order_update
from utils.external_services import route_service, weather_service, traffic_service
from models.order import Order
from datetime import datetime, timedelta

def get_delivery_insights(order_data, route_svc, weather_svc, traffic_svc):
    origin = order_data['sender']['city']
    destination = order_data['recipient']['city']
    
    route_info = route_svc.get_route(origin, destination)
    weather_info = weather_svc.get_weather(destination)
    traffic_info = traffic_svc.get_traffic_status(origin)
    
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

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('/orders', methods=['POST'])
def create_order():
    try:
        data = request.json
        
        # Get user from token if authenticated
        user_id = None
        if 'Authorization' in request.headers:
            from utils.auth import decode_token
            token = request.headers['Authorization'].split(' ')[1]
            payload = decode_token(token)
            if payload:
                user_id = payload['user_id']
        
        order = Order.create(data)
        if user_id:
            order['user_id'] = user_id
        
        # Get delivery insights
        insights = get_delivery_insights(data, route_service, weather_service, traffic_service)
        
        # Add insights to order
        order['delivery_insights'] = insights
        order['estimated_delivery'] = (datetime.utcnow() + timedelta(minutes=insights['estimated_delivery_minutes'])).isoformat()
        
        db = get_db()
        result = db.orders.insert_one(order)
        order['_id'] = str(result.inserted_id)
        
        # Emit WebSocket update
        emit_order_update(order['tracking_number'], order)
        
        return jsonify({
            'success': True,
            'tracking_number': order['tracking_number'],
            'order': serialize_order(order),
            'insights': insights
        }), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@orders_bp.route('/orders', methods=['GET'])
def get_orders():
    try:
        db = get_db()
        orders = list(db.orders.find().sort('created_at', -1))
        return jsonify({
            'success': True,
            'orders': [serialize_order(order) for order in orders]
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@orders_bp.route('/orders/<order_id>', methods=['GET'])
def get_order(order_id):
    try:
        db = get_db()
        order = db.orders.find_one({'_id': ObjectId(order_id)})
        if not order:
            return jsonify({'success': False, 'error': 'Order not found'}), 404
        return jsonify({'success': True, 'order': serialize_order(order)})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@orders_bp.route('/orders/<order_id>', methods=['PUT'])
def update_order(order_id):
    try:
        data = request.json
        db = get_db()
        order = db.orders.find_one({'_id': ObjectId(order_id)})
        
        if not order:
            return jsonify({'success': False, 'error': 'Order not found'}), 404
        
        updated_order = Order.update_status(
            order,
            data.get('status', order['status']),
            data.get('message', ''),
            data.get('agent_id')
        )
        
        db.orders.update_one({'_id': ObjectId(order_id)}, {'$set': updated_order})
        
        # Emit WebSocket update
        emit_order_update(order['tracking_number'], serialize_order(updated_order))
        
        return jsonify({'success': True, 'order': serialize_order(updated_order)})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@orders_bp.route('/orders/<order_id>', methods=['DELETE'])
def delete_order(order_id):
    try:
        db = get_db()
        result = db.orders.delete_one({'_id': ObjectId(order_id)})
        if result.deleted_count == 0:
            return jsonify({'success': False, 'error': 'Order not found'}), 404
        return jsonify({'success': True, 'message': 'Order deleted'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@orders_bp.route('/orders/<order_id>/insights', methods=['GET'])
def get_order_insights(order_id):
    try:
        db = get_db()
        order = db.orders.find_one({'_id': ObjectId(order_id)})
        if not order:
            return jsonify({'success': False, 'error': 'Order not found'}), 404
        
        # Refresh insights
        insights = get_delivery_insights(order, route_service, weather_service, traffic_service)
        
        return jsonify({'success': True, 'insights': insights})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

def serialize_order(order):
    order['_id'] = str(order['_id'])
    order['created_at'] = order['created_at'].isoformat()
    order['updated_at'] = order['updated_at'].isoformat()
    for history in order['status_history']:
        history['timestamp'] = history['timestamp'].isoformat()
    if 'estimated_delivery' in order and isinstance(order['estimated_delivery'], datetime):
        order['estimated_delivery'] = order['estimated_delivery'].isoformat()
    return order
