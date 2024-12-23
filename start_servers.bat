@echo off

:: Activate the virtual environment
call venv\Scripts\activate.bat

:: Start the Django server in the background
start python manage.py runserver

:: Start the frontend server
npm run dev

:: Pause to keep the command prompt open
pause
