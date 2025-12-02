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
        # Require authentication
        if 'Authorization' not in request.headers:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401
        
        from utils.auth import decode_token
        token = request.headers['Authorization'].split(' ')[1]
        payload = decode_token(token)
        
        if not payload:
            return jsonify({'success': False, 'error': 'Invalid token'}), 401
        
        user_id = payload['user_id']
        data = request.json
        
        order = Order.create(data)
        if user_id:
            order['user_id'] = user_id
        
        # Calculate route for in-city orders with coordinates
        print(f"\n=== ORDER CREATION DEBUG ===")
        print(f"Delivery type: {order['delivery_type']}")
        print(f"Sender city: {data['sender']['city']}")
        print(f"Recipient city: {data['recipient']['city']}")
        print(f"Sender coords: {data.get('sender', {}).get('coordinates')}")
        print(f"Recipient coords: {data.get('recipient', {}).get('coordinates')}")
        
        if (order['delivery_type'] == 'in_city' and 
            data.get('sender', {}).get('coordinates') and 
            data.get('recipient', {}).get('coordinates')):
            
            print(f"📍 Calculating route for in-city order...")
            
            # Get real route with coordinates
            route_result = route_service.get_route(
                data['sender']['coordinates'],
                data['recipient']['coordinates']
            )
            
            print(f"Route result success: {route_result.get('success')}")
            print(f"Route distance: {route_result.get('distance_km')}")
            print(f"Route duration: {route_result.get('duration_minutes')}")
            
            if route_result.get('success'):
                order['route_distance_km'] = route_result.get('distance_km', 0)
                order['route_duration_minutes'] = route_result.get('duration_minutes', 0)
                order['route_geometry'] = route_result.get('geometry', [])
                print(f"✅ Route saved to order: distance={order['route_distance_km']}, duration={order['route_duration_minutes']}")
            else:
                print(f"⚠️ Route calculation failed: {route_result.get('error')}")
        else:
            print(f"⚠️ Skipping route calculation - not in-city or missing coordinates")
        print(f"=== END DEBUG ===\n")
        
        # Get delivery insights
        insights = get_delivery_insights(data, route_service, weather_service, traffic_service)
        
        # Add insights to order
        order['delivery_insights'] = insights
        order['estimated_delivery'] = (datetime.utcnow() + timedelta(minutes=insights['estimated_delivery_minutes'])).isoformat()
        
        db = get_db()
        
        # Auto-assign driver for in-city orders
        if order['delivery_type'] == 'in_city':
            # Find available pickup driver in sender city
            driver = db.drivers.find_one({
                'driver_type': 'pickup',
                'city': data['sender']['city'],
                'status': 'available'
            })
            
            if driver:
                order['assigned_pickup_driver'] = driver['driver_id']
                order['status'] = 'pickup_in_progress'
                order['status_history'].append({
                    'status': 'pickup_in_progress',
                    'timestamp': datetime.utcnow(),
                    'message': f"Chauffeur {driver['name']} en route pour ramassage"
                })
                
                # Update driver status
                db.drivers.update_one(
                    {'driver_id': driver['driver_id']},
                    {'$set': {'status': 'on_route'}, '$push': {'assigned_orders': str(order['tracking_number'])}}
                )
        
        result = db.orders.insert_one(order)
        order['_id'] = str(result.inserted_id)
        
        print(f"✅ Order created: {order['tracking_number']}")
        print(f"Route data in order: distance={order.get('route_distance_km')}, duration={order.get('route_duration_minutes')}")
        
        # Emit WebSocket update
        emit_order_update(order['tracking_number'], order)
        
        serialized_order = serialize_order(order)
        print(f"Serialized order route data: distance={serialized_order.get('route_distance_km')}, duration={serialized_order.get('route_duration_minutes')}")
        
        return jsonify({
            'success': True,
            'tracking_number': order['tracking_number'],
            'order': serialized_order,
            'insights': insights
        }), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@orders_bp.route('/orders', methods=['GET'])
def get_orders():
    try:
        db = get_db()
        
        # Check if user is authenticated
        user_id = None
        user_role = None
        if 'Authorization' in request.headers:
            from utils.auth import decode_token
            token = request.headers['Authorization'].split(' ')[1]
            payload = decode_token(token)
            if payload:
                user_id = payload['user_id']
                user_role = payload['role']
        
        # Admin/Employee see all orders, Clients/Enterprises see only their orders
        query = {}
        if user_id and user_role in ['client', 'enterprise']:
            query['user_id'] = user_id
        
        orders = list(db.orders.find(query).sort('created_at', -1))
        return jsonify({
            'success': True,
            'orders': [serialize_order(order) for order in orders]
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@orders_bp.route('/orders/my-orders', methods=['GET'])
def get_my_orders():
    try:
        from utils.auth import decode_token
        
        if 'Authorization' not in request.headers:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401
        
        token = request.headers['Authorization'].split(' ')[1]
        payload = decode_token(token)
        
        if not payload:
            return jsonify({'success': False, 'error': 'Invalid token'}), 401
        
        db = get_db()
        
        # Get query parameters for filtering
        status = request.args.get('status')
        limit = int(request.args.get('limit', 50))
        
        query = {'user_id': payload['user_id']}
        if status:
            query['status'] = status
        
        orders = list(db.orders.find(query).sort('created_at', -1).limit(limit))
        
        # Get statistics
        stats = {
            'total': db.orders.count_documents({'user_id': payload['user_id']}),
            'pending': db.orders.count_documents({'user_id': payload['user_id'], 'status': 'pending'}),
            'in_transit': db.orders.count_documents({'user_id': payload['user_id'], 'status': 'in_transit'}),
            'delivered': db.orders.count_documents({'user_id': payload['user_id'], 'status': 'delivered'})
        }
        
        return jsonify({
            'success': True,
            'orders': [serialize_order(order) for order in orders],
            'stats': stats
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

@orders_bp.route('/orders/route/<origin>/<destination>', methods=['GET'])
def get_route_geometry(origin, destination):
    try:
        route_info = route_service.get_route(origin, destination)
        return jsonify({'success': True, 'route': route_info})
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
