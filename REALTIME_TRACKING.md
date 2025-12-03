# Real-Time Driver Tracking

## Overview
The system now supports real-time driver location tracking using WebSocket connections.

**Admin-First Approach**: All real-time tracking features are first available in the admin panel for monitoring and testing before being exposed to clients.

## Features

### Admin Panel
- ✅ Live tracking dashboard (`/admin/live-tracking`)
- ✅ Monitor all active deliveries simultaneously
- ✅ Switch between different orders
- ✅ Real-time driver position on map
- ✅ Connection status indicator
- ✅ Auto-refresh every 30 seconds

### Client Tracking
- ✅ Live driver location updates on map
- ✅ WebSocket-based real-time communication
- ✅ Automatic reconnection on connection loss
- ✅ Driver position updates every 3 seconds
- ✅ Visual indicator for active tracking

## How It Works

### Backend
1. **Driver Location API** (`/api/driver/location`)
   - Drivers send location updates via POST request
   - Location is stored in database
   - WebSocket event is emitted to all subscribers

2. **WebSocket Events**
   - `subscribe_order` - Client subscribes to order updates
   - `driver_location_update` - Server broadcasts driver location
   - `unsubscribe_order` - Client unsubscribes

### Frontend
1. **useDriverTracking Hook**
   - Manages WebSocket connection
   - Subscribes to order updates
   - Receives real-time location updates

2. **RouteMap Component**
   - Displays driver position on map
   - Updates automatically when location changes
   - Shows vehicle icon based on type

## Testing Real-Time Tracking

### Method 1: Using Driver Simulator

1. Create an order with coordinates in the same city
2. Note the tracking number
3. Run the simulator:
```bash
cd backend
python simulate_driver.py
```
4. Enter the tracking number when prompted
5. Open the tracking page in browser
6. Watch the driver move in real-time!

### Method 2: Manual API Calls

Send location updates manually:
```bash
curl -X POST http://localhost:5000/api/driver/location \
  -H "Content-Type: application/json" \
  -d '{
    "driver_id": "DRV001",
    "location": [33.5731, -7.5898],
    "tracking_number": "CTM1234567890"
  }'
```

## API Endpoints

### Update Driver Location
```
POST /api/driver/location
Body: {
  "driver_id": "DRV001",
  "location": [lat, lng],
  "tracking_number": "CTM1234567890"
}
```

### Get Driver Location
```
GET /api/driver/{driver_id}/location
```

### Get Order Driver Location
```
GET /api/order/{tracking_number}/driver-location
```

## WebSocket Events

### Client → Server
- `subscribe_order` - Subscribe to order updates
  ```javascript
  socket.emit('subscribe_order', { tracking_number: 'CTM1234567890' })
  ```

- `unsubscribe_order` - Unsubscribe from order updates
  ```javascript
  socket.emit('unsubscribe_order', { tracking_number: 'CTM1234567890' })
  ```

### Server → Client
- `driver_location_update` - Driver location changed
  ```javascript
  {
    tracking_number: 'CTM1234567890',
    driver_id: 'DRV001',
    location: [33.5731, -7.5898],
    timestamp: '2024-01-15T10:30:00Z'
  }
  ```

## Configuration

### Backend
- WebSocket ping timeout: 60s
- Ping interval: 25s
- Reconnection attempts: 5

### Frontend
- Update interval: 3s (in simulator)
- Reconnection delay: 1s
- Max reconnection attempts: 5

## Future Enhancements
- [ ] Driver mobile app for automatic location updates
- [ ] ETA calculation based on current position
- [ ] Route deviation alerts
- [ ] Multiple driver tracking on same map
- [ ] Historical route playback
