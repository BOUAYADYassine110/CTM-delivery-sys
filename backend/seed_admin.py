"""
Seed script to create initial admin user
Run this once: python seed_admin.py
"""
from utils.db import init_db, get_db
from models.user import User

def create_initial_admin():
    init_db()
    db = get_db()
    
    # Check if admin exists
    if db.users.find_one({'role': 'admin'}):
        print("❌ Admin user already exists!")
        return
    
    # Create admin
    admin_data = {
        'email': 'admin@ctm.ma',
        'password': 'admin123',  # Change this!
        'name': 'CTM Admin',
        'phone': '+212600000000',
        'role': User.ROLE_ADMIN
    }
    
    admin = User.create(admin_data)
    admin['is_verified'] = True
    
    result = db.users.insert_one(admin)
    
    print("✅ Admin user created successfully!")
    print(f"📧 Email: {admin['email']}")
    print(f"🔑 Password: admin123")
    print(f"🆔 ID: {result.inserted_id}")
    print("\n⚠️  IMPORTANT: Change the password after first login!")

if __name__ == '__main__':
    create_initial_admin()
