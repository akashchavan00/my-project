# Custom Agent Feature Documentation

## 🤖 Overview

The chatbot now includes a powerful **Custom Agent Builder** that allows users to create single or multiple AI agents that execute sequentially on user input. Each agent can have its own configuration, task, and behavior.

## ✨ Features

### 1. Agent Builder Interface
- **Create Custom Agents** - Define agents with name, description, and specific tasks
- **Configure Parameters** - Set temperature for creativity control
- **Order Management** - Reorder agents to control execution sequence
- **Pipeline Visualization** - See all agents in execution order
- **Real-time Editing** - Edit or delete agents before execution

### 2. Agent Execution
- **Sequential Processing** - Agents execute in specified order
- **Output Chaining** - Each agent's output becomes the next agent's input
- **Execution Tracking** - See individual agent execution times
- **Detailed Results** - View output from each agent in the pipeline

### 3. Agent Templates (Coming Soon)
- Save frequently used agents as templates
- Load templates for quick pipeline creation
- Share agent configurations

## 🎯 How to Use

### Creating Agents

1. **Open Agent Builder**
   - Click the 🤖 button in the chat input area
   - OR click "Create Custom Agents" in the welcome screen

2. **Configure Agent**
   - **Name**: Give your agent a descriptive name (e.g., "Content Analyzer")
   - **Description**: Brief explanation of what the agent does
   - **Task/Prompt**: Detailed instructions for the agent (e.g., "You are an expert content analyzer. Analyze the given text and provide insights...")
   - **Temperature**: 0-2 (Higher = more creative, Lower = more focused)

3. **Add to Pipeline**
   - Click "➕ Add Agent" to add it to the execution pipeline
   - Repeat to create multiple agents

4. **Manage Pipeline**
   - **Reorder**: Use ▲▼ buttons to change execution order
   - **Edit**: Click ✎ to modify an agent
   - **Delete**: Click 🗑️ to remove an agent

5. **Execute**
   - Type your input message in the chat box
   - Click "🚀 Execute Pipeline"
   - Watch agents process your input sequentially

### Example Use Cases

#### 1. Content Creation Pipeline
```
Agent 1: "Research Expert" - Gather key points about the topic
Agent 2: "Writer" - Create engaging content from research
Agent 3: "Editor" - Polish and improve the content
```

#### 2. Data Analysis Pipeline
```
Agent 1: "Data Extractor" - Extract key data from text
Agent 2: "Analyzer" - Analyze patterns and trends
Agent 3: "Report Generator" - Create a summary report
```

#### 3. Code Review Pipeline
```
Agent 1: "Code Analyzer" - Identify issues and bugs
Agent 2: "Best Practices Checker" - Suggest improvements
Agent 3: "Documentation Generator" - Create documentation
```

## 🔧 Technical Implementation

### Backend Architecture

#### Models (`backend/app/models/agent.py`)
- `AgentConfig` - Agent configuration with name, prompt, temperature, etc.
- `AgentExecutionRequest` - Request to execute agents
- `AgentExecutionResult` - Individual agent result
- `AgentExecutionResponse` - Complete execution response

#### Service (`backend/app/services/agent_service.py`)
- **LangGraph Workflow** - Creates execution pipeline
- **Sequential Execution** - Processes agents in order
- **State Management** - Tracks execution state
- **Result Aggregation** - Combines all agent outputs

#### API Endpoints (`backend/app/routes/agent.py`)
- `POST /api/agents/execute` - Execute agent pipeline
- `POST /api/agents/save` - Save agent template (future)
- `GET /api/agents/templates` - Get saved templates (future)
- `DELETE /api/agents/templates/{id}` - Delete template (future)

### Frontend Architecture

#### Components
- **AgentBuilder.jsx** - Main agent builder interface
- **ChatInterface.jsx** - Integrated with agent execution
- **agentService.js** - API communication layer

#### Workflow
1. User opens Agent Builder
2. Creates and configures agents
3. Agents added to pipeline
4. User enters input text
5. Pipeline executes sequentially
6. Results displayed in chat

## 📊 Execution Flow

```
User Input
    ↓
Agent 1 (Input: User Input)
    ↓ Output
Agent 2 (Input: Agent 1 Output)
    ↓ Output
Agent 3 (Input: Agent 2 Output)
    ↓ Output
Final Output → Display in Chat
```

## 🎨 UI Features

### Agent Builder Modal
- **Two-Panel Layout**:
  - Left: Agent configuration form
  - Right: Pipeline visualization
- **Responsive Design** - Works on desktop, tablet, mobile
- **Smooth Animations** - Slide-in, fade effects
- **Color-Coded** - Matches app theme (terracotta & sage)

### Input Area
- **Agent Button (🤖)** - Quick access to builder
- **Visual Feedback** - Button highlights on hover
- **Disabled States** - When not connected

### Message Display
- **Special Formatting** - Agent results have distinct styling
- **Detailed Output** - Shows each agent's contribution
- **Execution Metrics** - Time taken for each agent

## 🔄 Model Configuration

The agents use the **Llama 3.1 8B Instant** model:
```python
model_name="llama-3.1-8b-instant"
```

This model provides:
- Fast response times
- Good quality outputs
- Cost-effective processing
- Suitable for sequential pipelines

## 💡 Best Practices

### Agent Design
1. **Be Specific** - Clear, detailed prompts work best
2. **Single Purpose** - Each agent should do one thing well
3. **Complementary Roles** - Design agents that build on each other
4. **Test Individually** - Verify each agent before adding to pipeline

### Pipeline Design
1. **Logical Flow** - Order matters! Plan your sequence
2. **3-5 Agents** - Sweet spot for most tasks
3. **Avoid Redundancy** - Don't repeat similar tasks
4. **Monitor Performance** - Check execution times

### Prompting Tips
1. **Role Definition** - Start with "You are an expert..."
2. **Clear Instructions** - Specify exactly what to do
3. **Output Format** - Describe how results should look
4. **Context Awareness** - Remind agent it's in a pipeline

## 🚀 Quick Start Example

Try this simple 2-agent pipeline:

**Agent 1: Summarizer**
```
Name: Text Summarizer
Prompt: You are an expert summarizer. Create a concise summary of the given text, highlighting the main points in 2-3 sentences.
Temperature: 0.3
```

**Agent 2: Key Points Extractor**
```
Name: Key Points Extractor  
Prompt: You are an expert analyst. From the summary provided, extract 3-5 key points as a bulleted list.
Temperature: 0.5
```

**Input**: "Paste any long article or text"
**Result**: Summarized text → Bullet points of key insights

## 🔮 Future Enhancements

- [ ] Save agent templates to database
- [ ] Share agents with other users
- [ ] Agent marketplace
- [ ] Parallel agent execution
- [ ] Conditional branching (if-then logic)
- [ ] Tool integration (web search, calculator, etc.)
- [ ] Visual pipeline editor
- [ ] Agent performance analytics

## 🐛 Troubleshooting

### Agent not executing
- Check if backend is running
- Verify GROQ_API_KEY is set
- Ensure input message is entered

### Slow execution
- Reduce number of agents
- Lower temperature values
- Check network connection

### Unexpected output
- Review agent prompts for clarity
- Check agent order
- Test agents individually

## 📝 API Examples

### Execute Agents (cURL)
```bash
curl -X POST http://localhost:8000/api/agents/execute \
  -H "Content-Type: application/json" \
  -d '{
    "user_input": "Explain quantum computing",
    "agents": [
      {
        "agent_id": "agent_1",
        "name": "Explainer",
        "description": "Explains concepts",
        "prompt": "You are a teacher. Explain this concept simply.",
        "temperature": 0.7,
        "tools": [],
        "order": 0
      }
    ],
    "session_id": "session_123"
  }'
```

### Response Format
```json
{
  "session_id": "session_123",
  "results": [
    {
      "agent_id": "agent_1",
      "agent_name": "Explainer",
      "input_text": "Explain quantum computing",
      "output_text": "Quantum computing is...",
      "execution_time": 1.23,
      "order": 0
    }
  ],
  "final_output": "Quantum computing is...",
  "total_execution_time": 1.25,
  "timestamp": "2026-08-06T19:30:00"
}
```

## 🎓 Learning Resources

### Prompt Engineering
- Be specific about the task
- Include examples when possible
- Define the output format
- Set the right temperature

### LangGraph Concepts
- **State**: Tracks data through pipeline
- **Nodes**: Individual agents
- **Edges**: Connections between agents
- **Workflow**: Complete execution graph

## 💻 Development

### Adding New Features

To add new agent capabilities:

1. **Update Models**: Add fields to `AgentConfig`
2. **Modify Service**: Update `agent_service.py`
3. **Update UI**: Add fields to `AgentBuilder.jsx`
4. **Test**: Create example agents

### Database Schema

Agent executions stored in MongoDB:
```javascript
{
  session_id: "session_123",
  user_input: "...",
  agents: [...],
  results: [...],
  final_output: "...",
  total_execution_time: 1.25,
  timestamp: ISODate("2026-08-06T19:30:00Z")
}
```

---

**Enjoy building your custom AI agent pipelines!** 🚀🤖
