"""
Clear all orders from database
Run: python clear_orders.py
"""
from utils.db import init_db, get_db

def clear_all_orders():
    init_db()
    db = get_db()
    
    # Delete all orders
    result = db.orders.delete_many({})
    
    print(f"✅ Deleted {result.deleted_count} orders from database")
    print("Database is now clean!")

if __name__ == '__main__':
    confirm = input("⚠️  This will delete ALL orders. Are you sure? (yes/no): ")
    if confirm.lower() == 'yes':
        clear_all_orders()
    else:
        print("❌ Operation cancelled")
