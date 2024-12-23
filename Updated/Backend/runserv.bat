@echo off

:: Start the Django server
echo Starting Django server...
start cmd /k "cd backend && python manage.py runserver"

:: Start the React development server
echo Starting React development server...
start cmd /k "cd frontend && npm start"

:: End the script
echo Both servers are now running.
pause
