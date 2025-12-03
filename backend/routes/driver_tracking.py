from flask import Blueprint, request, jsonify
from utils.db import get_db
from utils.websocket import socketio
from datetime import datetime

driver_tracking_bp = Blueprint('driver_tracking', __name__)

@driver_tracking_bp.route('/driver/location', methods=['POST'])
def update_driver_location():
    """Update driver location in real-time and progress order status"""
    try:
        data = request.json
        driver_id = data.get('driver_id')
        location = data.get('location')  # [lat, lng]
        tracking_number = data.get('tracking_number')
        
        if not all([driver_id, location, tracking_number]):
            return jsonify({'success': False, 'error': 'Missing required fields'}), 400
        
        db = get_db()
        
        # Update driver location in database
        db.drivers.update_one(
            {'driver_id': driver_id},
            {
                '$set': {
                    'current_location': location,
                    'last_location_update': datetime.utcnow()
                }
            }
        )
        
        # Get order and check if status should progress
        order = db.orders.find_one({'tracking_number': tracking_number})
        if order:
            from models.order import Order
            
            # Calculate distance to destination
            if order.get('recipient', {}).get('coordinates'):
                dest_coords = order['recipient']['coordinates']
                import math
                
                # Simple distance calculation (Haversine)
                lat1, lon1 = location[0], location[1]
                lat2, lon2 = dest_coords[0], dest_coords[1]
                
                R = 6371  # Earth radius in km
                dlat = math.radians(lat2 - lat1)
                dlon = math.radians(lon2 - lon1)
                a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
                c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
                distance_km = R * c
                
                # Progress status based on distance
                current_status = order['status']
                new_status = None
                message = ''
                
                if current_status == 'pickup_in_progress' and distance_km < 5:
                    new_status = 'in_transit'
                    message = 'Colis récupéré, en route vers la destination'
                elif current_status == 'in_transit' and distance_km < 1:
                    new_status = 'out_for_delivery'
                    message = 'Chauffeur proche de la destination'
                elif current_status == 'out_for_delivery' and distance_km < 0.1:
                    new_status = 'delivered'
                    message = 'Colis livré avec succès'
                
                if new_status:
                    updated_order = Order.update_status(order, new_status, message)
                    db.orders.update_one(
                        {'tracking_number': tracking_number},
                        {'$set': updated_order}
                    )
                    print(f"✅ Order {tracking_number} status updated: {current_status} → {new_status}")
        
        # Emit real-time update via WebSocket
        if socketio:
            socketio.emit('driver_location_update', {
                'tracking_number': tracking_number,
                'driver_id': driver_id,
                'location': location,
                'timestamp': datetime.utcnow().isoformat()
            }, room=tracking_number)
        
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@driver_tracking_bp.route('/driver/<driver_id>/location', methods=['GET'])
def get_driver_location(driver_id):
    """Get current driver location"""
    try:
        db = get_db()
        driver = db.drivers.find_one({'driver_id': driver_id})
        
        if not driver:
            return jsonify({'success': False, 'error': 'Driver not found'}), 404
        
        return jsonify({
            'success': True,
            'location': driver.get('current_location'),
            'last_update': driver.get('last_location_update').isoformat() if driver.get('last_location_update') else None
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@driver_tracking_bp.route('/order/<tracking_number>/driver-location', methods=['GET'])
def get_order_driver_location(tracking_number):
    """Get driver location for a specific order"""
    try:
        db = get_db()
        order = db.orders.find_one({'tracking_number': tracking_number})
        
        if not order:
            return jsonify({'success': False, 'error': 'Order not found'}), 404
        
        # Get assigned driver
        driver_id = order.get('assigned_pickup_driver') or order.get('assigned_intercity_driver')
        
        if not driver_id:
            return jsonify({'success': False, 'error': 'No driver assigned'}), 404
        
        driver = db.drivers.find_one({'driver_id': driver_id})
        
        if not driver:
            return jsonify({'success': False, 'error': 'Driver not found'}), 404
        
        return jsonify({
            'success': True,
            'driver_id': driver_id,
            'driver_name': driver.get('name'),
            'location': driver.get('current_location'),
            'last_update': driver.get('last_location_update').isoformat() if driver.get('last_location_update') else None,
            'vehicle_type': driver.get('vehicle_type')
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
