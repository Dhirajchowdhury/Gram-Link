@echo off
echo Starting AI-Mitra Backend...
cd backend
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)
call venv\Scripts\activate
echo Installing dependencies...
pip install -q -r requirements.txt
echo.
echo Backend starting on http://localhost:8000
echo.
python main.py
