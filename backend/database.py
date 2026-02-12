from pymongo import MongoClient


client = MongoClient("mongodb://localhost:27017")

db = client["milestone_db"]

user_collection = db["users"]
profile_collection = db["profiles"]
