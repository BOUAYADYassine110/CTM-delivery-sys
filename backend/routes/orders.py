from flask import Blueprint, request, jsonify
from bson import ObjectId
from utils.db import get_db
from utils.websocket import emit_order_update
from models.order import Order
from datetime import datetime

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('/orders', methods=['POST'])
def create_order():
    try:
        data = request.json
        order = Order.create(data)
        
        db = get_db()
        result = db.orders.insert_one(order)
        order['_id'] = str(result.inserted_id)
        
        # Emit WebSocket update
        emit_order_update(order['tracking_number'], order)
        
        return jsonify({
            'success': True,
            'tracking_number': order['tracking_number'],
            'order': serialize_order(order)
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

def serialize_order(order):
    order['_id'] = str(order['_id'])
    order['created_at'] = order['created_at'].isoformat()
    order['updated_at'] = order['updated_at'].isoformat()
    for history in order['status_history']:
        history['timestamp'] = history['timestamp'].isoformat()
    return order
