from flask import Blueprint, request, jsonify
from utils.db import get_db
from utils.auth import role_required
from models.driver import Driver
from models.user import User

drivers_bp = Blueprint('drivers', __name__)

@drivers_bp.route('/drivers', methods=['GET'])
@role_required(User.ROLE_ADMIN, User.ROLE_EMPLOYEE)
def get_all_drivers(current_user):
    try:
        db = get_db()
        
        # Initialize drivers if none exist
        if db.drivers.count_documents({}) == 0:
            default_drivers = Driver.get_default_drivers()
            db.drivers.insert_many(default_drivers)
        
        driver_type = request.args.get('type')
        city = request.args.get('city')
        status = request.args.get('status')
        
        query = {}
        if driver_type:
            query['driver_type'] = driver_type
        if city:
            query['city'] = city
        if status:
            query['status'] = status
        
        drivers = list(db.drivers.find(query))
        
        return jsonify({
            'success': True,
            'drivers': [serialize_driver(d) for d in drivers]
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@drivers_bp.route('/drivers/<driver_id>', methods=['GET'])
@role_required(User.ROLE_ADMIN, User.ROLE_EMPLOYEE)
def get_driver(current_user, driver_id):
    try:
        db = get_db()
        driver = db.drivers.find_one({'driver_id': driver_id})
        
        if not driver:
            return jsonify({'success': False, 'error': 'Driver not found'}), 404
        
        return jsonify({'success': True, 'driver': serialize_driver(driver)})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@drivers_bp.route('/drivers/<driver_id>/assign', methods=['POST'])
@role_required(User.ROLE_ADMIN, User.ROLE_EMPLOYEE)
def assign_order_to_driver(current_user, driver_id):
    try:
        data = request.json
        order_id = data.get('order_id')
        
        db = get_db()
        driver = db.drivers.find_one({'driver_id': driver_id})
        
        if not driver:
            return jsonify({'success': False, 'error': 'Driver not found'}), 404
        
        # Add order to driver's assigned orders
        db.drivers.update_one(
            {'driver_id': driver_id},
            {
                '$push': {'assigned_orders': order_id},
                '$set': {'status': 'on_route'}
            }
        )
        
        return jsonify({'success': True, 'message': 'Order assigned to driver'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@drivers_bp.route('/drivers/available', methods=['GET'])
@role_required(User.ROLE_ADMIN, User.ROLE_EMPLOYEE)
def get_available_drivers(current_user):
    try:
        db = get_db()
        driver_type = request.args.get('type', 'pickup')
        city = request.args.get('city')
        
        query = {
            'driver_type': driver_type,
            'status': 'available'
        }
        
        if city:
            query['city'] = city
        
        drivers = list(db.drivers.find(query).limit(10))
        
        return jsonify({
            'success': True,
            'drivers': [serialize_driver(d) for d in drivers]
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

def serialize_driver(driver):
    if '_id' in driver:
        driver['_id'] = str(driver['_id'])
    return driver
