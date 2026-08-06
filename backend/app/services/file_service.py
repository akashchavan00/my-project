"""
GridFS-backed file storage service.

Generated files (e.g. Excel exports from the agent pipeline) are uploaded
into MongoDB GridFS, which stores file data across two collections:
  - fs.files  : file metadata (filename, length, uploadDate, contentType, etc.)
  - fs.chunks : the binary file data, split into chunks

This allows old chat sessions to keep working download links indefinitely,
without depending on files remaining on local disk.
"""

from typing import Optional, Dict, Any
from bson import ObjectId
from bson.errors import InvalidId
from gridfs.errors import NoFile
from .database import db_service


EXCEL_CONTENT_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"


class FileService:
    async def upload_file(
        self,
        file_path: str,
        filename: str,
        content_type: str = EXCEL_CONTENT_TYPE,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Read a file from local disk and upload it into GridFS.

        Returns a dict describing the stored file:
            { "file_id": "<gridfs ObjectId as string>", "file_name": "...", "content_type": "..." }
        """
        bucket = db_service.get_gridfs_bucket()

        with open(file_path, "rb") as f:
            file_bytes = f.read()

        file_id = await bucket.upload_from_stream(
            filename,
            file_bytes,
            metadata={"contentType": content_type, **(metadata or {})}
        )

        return {
            "file_id": str(file_id),
            "file_name": filename,
            "content_type": content_type
        }

    async def download_file(self, file_id: str):
        """
        Retrieve a file's bytes and metadata from GridFS by its id.

        Returns a dict: { "data": bytes, "filename": str, "content_type": str }

        Raises:
            ValueError: if file_id is not a valid ObjectId or the file doesn't exist.
        """
        bucket = db_service.get_gridfs_bucket()

        try:
            object_id = ObjectId(file_id)
        except (InvalidId, TypeError):
            raise ValueError(f"Invalid file id: {file_id}")

        try:
            grid_out = await bucket.open_download_stream(object_id)
            data = await grid_out.read()
        except NoFile:
            raise ValueError(f"No file found in storage for id: {file_id}")

        content_type = EXCEL_CONTENT_TYPE
        if grid_out.metadata and "contentType" in grid_out.metadata:
            content_type = grid_out.metadata["contentType"]

        return {
            "data": data,
            "filename": grid_out.filename,
            "content_type": content_type
        }

    async def delete_file(self, file_id: str) -> bool:
        """Delete a file from GridFS by its id."""
        bucket = db_service.get_gridfs_bucket()
        try:
            object_id = ObjectId(file_id)
            await bucket.delete(object_id)
            return True
        except (InvalidId, TypeError, NoFile):
            return False


# Create singleton instance
file_service = FileService()
