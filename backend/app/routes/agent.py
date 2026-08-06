from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, Response
from app.models.agent import (
    AgentExecutionRequest,
    AgentExecutionResponse,
    AgentConfig,
    SavedAgent
)
from app.services.agent_service import agent_service
from app.services.file_service import file_service
from typing import List
import os

router = APIRouter(prefix="/api/agents", tags=["agents"])


@router.post("/execute", response_model=AgentExecutionResponse)
async def execute_agents(request: AgentExecutionRequest):
    """Execute one or more agents sequentially on user input"""
    try:
        result = await agent_service.execute_agents(
            user_input=request.user_input,
            agents=request.agents,
            session_id=request.session_id
        )
        return AgentExecutionResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/save")
async def save_agent_template(agent: AgentConfig):
    """Save an agent configuration as a template"""
    try:
        success = await agent_service.save_agent_template(agent)
        if success:
            return {"message": "Agent template saved successfully", "agent_id": agent.agent_id}
        else:
            raise HTTPException(status_code=500, detail="Failed to save agent template")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/templates")
async def get_saved_agents():
    """Get all saved agent templates"""
    try:
        agents = await agent_service.get_saved_agents()
        return {"agents": agents}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/templates/{agent_id}")
async def delete_agent_template(agent_id: str):
    """Delete a saved agent template"""
    try:
        deleted = await agent_service.delete_agent_template(agent_id)
        if deleted:
            return {"message": "Agent template deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Agent template not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/tools")
async def get_available_tools():
    """Get list of available tools for agents"""
    return {
        "tools": [
            {
                "id": "excel_generation",
                "name": "Excel Generation",
                "description": "Converts JSON data into formatted Excel (.xlsx) files",
                "usage": "Agent must output valid JSON that will be automatically converted to Excel"
            }
        ]
    }


@router.get("/download/file/{file_id}")
async def download_file_by_id(file_id: str):
    """
    Download a generated file (e.g. Excel export) stored in MongoDB GridFS
    (fs.files / fs.chunks collections) by its file id. This is the primary
    download path - it works for files generated in the current session as
    well as files referenced from old chat history.
    """
    try:
        file_data = await file_service.download_file(file_id)
        return Response(
            content=file_data["data"],
            media_type=file_data["content_type"],
            headers={
                "Content-Disposition": f'attachment; filename="{file_data["filename"]}"'
            }
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/download/{filename}")
async def download_excel_file(filename: str):
    """
    Legacy fallback: download a generated Excel file directly from the local
    downloads/ folder by filename. Only used if a file was generated but not
    yet migrated to GridFS (e.g. mid-request). Prefer /download/file/{file_id}.
    """
    try:
        file_path = os.path.join("downloads", filename)
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")
        
        return FileResponse(
            path=file_path,
            filename=filename,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
