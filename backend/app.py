from flask import Flask
from flask_cors import CORS
from config import Config
from utils.db import init_db
from utils.websocket import init_socketio
from routes.orders import orders_bp
from routes.agents import agents_bp
from routes.tracking import tracking_bp
from routes.auth import auth_bp
from routes.admin import admin_bp
from routes.drivers import drivers_bp
from routes.intercity import intercity_bp
from routes.incity import incity_bp
from routes.crew import crew_bp
from routes.driver_tracking import driver_tracking_bp

app = Flask(__name__)
app.config['SECRET_KEY'] = Config.SECRET_KEY

# Enable CORS
CORS(app, resources={
    r"/api/*": {"origins": Config.CORS_ORIGINS},
    r"/socket.io/*": {"origins": Config.CORS_ORIGINS}
}, supports_credentials=True)

# Initialize MongoDB
init_db()

# Initialize WebSocket
socketio = init_socketio(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(admin_bp, url_prefix='/api')
app.register_blueprint(orders_bp, url_prefix='/api')
app.register_blueprint(agents_bp, url_prefix='/api')
app.register_blueprint(tracking_bp, url_prefix='/api')
app.register_blueprint(drivers_bp, url_prefix='/api')
app.register_blueprint(intercity_bp, url_prefix='/api')
app.register_blueprint(incity_bp, url_prefix='/api')
app.register_blueprint(crew_bp, url_prefix='/api')
app.register_blueprint(driver_tracking_bp, url_prefix='/api')

@app.route('/')
def index():
    return {'message': 'CTM Messagerie IA API', 'version': '1.0.0'}

@app.route('/health')
def health():
    return {'status': 'healthy'}

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=Config.FLASK_PORT, debug=True, allow_unsafe_werkzeug=True)
