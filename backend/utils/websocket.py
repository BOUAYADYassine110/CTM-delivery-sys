from flask_socketio import SocketIO, emit, join_room, leave_room

socketio = None

def init_socketio(app):
    global socketio
    socketio = SocketIO(app, cors_allowed_origins="*")
    
    @socketio.on('subscribe_order')
    def handle_subscribe(data):
        tracking_number = data.get('tracking_number')
        if tracking_number:
            join_room(tracking_number)
            emit('subscribed', {'tracking_number': tracking_number})
    
    @socketio.on('unsubscribe_order')
    def handle_unsubscribe(data):
        tracking_number = data.get('tracking_number')
        if tracking_number:
            leave_room(tracking_number)
            emit('unsubscribed', {'tracking_number': tracking_number})
    
    return socketio

def emit_order_update(tracking_number, order_data):
    if socketio:
        socketio.emit('order_update', order_data, room=tracking_number)
