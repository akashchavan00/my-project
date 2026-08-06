# AI Chatbot Application

A full-stack AI chatbot application built with React, FastAPI, MongoDB, LangChain, and LangGraph using Groq's LLM API.

## Features

- 💬 Real-time chat interface
- 🤖 AI-powered responses using LangChain and LangGraph
- 📚 Conversation history stored in MongoDB
- 🔄 Session management
- 🎨 Modern, responsive UI
- ⚡ Fast API with FastAPI
- 🚀 React frontend with Vite

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **LangChain** - LLM application framework
- **LangGraph** - Workflow orchestration for LLMs
- **MongoDB** - NoSQL database for chat history
- **Groq API** - Fast LLM inference
- **Motor** - Async MongoDB driver

### Frontend
- **React** - UI library
- **Vite** - Build tool and dev server
- **Axios** - HTTP client
- **CSS3** - Styling

## Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── chat.py           # Pydantic models
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   └── chat.py           # API endpoints
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── database.py       # MongoDB connection
│   │   │   └── chat_service.py   # LangChain/LangGraph logic
│   │   ├── __init__.py
│   │   └── main.py               # FastAPI app
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatInterface.jsx
│   │   │   └── ChatInterface.css
│   │   ├── services/
│   │   │   └── chatService.js    # API integration
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .env
├── .gitignore
└── README.md
```

## Prerequisites

- Python 3.8+
- Node.js 16+
- MongoDB (running on localhost:27017)
- Groq API Key

## Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd my_proj
```

### 2. Environment Variables

Make sure your `.env` file in the root directory contains:

```env
GROQ_API_KEY=your_groq_api_key_here
MONGODB_URL=mongodb://localhost:27017
```

### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the backend server
python -m app.main
```

The backend API will be available at `http://localhost:8000`

### 4. Frontend Setup

Open a new terminal:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### 5. MongoDB Setup

Ensure MongoDB is running on `localhost:27017`. If you need to start it:

```bash
# On Windows (if installed as service):
net start MongoDB

# On macOS:
brew services start mongodb-community

# On Linux:
sudo systemctl start mongod
```

## API Endpoints

### POST `/api/chat/message`
Send a message to the chatbot
```json
{
  "message": "Hello!",
  "session_id": "optional-session-id"
}
```

### GET `/api/chat/history/{session_id}`
Get chat history for a session

### DELETE `/api/chat/session/{session_id}`
Delete a chat session

### GET `/api/chat/health`
Health check endpoint

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Start chatting with the AI assistant
3. Your conversation history is automatically saved
4. Click the "Clear" button to start a new session

## Features Explained

### LangChain Integration
- Uses ChatGroq for LLM inference
- Manages conversation context and memory
- Implements system prompts for consistent behavior

### LangGraph Workflow
- Defines a state graph for message processing
- Handles message flow from user input to AI response
- Extensible for complex conversation flows

### MongoDB Storage
- Stores conversation history per session
- Enables conversation continuity across page refreshes
- Supports multiple concurrent chat sessions

## Development

### Backend Development
The FastAPI server runs with auto-reload enabled. Any changes to Python files will automatically restart the server.

### Frontend Development
Vite provides hot module replacement (HMR). Changes to React components will reflect immediately without page refresh.

## Troubleshooting

### Backend won't start
- Ensure MongoDB is running
- Check that GROQ_API_KEY is set in .env
- Verify all Python dependencies are installed

### Frontend can't connect to backend
- Ensure backend is running on port 8000
- Check browser console for CORS errors
- Verify the API_BASE_URL in `chatService.js`

### Database connection issues
- Verify MongoDB is running on localhost:27017
- Check MongoDB logs for errors
- Ensure sufficient disk space

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
