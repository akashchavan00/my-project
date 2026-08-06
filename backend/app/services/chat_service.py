from typing import List, Dict, Any
from datetime import datetime
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from typing_extensions import TypedDict
import os
import uuid
from .database import db_service


class ChatState(TypedDict):
    messages: List[Any]
    session_id: str


class ChatService:
    def __init__(self):
        self.groq_api_key = os.getenv("GROQ_API_KEY")
        if not self.groq_api_key:
            raise ValueError("GROQ_API_KEY not found in environment variables")
        
        # Initialize LangChain with Groq
        self.llm = ChatGroq(
            temperature=0.7,
            model_name="llama-3.1-8b-instant",
            groq_api_key=self.groq_api_key
        )
        
        # Initialize LangGraph workflow
        self.workflow = self._create_workflow()
    
    def _create_workflow(self) -> StateGraph:
        """Create LangGraph workflow for chat processing"""
        workflow = StateGraph(ChatState)
        
        # Define the chat node
        def chat_node(state: ChatState) -> ChatState:
            messages = state["messages"]
            response = self.llm.invoke(messages)
            return {"messages": messages + [response], "session_id": state["session_id"]}
        
        # Add nodes
        workflow.add_node("chat", chat_node)
        
        # Set entry point
        workflow.set_entry_point("chat")
        
        # Add edge to end
        workflow.add_edge("chat", END)
        
        return workflow.compile()
    
    async def process_message(self, message: str, session_id: str = None) -> Dict[str, Any]:
        """Process a chat message using LangGraph and LangChain"""
        
        # Generate session_id if not provided
        if not session_id:
            session_id = str(uuid.uuid4())
        
        # Retrieve chat history from database
        chat_history = await self._get_chat_history(session_id)
        
        # Prepare messages for LLM
        messages = []
        
        # Add system message
        messages.append(SystemMessage(content="You are a helpful AI assistant. Provide clear, concise, and friendly responses."))
        
        # Add historical messages
        for msg in chat_history:
            if msg["role"] == "user":
                messages.append(HumanMessage(content=msg["content"]))
            else:
                messages.append(AIMessage(content=msg["content"]))
        
        # Add current user message
        messages.append(HumanMessage(content=message))
        
        # Process through LangGraph workflow
        initial_state = {
            "messages": messages,
            "session_id": session_id
        }
        
        result = self.workflow.invoke(initial_state)
        
        # Extract the AI response
        ai_response = result["messages"][-1].content
        
        # Save to database
        await self._save_message(session_id, "user", message)
        await self._save_message(session_id, "assistant", ai_response)
        
        return {
            "response": ai_response,
            "session_id": session_id,
            "timestamp": datetime.utcnow()
        }
    
    async def _get_chat_history(self, session_id: str) -> List[Dict[str, Any]]:
        """Retrieve chat history from MongoDB"""
        db = db_service.get_database()
        chat_collection = db.chats
        
        chat_doc = await chat_collection.find_one({"session_id": session_id})
        
        if chat_doc and "messages" in chat_doc:
            return chat_doc["messages"]
        return []
    
    async def _save_message(self, session_id: str, role: str, content: str):
        """Save a message to MongoDB"""
        db = db_service.get_database()
        chat_collection = db.chats
        
        message = {
            "role": role,
            "content": content,
            "timestamp": datetime.utcnow()
        }
        
        # Update or create chat document
        await chat_collection.update_one(
            {"session_id": session_id},
            {
                "$push": {"messages": message},
                "$set": {"updated_at": datetime.utcnow()},
                "$setOnInsert": {"created_at": datetime.utcnow()}
            },
            upsert=True
        )
    
    async def get_all_sessions(self) -> List[Dict[str, Any]]:
        """Get all chat sessions with metadata"""
        db = db_service.get_database()
        chat_collection = db.chats
        
        sessions = []
        async for chat_doc in chat_collection.find().sort("updated_at", -1):
            # Get first user message as preview
            first_message = ""
            if chat_doc.get("messages"):
                for msg in chat_doc["messages"]:
                    if msg["role"] == "user":
                        first_message = msg["content"]
                        break
            
            # Truncate preview if too long
            preview = first_message[:50] + "..." if len(first_message) > 50 else first_message
            
            sessions.append({
                "session_id": chat_doc["session_id"],
                "preview": preview or "New Chat",
                "message_count": len(chat_doc.get("messages", [])),
                "created_at": chat_doc.get("created_at"),
                "updated_at": chat_doc.get("updated_at")
            })
        
        return sessions
    
    async def get_session_history(self, session_id: str) -> List[Dict[str, Any]]:
        """Get all messages for a session"""
        return await self._get_chat_history(session_id)
    
    async def delete_session(self, session_id: str) -> bool:
        """Delete a chat session"""
        db = db_service.get_database()
        chat_collection = db.chats
        
        result = await chat_collection.delete_one({"session_id": session_id})
        return result.deleted_count > 0


# Create singleton instance
chat_service = ChatService()
