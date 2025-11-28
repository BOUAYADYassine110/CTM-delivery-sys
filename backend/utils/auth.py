import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify
from config import Config
from utils.db import get_db
from bson import ObjectId

def generate_token(user_id, role):
    """Generate JWT token"""
    payload = {
        'user_id': str(user_id),
        'role': role,
        'exp': datetime.utcnow() + timedelta(days=7),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, Config.SECRET_KEY, algorithm='HS256')

def decode_token(token):
    """Decode JWT token"""
    try:
        return jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def token_required(f):
    """Decorator to require valid JWT token"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(' ')[1]
            except IndexError:
                return jsonify({'success': False, 'error': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'success': False, 'error': 'Token is missing'}), 401
        
        payload = decode_token(token)
        if not payload:
            return jsonify({'success': False, 'error': 'Token is invalid or expired'}), 401
        
        # Get user from database
        db = get_db()
        user = db.users.find_one({'_id': ObjectId(payload['user_id'])})
        
        if not user or not user.get('is_active'):
            return jsonify({'success': False, 'error': 'User not found or inactive'}), 401
        
        return f(current_user=user, *args, **kwargs)
    
    return decorated

def role_required(*allowed_roles):
    """Decorator to require specific role(s)"""
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            token = None
            
            if 'Authorization' in request.headers:
                auth_header = request.headers['Authorization']
                try:
                    token = auth_header.split(' ')[1]
                except IndexError:
                    return jsonify({'success': False, 'error': 'Invalid token format'}), 401
            
            if not token:
                return jsonify({'success': False, 'error': 'Token is missing'}), 401
            
            payload = decode_token(token)
            if not payload:
                return jsonify({'success': False, 'error': 'Token is invalid or expired'}), 401
            
            # Check role
            if payload['role'] not in allowed_roles:
                return jsonify({'success': False, 'error': 'Insufficient permissions'}), 403
            
            # Get user from database
            db = get_db()
            user = db.users.find_one({'_id': ObjectId(payload['user_id'])})
            
            if not user or not user.get('is_active'):
                return jsonify({'success': False, 'error': 'User not found or inactive'}), 401
            
            return f(current_user=user, *args, **kwargs)
        
        return decorated
    return decorator
