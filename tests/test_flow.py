import requests
import json
import time

API_URL = "http://localhost:5000/api"

def load_test_orders():
    with open('../data/test_orders.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def create_order(order_data):
    response = requests.post(f"{API_URL}/orders", json=order_data)
    return response.json()

def track_order(tracking_number):
    response = requests.get(f"{API_URL}/tracking/{tracking_number}")
    return response.json()

def get_agents_status():
    response = requests.get(f"{API_URL}/agents/status")
    return response.json()

def main():
    print("🚀 CTM Messagerie IA - Test Flow")
    print("=" * 50)
    
    # Load test orders
    test_orders = load_test_orders()
    print(f"\n📦 Loaded {len(test_orders)} test orders")
    
    # Create orders
    tracking_numbers = []
    print("\n📝 Creating orders...")
    for i, order in enumerate(test_orders, 1):
        result = create_order(order)
        if result.get('success'):
            tracking_number = result['tracking_number']
            tracking_numbers.append(tracking_number)
            print(f"  ✅ Order {i}: {tracking_number}")
        else:
            print(f"  ❌ Order {i} failed: {result.get('error')}")
        time.sleep(0.5)
    
    # Check agents status
    print("\n🤖 Checking agents status...")
    agents_result = get_agents_status()
    if agents_result.get('success'):
        for agent in agents_result['agents']:
            print(f"  • {agent['name']}: {agent['status']}")
    
    # Track orders
    print("\n🔍 Tracking orders...")
    for tracking_number in tracking_numbers:
        result = track_order(tracking_number)
        if result.get('success'):
            order = result['order']
            print(f"  📍 {tracking_number}: {order['status']}")
            print(f"     {order['sender']['city']} → {order['recipient']['city']}")
        time.sleep(0.3)
    
    print("\n✨ Test flow completed!")
    print(f"📊 Summary: {len(tracking_numbers)}/{len(test_orders)} orders created successfully")

if __name__ == "__main__":
    main()
