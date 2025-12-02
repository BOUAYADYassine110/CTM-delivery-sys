from flask import Blueprint, request, jsonify
from utils.db import get_db
from utils.auth import role_required
from utils.route_optimizer import optimize_delivery_route, calculate_total_distance
from models.user import User
from models.warehouse import Warehouse

intercity_bp = Blueprint('intercity', __name__)

@intercity_bp.route('/intercity/optimize-route', methods=['POST'])
@role_required(User.ROLE_ADMIN, User.ROLE_EMPLOYEE)
def optimize_intercity_route(current_user):
    """
    Optimize delivery route for inter-city truck.
    Truck starts from destination city warehouse, visits all clients, returns to warehouse.
    """
    try:
        data = request.json
        destination_city = data.get('destination_city')
        order_ids = data.get('order_ids', [])
        
        if not destination_city or not order_ids:
            return jsonify({'success': False, 'error': 'Missing required fields'}), 400
        
        db = get_db()
        
        # Get warehouse coordinates
        warehouse = Warehouse.get_by_city(destination_city)
        if not warehouse:
            return jsonify({'success': False, 'error': 'Warehouse not found'}), 404
        
        warehouse_coords = warehouse['coordinates']
        
        # Get all orders with their delivery coordinates
        orders = list(db.orders.find({'_id': {'$in': order_ids}}))
        
        delivery_points = []
        for order in orders:
            if order.get('recipient', {}).get('coordinates'):
                delivery_points.append({
                    'order_id': str(order['_id']),
                    'tracking_number': order['tracking_number'],
                    'coordinates': tuple(order['recipient']['coordinates']),
                    'address': order['recipient']['address'],
                    'recipient_name': order['recipient']['name']
                })
        
        # Optimize route
        optimized_route = optimize_delivery_route(warehouse_coords, delivery_points)
        total_distance = calculate_total_distance(warehouse_coords, optimized_route)
        
        return jsonify({
            'success': True,
            'route': {
                'warehouse': {
                    'city': destination_city,
                    'coordinates': warehouse_coords
                },
                'delivery_points': optimized_route,
                'total_distance_km': round(total_distance, 2),
                'estimated_time_hours': round(total_distance / 50, 1)  # Assuming 50 km/h average
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@intercity_bp.route('/intercity/assign-truck', methods=['POST'])
@role_required(User.ROLE_ADMIN, User.ROLE_EMPLOYEE)
def assign_intercity_truck(current_user):
    """
    Assign inter-city truck to deliver multiple orders to destination city.
    """
    try:
        data = request.json
        truck_id = data.get('truck_id')
        order_ids = data.get('order_ids', [])
        destination_city = data.get('destination_city')
        
        if not truck_id or not order_ids or not destination_city:
            return jsonify({'success': False, 'error': 'Missing required fields'}), 400
        
        db = get_db()
        
        # Verify truck exists and is available
        truck = db.drivers.find_one({
            'driver_id': truck_id,
            'driver_type': 'inter_city'
        })
        
        if not truck:
            return jsonify({'success': False, 'error': 'Truck not found'}), 404
        
        # Update truck status and assigned orders
        db.drivers.update_one(
            {'driver_id': truck_id},
            {
                '$set': {
                    'status': 'on_route',
                    'assigned_orders': order_ids,
                    'destination_city': destination_city
                }
            }
        )
        
        # Update all orders with assigned truck
        db.orders.update_many(
            {'_id': {'$in': order_ids}},
            {
                '$set': {
                    'assigned_intercity_driver': truck_id,
                    'status': 'in_transit'
                }
            }
        )
        
        return jsonify({
            'success': True,
            'message': f'Truck {truck_id} assigned to deliver {len(order_ids)} orders to {destination_city}'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
