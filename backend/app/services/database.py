from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
import os


class DatabaseService:
    client: Optional[AsyncIOMotorClient] = None
    database = None

    @classmethod
    async def connect_to_database(cls):
        """Connect to MongoDB"""
        mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
        cls.client = AsyncIOMotorClient(mongodb_url)
        cls.database = cls.client.chatbot_db
        print(f"Connected to MongoDB at {mongodb_url}")

    @classmethod
    async def close_database_connection(cls):
        """Close MongoDB connection"""
        if cls.client:
            cls.client.close()
            print("Closed MongoDB connection")

    @classmethod
    def get_database(cls):
        """Get database instance"""
        return cls.database


db_service = DatabaseService()
