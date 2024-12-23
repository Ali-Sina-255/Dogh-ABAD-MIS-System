import subprocess
import os
import sys

# Define paths for backend and frontend directories
backend_dir = os.path.join(os.getcwd(), 'backend')
frontend_dir = os.path.join(os.getcwd(), 'frontend')

# Define the commands to run
backend_command = ["python", "manage.py", "runserver"]
frontend_command = ["npm", "run", "dev"]

def activate_virtualenv():
    # Path for activating the virtual environment in the backend folder
    return os.path.join(backend_dir, 'venv', 'Scripts', 'activate.bat')

def run_commands():
    # Activate virtual environment in the backend
    venv_activation = activate_virtualenv()

    # Start the backend Django server in the background
    backend_proc = subprocess.Popen(f"call {venv_activation} && python manage.py runserver", shell=True, cwd=backend_dir)

    # Start the frontend development server
    frontend_proc = subprocess.Popen(frontend_command, shell=True, cwd=frontend_dir)

    # Wait for both processes to finish
    backend_proc.wait()
    frontend_proc.wait()

if __name__ == "__main__":
    run_commands()
