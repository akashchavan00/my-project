# Excel Generation Tool - Update Documentation

## 🎉 New Feature Added: Excel Generation Tool

Your chatbot now includes a powerful Excel generation tool that can convert JSON data into formatted Excel files!

## ✨ What's New

### Backend Changes

1. **New Tool Module** (`backend/app/tools/excel_generator.py`)
   - `generate_excel_from_testcases()` - Specialized for test case format
   - `generate_excel_from_json()` - Generic JSON to Excel converter
   - Automatic formatting with headers, colors, and proper column widths

2. **Updated Agent Service** (`backend/app/services/agent_service.py`)
   - Agents can now use the `excel_generation` tool
   - Automatically extracts JSON from agent responses
   - Generates Excel files and provides download links
   - Files saved to `backend/downloads/` directory

3. **New API Endpoints** (`backend/app/routes/agent.py`)
   - `GET /api/agents/tools` - List available tools
   - `GET /api/agents/download/{filename}` - Download generated Excel files

4. **Updated Dependencies** (`backend/requirements.txt`)
   - Added `pandas` for data processing
   - Added `openpyxl` for Excel file generation

### Frontend Changes

1. **Sidebar Enhancement** (`frontend/src/components/Sidebar.jsx`)
   - New "Available Tools" dropdown section
   - Displays all available tools with descriptions
   - Shows tool usage instructions

2. **Agent Builder Enhancement** (`frontend/src/components/AgentBuilder.jsx`)
   - New "Tools (Optional)" section in agent creation form
   - Checkbox selection for available tools
   - Shows selected tools count
   - Tools display in pipeline preview

3. **Chat Interface Enhancement** (`frontend/src/components/ChatInterface.jsx`)
   - Excel files displayed with download buttons
   - Download buttons styled with file name
   - Direct download from chat messages

4. **New Styling**
   - Tool cards in sidebar with icons and descriptions
   - Tool selection checkboxes in agent builder
   - Excel download button styling
   - Responsive design for all new elements

## 🚀 How to Use

### Step 1: Install Dependencies

```powershell
cd d:\my_proj\backend
python -m pip install pandas openpyxl
```

### Step 2: Start Backend

```powershell
cd d:\my_proj\backend
python -m app.main
```

### Step 3: Start Frontend

```powershell
cd d:\my_proj\frontend
npm run dev
```

### Step 4: Create an Agent with Excel Tool

1. Click the sidebar toggle (☰)
2. Expand "Available Tools" to see the Excel Generation tool
3. Click "Create Agent" in the "Saved Agents" section
4. Fill in agent details:
   - **Name**: "Test Case Generator"
   - **Description**: "Generates test cases in Excel format"
   - **Prompt**: "You are a test case generator. Generate comprehensive test cases for the given requirement and output ONLY valid JSON with this structure: {\"test_cases\": [{\"id\": \"TC001\", \"title\": \"Test title\", \"preconditions\": \"Prerequisites\", \"steps\": [\"Step 1\", \"Step 2\"], \"expected_result\": \"Expected outcome\", \"priority\": \"High\"}]}"
   - **Tools**: Check "Excel Generation"
5. Click the "+" button to add the agent
6. Click "✓ Done"

### Step 5: Test the Agent

1. The agent pipeline banner will appear in the chat
2. Type a requirement, e.g., "Create test cases for a login feature with username and password"
3. Press Send
4. The agent will generate JSON test cases
5. The JSON will be automatically converted to Excel
6. A download button will appear in the message
7. Click "📥 Download Excel File" to get your formatted Excel file

## 📊 Excel Output Features

- **Formatted Headers**: Bold, colored headers with white text
- **Auto-sized Columns**: Columns automatically sized for content
- **Text Wrapping**: Long text wrapped properly
- **Frozen Headers**: Header row frozen for easy scrolling
- **Professional Styling**: Blue header (#305496), proper alignment
- **Test Case Format Support**: Special handling for test cases with steps

## 🔧 Tool Details

### Excel Generation Tool

**ID**: `excel_generation`

**Description**: Converts JSON data into formatted Excel (.xlsx) files

**Usage**: Agent must output valid JSON that will be automatically converted to Excel

**Supported JSON Formats**:

1. **Test Cases Format**:
```json
{
  "test_cases": [
    {
      "id": "TC001",
      "title": "Test title",
      "preconditions": "Prerequisites",
      "steps": ["Step 1", "Step 2"],
      "expected_result": "Expected outcome",
      "priority": "High"
    }
  ]
}
```

2. **Generic Array**:
```json
[
  {"name": "John", "age": 30, "city": "New York"},
  {"name": "Jane", "age": 25, "city": "Boston"}
]
```

3. **Generic Object**:
```json
{
  "column1": ["value1", "value2"],
  "column2": ["value3", "value4"]
}
```

## 💡 Example Prompts

1. **Test Cases**:
   - "Generate test cases for user registration"
   - "Create test scenarios for payment processing"
   - "Generate API test cases for REST endpoints"

2. **Generic Data**:
   - "Create a report of monthly sales data"
   - "Generate employee information table"
   - "Create inventory list with quantities"

## 🎨 UI Features

### Sidebar Tools Section
- Collapsible dropdown labeled "Available Tools"
- Shows tool count badge
- Each tool displays:
  - Tool icon (🔧)
  - Tool name
  - Description
  - Usage instructions (💡)

### Agent Builder Tools Selection
- Optional "Tools" section in agent form
- Checkbox list of available tools
- Selected tools counter
- Tools shown in pipeline preview with 🔧 icon

### Chat Excel Download
- Download button appears in agent messages
- Shows file name
- Styled with green accent color
- Hover effects for better UX
- Direct download on click

## 📁 File Structure

```
backend/
├── app/
│   ├── tools/
│   │   ├── __init__.py (NEW)
│   │   └── excel_generator.py (NEW)
│   ├── models/
│   │   └── agent.py (UPDATED)
│   ├── routes/
│   │   └── agent.py (UPDATED)
│   └── services/
│       └── agent_service.py (UPDATED)
├── downloads/ (NEW - auto-created)
└── requirements.txt (UPDATED)

frontend/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx (UPDATED)
│   │   ├── Sidebar.css (UPDATED)
│   │   ├── AgentBuilder.jsx (UPDATED)
│   │   ├── AgentBuilder.css (UPDATED)
│   │   ├── ChatInterface.jsx (UPDATED)
│   │   └── ChatInterface.css (UPDATED)
│   └── services/
│       └── agentService.js (UPDATED)
```

## 🔒 Security Notes

- Excel files saved to `backend/downloads/` directory
- Files accessible via authenticated API endpoint
- Files not committed to git (in .gitignore)
- No sensitive data should be generated in Excel

## 🐛 Troubleshooting

### Issue: "Could not extract valid JSON"
**Solution**: Ensure agent prompt explicitly instructs to output ONLY JSON without any explanatory text

### Issue: "Invalid JSON in agent response"
**Solution**: Add to agent prompt: "Do not include any explanatory text before or after the JSON. Your entire response must be a valid JSON object."

### Issue: Excel file not downloading
**Solution**: Check that backend server is running and `downloads/` directory exists

### Issue: Tool not appearing in sidebar
**Solution**: Refresh the page or check browser console for API errors

## 📝 Notes

- Excel files are timestamped (e.g., `export_20260806_230530.xlsx`)
- Files persist until manually deleted from `downloads/` folder
- Multiple agents can use the same tool
- Tools are optional - agents work normally without them
- Only the agent that produces final output needs the Excel tool

## 🎯 Future Enhancements

Potential additions:
- PDF generation tool
- CSV export tool
- Chart generation in Excel
- Multiple sheet support
- Custom Excel templates
- Email tool to send generated files

---

**Enjoy your new Excel generation capability!** 🎉
