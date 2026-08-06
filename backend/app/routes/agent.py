from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from app.models.agent import (
    AgentExecutionRequest,
    AgentExecutionResponse,
    AgentConfig,
    SavedAgent
)
from app.services.agent_service import agent_service
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


@router.get("/download/{filename}")
async def download_excel_file(filename: str):
    """Download generated Excel file"""
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
