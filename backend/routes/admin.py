from flask import Blueprint, request, jsonify
from bson import ObjectId
from utils.db import get_db
from utils.auth import role_required
from models.user import User
from datetime import datetime

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/admin/users', methods=['GET'])
@role_required(User.ROLE_ADMIN)
def get_all_users(current_user):
    """Get all users (admin only)"""
    try:
        db = get_db()
        role_filter = request.args.get('role')
        
        query = {}
        if role_filter:
            query['role'] = role_filter
        
        users = list(db.users.find(query))
        
        return jsonify({
            'success': True,
            'users': [serialize_user(user) for user in users]
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@admin_bp.route('/admin/users/<user_id>', methods=['GET'])
@role_required(User.ROLE_ADMIN, User.ROLE_EMPLOYEE)
def get_user(current_user, user_id):
    """Get user by ID"""
    try:
        db = get_db()
        user = db.users.find_one({'_id': ObjectId(user_id)})
        
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        return jsonify({'success': True, 'user': serialize_user(user)})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@admin_bp.route('/admin/users', methods=['POST'])
@role_required(User.ROLE_ADMIN)
def create_user(current_user):
    """Create new user (admin only)"""
    try:
        data = request.json
        
        # Check if user exists
        db = get_db()
        if db.users.find_one({'email': data['email'].lower()}):
            return jsonify({'success': False, 'error': 'Email already exists'}), 400
        
        # Create user
        user = User.create(data)
        result = db.users.insert_one(user)
        
        return jsonify({
            'success': True,
            'message': 'User created successfully',
            'user': serialize_user(user)
        }), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@admin_bp.route('/admin/users/<user_id>', methods=['PUT'])
@role_required(User.ROLE_ADMIN)
def update_user(current_user, user_id):
    """Update user (admin only)"""
    try:
        data = request.json
        db = get_db()
        
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        # Update fields
        update_data = {'updated_at': datetime.utcnow()}
        
        if 'role' in data:
            update_data['role'] = data['role']
        if 'is_active' in data:
            update_data['is_active'] = data['is_active']
        if 'profile' in data:
            update_data['profile'] = {**user['profile'], **data['profile']}
        
        db.users.update_one({'_id': ObjectId(user_id)}, {'$set': update_data})
        
        return jsonify({'success': True, 'message': 'User updated successfully'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@admin_bp.route('/admin/users/<user_id>', methods=['DELETE'])
@role_required(User.ROLE_ADMIN)
def delete_user(current_user, user_id):
    """Deactivate user (admin only)"""
    try:
        db = get_db()
        result = db.users.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'is_active': False, 'updated_at': datetime.utcnow()}}
        )
        
        if result.modified_count == 0:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        return jsonify({'success': True, 'message': 'User deactivated successfully'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@admin_bp.route('/admin/employees', methods=['POST'])
@role_required(User.ROLE_ADMIN)
def create_employee(current_user):
    """Create new employee (admin only)"""
    try:
        data = request.json
        data['role'] = User.ROLE_EMPLOYEE
        
        db = get_db()
        if db.users.find_one({'email': data['email'].lower()}):
            return jsonify({'success': False, 'error': 'Email already exists'}), 400
        
        # Set default permissions
        if 'permissions' not in data:
            data['permissions'] = ['view_orders', 'update_orders', 'view_users']
        
        employee = User.create(data)
        employee['is_verified'] = True
        result = db.users.insert_one(employee)
        
        return jsonify({
            'success': True,
            'message': 'Employee created successfully',
            'employee': serialize_user(employee),
            'temporary_password': data['password']
        }), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@admin_bp.route('/admin/stats', methods=['GET'])
@role_required(User.ROLE_ADMIN, User.ROLE_EMPLOYEE)
def get_stats(current_user):
    """Get system statistics"""
    try:
        db = get_db()
        
        stats = {
            'total_users': db.users.count_documents({}),
            'active_users': db.users.count_documents({'is_active': True}),
            'clients': db.users.count_documents({'role': User.ROLE_CLIENT}),
            'enterprises': db.users.count_documents({'role': User.ROLE_ENTERPRISE}),
            'employees': db.users.count_documents({'role': User.ROLE_EMPLOYEE}),
            'total_orders': db.orders.count_documents({}),
            'pending_orders': db.orders.count_documents({'status': 'pending'}),
            'delivered_orders': db.orders.count_documents({'status': 'delivered'})
        }
        
        return jsonify({'success': True, 'stats': stats})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

def serialize_user(user):
    """Serialize user object"""
    return {
        'id': str(user['_id']),
        'email': user['email'],
        'role': user['role'],
        'profile': user['profile'],
        'is_active': user.get('is_active', True),
        'is_verified': user.get('is_verified', False),
        'created_at': user['created_at'].isoformat(),
        'enterprise': user.get('enterprise') if user['role'] == User.ROLE_ENTERPRISE else None,
        'employee': user.get('employee') if user['role'] == User.ROLE_EMPLOYEE else None
    }
