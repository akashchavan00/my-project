from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class AgentTool(BaseModel):
    name: str
    description: str


class AgentConfig(BaseModel):
    agent_id: str
    name: str
    description: str
    prompt: str  # Task/System prompt for the agent
    temperature: Optional[float] = 0.7
    tools: Optional[List[str]] = []
    order: int = 0  # Execution order


class AgentExecutionRequest(BaseModel):
    user_input: str
    agents: List[AgentConfig]
    session_id: Optional[str] = None


class AgentExecutionResult(BaseModel):
    agent_id: str
    agent_name: str
    input_text: str
    output_text: str
    execution_time: float
    order: int
    excel_file: Optional[Dict[str, str]] = None


class AgentExecutionResponse(BaseModel):
    session_id: str
    results: List[AgentExecutionResult]
    final_output: str
    total_execution_time: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    excel_file: Optional[Dict[str, str]] = None


class SavedAgent(BaseModel):
    agent_id: str
    name: str
    description: str
    prompt: str
    temperature: float = 0.7
    tools: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
