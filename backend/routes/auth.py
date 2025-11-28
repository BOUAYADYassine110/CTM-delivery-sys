from flask import Blueprint, request, jsonify
from utils.db import get_db
from utils.auth import generate_token, token_required
from models.user import User
from email_validator import validate_email, EmailNotValidError

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/auth/register', methods=['POST'])
def register():
    """Register new user"""
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['email', 'password', 'name']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'{field} is required'}), 400
        
        # Validate email
        try:
            valid = validate_email(data['email'])
            data['email'] = valid.email
        except EmailNotValidError as e:
            return jsonify({'success': False, 'error': str(e)}), 400
        
        # Check if user exists
        db = get_db()
        if db.users.find_one({'email': data['email'].lower()}):
            return jsonify({'success': False, 'error': 'Email already registered'}), 400
        
        # Create user
        user = User.create(data)
        result = db.users.insert_one(user)
        
        # Generate token
        token = generate_token(result.inserted_id, user['role'])
        
        return jsonify({
            'success': True,
            'message': 'User registered successfully',
            'token': token,
            'user': {
                'id': str(result.inserted_id),
                'email': user['email'],
                'name': user['profile']['name'],
                'role': user['role']
            }
        }), 201
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@auth_bp.route('/auth/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.json
        
        if not data.get('email') or not data.get('password'):
            return jsonify({'success': False, 'error': 'Email and password required'}), 400
        
        # Find user
        db = get_db()
        user = db.users.find_one({'email': data['email'].lower()})
        
        if not user:
            return jsonify({'success': False, 'error': 'Invalid credentials'}), 401
        
        # Verify password
        if not User.verify_password(data['password'], user['password']):
            return jsonify({'success': False, 'error': 'Invalid credentials'}), 401
        
        # Check if active
        if not user.get('is_active'):
            return jsonify({'success': False, 'error': 'Account is inactive'}), 401
        
        # Generate token
        token = generate_token(user['_id'], user['role'])
        
        return jsonify({
            'success': True,
            'token': token,
            'user': {
                'id': str(user['_id']),
                'email': user['email'],
                'name': user['profile']['name'],
                'role': user['role'],
                'company': user['profile'].get('company', '')
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@auth_bp.route('/auth/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    """Get current user profile"""
    return jsonify({
        'success': True,
        'user': {
            'id': str(current_user['_id']),
            'email': current_user['email'],
            'name': current_user['profile']['name'],
            'role': current_user['role'],
            'phone': current_user['profile'].get('phone', ''),
            'company': current_user['profile'].get('company', ''),
            'is_verified': current_user.get('is_verified', False)
        }
    })

@auth_bp.route('/auth/change-password', methods=['POST'])
@token_required
def change_password(current_user):
    """Change user password"""
    try:
        data = request.json
        
        if not data.get('old_password') or not data.get('new_password'):
            return jsonify({'success': False, 'error': 'Old and new password required'}), 400
        
        # Verify old password
        if not User.verify_password(data['old_password'], current_user['password']):
            return jsonify({'success': False, 'error': 'Invalid old password'}), 401
        
        # Update password
        db = get_db()
        updated_user = User.update_password(current_user, data['new_password'])
        db.users.update_one(
            {'_id': current_user['_id']},
            {'$set': {'password': updated_user['password'], 'updated_at': updated_user['updated_at']}}
        )
        
        return jsonify({'success': True, 'message': 'Password updated successfully'})
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
