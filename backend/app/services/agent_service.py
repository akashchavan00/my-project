from typing import List, Dict, Any
from datetime import datetime
import time
import os
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import StateGraph, END
from typing_extensions import TypedDict
from app.models.agent import AgentConfig, AgentExecutionResult
from .database import db_service


class AgentState(TypedDict):
    current_input: str
    results: List[Dict[str, Any]]
    agent_index: int


class AgentExecutionService:
    def __init__(self):
        self.groq_api_key = os.getenv("GROQ_API_KEY")
        if not self.groq_api_key:
            raise ValueError("GROQ_API_KEY not found in environment variables")
    
    def _create_agent_workflow(self, agents: List[AgentConfig]) -> StateGraph:
        """Create a LangGraph workflow for sequential agent execution"""
        workflow = StateGraph(AgentState)
        
        # Sort agents by order
        sorted_agents = sorted(agents, key=lambda x: x.order)
        
        # Create nodes for each agent
        for idx, agent in enumerate(sorted_agents):
            def create_agent_node(agent_config: AgentConfig):
                def agent_node(state: AgentState) -> AgentState:
                    # Get input text (either original or from previous agent)
                    input_text = state["current_input"]
                    
                    # Create LLM instance for this agent
                    llm = ChatGroq(
                        temperature=agent_config.temperature,
                        model_name="llama-3.1-8b-instant",
                        groq_api_key=self.groq_api_key
                    )
                    
                    # Prepare messages
                    messages = [
                        SystemMessage(content=agent_config.prompt),
                        HumanMessage(content=input_text)
                    ]
                    
                    start_time = time.time()
                    response = llm.invoke(messages)
                    execution_time = time.time() - start_time
                    
                    output_text = response.content
                    
                    # Store result
                    result = {
                        "agent_id": agent_config.agent_id,
                        "agent_name": agent_config.name,
                        "input_text": input_text,
                        "output_text": output_text,
                        "execution_time": execution_time,
                        "order": agent_config.order
                    }
                    
                    # Update state
                    new_results = state["results"] + [result]
                    
                    return {
                        "current_input": output_text,  # Next agent gets this output
                        "results": new_results,
                        "agent_index": state["agent_index"] + 1
                    }
                
                return agent_node
            
            node_name = f"agent_{idx}"
            workflow.add_node(node_name, create_agent_node(agent))
        
        # Set entry point
        workflow.set_entry_point("agent_0")
        
        # Add edges between agents
        for idx in range(len(sorted_agents) - 1):
            workflow.add_edge(f"agent_{idx}", f"agent_{idx + 1}")
        
        # Add edge from last agent to END
        workflow.add_edge(f"agent_{len(sorted_agents) - 1}", END)
        
        return workflow.compile()
    
    async def execute_agents(
        self, 
        user_input: str, 
        agents: List[AgentConfig],
        session_id: str = None
    ) -> Dict[str, Any]:
        """Execute agents sequentially based on their order"""
        
        if not agents:
            raise ValueError("At least one agent must be provided")
        
        start_time = time.time()
        
        # Create and execute workflow
        workflow = self._create_agent_workflow(agents)
        
        initial_state = {
            "current_input": user_input,
            "results": [],
            "agent_index": 0
        }
        
        final_state = workflow.invoke(initial_state)
        
        total_execution_time = time.time() - start_time
        
        # Get final output (from last agent)
        final_output = final_state["results"][-1]["output_text"] if final_state["results"] else user_input
        
        # Convert results to AgentExecutionResult objects
        results = [AgentExecutionResult(**result) for result in final_state["results"]]
        
        # Save execution history if session_id provided
        if session_id:
            await self._save_execution_history(
                session_id=session_id,
                user_input=user_input,
                agents=agents,
                results=final_state["results"],
                final_output=final_output,
                total_execution_time=total_execution_time
            )
        
        return {
            "session_id": session_id,
            "results": results,
            "final_output": final_output,
            "total_execution_time": total_execution_time,
            "timestamp": datetime.utcnow()
        }
    
    async def _save_execution_history(
        self,
        session_id: str,
        user_input: str,
        agents: List[AgentConfig],
        results: List[Dict[str, Any]],
        final_output: str,
        total_execution_time: float
    ):
        """Save agent execution history to MongoDB"""
        db = db_service.get_database()
        execution_collection = db.agent_executions
        
        execution_doc = {
            "session_id": session_id,
            "user_input": user_input,
            "agents": [agent.dict() for agent in agents],
            "results": results,
            "final_output": final_output,
            "total_execution_time": total_execution_time,
            "timestamp": datetime.utcnow()
        }
        
        await execution_collection.insert_one(execution_doc)
    
    async def save_agent_template(self, agent: AgentConfig) -> bool:
        """Save agent configuration as a template for reuse"""
        db = db_service.get_database()
        agents_collection = db.saved_agents
        
        agent_doc = agent.dict()
        agent_doc["created_at"] = datetime.utcnow()
        agent_doc["updated_at"] = datetime.utcnow()
        
        await agents_collection.update_one(
            {"agent_id": agent.agent_id},
            {"$set": agent_doc},
            upsert=True
        )
        return True
    
    async def get_saved_agents(self) -> List[Dict[str, Any]]:
        """Get all saved agent templates"""
        db = db_service.get_database()
        agents_collection = db.saved_agents
        
        agents = []
        async for agent_doc in agents_collection.find().sort("created_at", -1):
            # Remove MongoDB _id field
            agent_doc.pop("_id", None)
            agents.append(agent_doc)
        
        return agents
    
    async def delete_agent_template(self, agent_id: str) -> bool:
        """Delete a saved agent template"""
        db = db_service.get_database()
        agents_collection = db.saved_agents
        
        result = await agents_collection.delete_one({"agent_id": agent_id})
        return result.deleted_count > 0


# Create singleton instance
agent_service = AgentExecutionService()
