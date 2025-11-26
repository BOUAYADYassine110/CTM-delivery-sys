from pymongo import MongoClient
from config import Config

client = None
db = None

def init_db():
    global client, db
    client = MongoClient(Config.MONGODB_URI)
    db = client[Config.DB_NAME]
    return db

def get_db():
    global db
    if db is None:
        db = init_db()
    return db
