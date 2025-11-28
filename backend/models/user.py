from datetime import datetime
import bcrypt

class User:
    # User roles
    ROLE_ADMIN = 'admin'
    ROLE_EMPLOYEE = 'employee'
    ROLE_CLIENT = 'client'
    ROLE_ENTERPRISE = 'enterprise'
    
    @staticmethod
    def create(data):
        """Create new user with hashed password"""
        hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
        
        user = {
            'email': data['email'].lower(),
            'password': hashed_password,
            'role': data.get('role', User.ROLE_CLIENT),
            'profile': {
                'name': data['name'],
                'phone': data.get('phone', ''),
                'company': data.get('company', ''),
                'address': data.get('address', ''),
                'city': data.get('city', '')
            },
            'is_active': True,
            'is_verified': False,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        # Enterprise-specific fields
        if user['role'] == User.ROLE_ENTERPRISE:
            user['enterprise'] = {
                'company_name': data.get('company', ''),
                'tax_id': data.get('tax_id', ''),
                'api_key': None,
                'monthly_volume': 0,
                'discount_rate': 0
            }
        
        # Employee-specific fields
        if user['role'] == User.ROLE_EMPLOYEE:
            user['employee'] = {
                'employee_id': data.get('employee_id', ''),
                'department': data.get('department', 'operations'),
                'permissions': data.get('permissions', [])
            }
        
        return user
    
    @staticmethod
    def verify_password(plain_password, hashed_password):
        """Verify password against hash"""
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password)
    
    @staticmethod
    def update_password(user, new_password):
        """Update user password"""
        user['password'] = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
        user['updated_at'] = datetime.utcnow()
        return user
