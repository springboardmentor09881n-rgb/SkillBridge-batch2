import motor.motor_asyncio
import os

# You may want to use environment variables for the connection string
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)

db = client["milestone_db"]

users_collection = db["users"]
profiles_collection = db["profiles"]
