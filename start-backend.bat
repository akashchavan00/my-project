@echo off
echo Starting AI Chatbot Backend...
echo.

cd backend

echo Checking if virtual environment exists...
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate

echo Installing dependencies...
pip install -r requirements.txt

echo.
echo Starting FastAPI server...
echo Backend will be available at http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo.

python -m app.main

pause
