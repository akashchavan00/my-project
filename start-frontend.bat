@echo off
echo Starting AI Chatbot Frontend...
echo.

cd frontend

echo Checking if node_modules exists...
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

echo.
echo Starting Vite development server...
echo Frontend will be available at http://localhost:3000
echo.

call npm run dev

pause
