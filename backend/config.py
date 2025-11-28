import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
    DB_NAME = os.getenv('DB_NAME', 'ctm_delivery')
    FLASK_PORT = int(os.getenv('FLASK_PORT', 5000))
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:5173').split(',')
    
    # External APIs
    OPENROUTE_API_KEY = os.getenv('OPENROUTE_API_KEY', '')
    WEATHER_API_KEY = os.getenv('WEATHER_API_KEY', '')  # OpenWeatherMap
