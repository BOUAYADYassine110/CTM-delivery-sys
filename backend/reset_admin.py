"""
Reset admin password
Run: python reset_admin.py
"""
from utils.db import init_db, get_db
from models.user import User

def reset_admin():
    init_db()
    db = get_db()
    
    # Delete existing admin
    db.users.delete_many({'email': 'admin@ctm.ma'})
    
    # Create new admin
    admin_data = {
        'email': 'admin@ctm.ma',
        'password': 'admin123',
        'name': 'CTM Admin',
        'phone': '+212600000000',
        'role': User.ROLE_ADMIN
    }
    
    admin = User.create(admin_data)
    admin['is_verified'] = True
    
    result = db.users.insert_one(admin)
    
    print("✅ Admin user reset successfully!")
    print(f"📧 Email: admin@ctm.ma")
    print(f"🔑 Password: admin123")
    print(f"🆔 ID: {result.inserted_id}")

if __name__ == '__main__':
    reset_admin()
