# Backend - AI Chatbot API

FastAPI backend for the AI Chatbot application using LangChain, LangGraph, and MongoDB.

## Installation

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
```bash
# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Copy `.env.example` to the root directory as `.env` and configure:
```bash
cp .env.example ../.env
```

5. Update the `.env` file with your GROQ_API_KEY

## Running the Server

```bash
# From the backend directory
python -m app.main
```

Or using uvicorn directly:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Interactive API docs: http://localhost:8000/docs
- Alternative API docs: http://localhost:8000/redoc

## API Documentation

Visit http://localhost:8000/docs for interactive Swagger documentation.

## Project Structure

```
backend/
├── app/
│   ├── models/          # Pydantic models
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic
│   └── main.py          # Application entry point
└── requirements.txt     # Python dependencies
```

## Key Components

### LangChain Integration
- **ChatGroq**: Groq LLM integration
- **Memory**: Conversation buffer for context
- **Message Types**: System, Human, and AI messages

### LangGraph Workflow
- **State Management**: Tracks conversation state
- **Graph Nodes**: Process messages through defined workflow
- **Extensible**: Easy to add new conversation steps

### MongoDB Storage
- **Async Operations**: Using Motor for async MongoDB access
- **Collections**: `chats` collection stores conversation history
- **Schema**: Flexible document structure for messages

## Environment Variables

- `GROQ_API_KEY`: Your Groq API key (required)
- `MONGODB_URL`: MongoDB connection string (default: mongodb://localhost:27017)
- `APP_ENV`: Application environment (development/production)
- `DEBUG`: Enable debug mode (True/False)
