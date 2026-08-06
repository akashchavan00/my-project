from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket
from typing import Optional
import os


class DatabaseService:
    client: Optional[AsyncIOMotorClient] = None
    database = None
    gridfs_bucket: Optional[AsyncIOMotorGridFSBucket] = None

    @classmethod
    async def connect_to_database(cls):
        """Connect to MongoDB"""
        mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
        cls.client = AsyncIOMotorClient(mongodb_url)
        cls.database = cls.client.chatbot_db
        # Default bucket name "fs" -> stores files in "fs.files" / "fs.chunks"
        cls.gridfs_bucket = AsyncIOMotorGridFSBucket(cls.database)
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

    @classmethod
    def get_gridfs_bucket(cls) -> AsyncIOMotorGridFSBucket:
        """Get the GridFS bucket used to store/retrieve generated files
        (backed by the fs.files / fs.chunks collections)."""
        return cls.gridfs_bucket


db_service = DatabaseService()
