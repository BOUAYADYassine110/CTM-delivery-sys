import requests

# Login to get token
login_response = requests.post('http://localhost:5000/api/auth/login', json={
    'email': 'admin@ctm.ma',
    'password': 'admin123'
})
token = login_response.json()['token']

# Test CrewAI endpoint
response = requests.post(
    'http://localhost:5000/api/crew/process-order',
    headers={'Authorization': f'Bearer {token}'},
    json={
        'sender': {'city': 'Casablanca'},
        'recipient': {'city': 'Rabat'},
        'package': {'weight': 5}
    }
)

print(response.json())
