import os
import subprocess
import sys
import time

# Define paths for backend and frontend directories
backend_dir = os.path.join(os.getcwd(), "backend")
frontend_dir = os.path.join(os.getcwd(), "frontend")

# Define the commands to run
backend_command = ["python", "manage.py", "runserver"]
frontend_command = ["npm", "run", "dev"]


def activate_virtualenv():
    # Path to activate virtual environment on Windows
    return os.path.join(backend_dir, "venv", "Scripts", "activate.bat")


def run_backend():
    # Activate virtual environment and run the Django server
    venv_activation = activate_virtualenv()
    command = f"call {venv_activation} && python manage.py runserver"

    # Run the backend server
    backend_proc = subprocess.Popen(command, shell=True, cwd=backend_dir)
    return backend_proc


def run_frontend():
    # Run the frontend dev server (npm)
    frontend_proc = subprocess.Popen(frontend_command, shell=True, cwd=frontend_dir)
    return frontend_proc


def run_commands():
    # Start the backend and frontend servers
    backend_proc = run_backend()
    time.sleep(2)  # Give the backend server a moment to start (you can adjust this)
    frontend_proc = run_frontend()

    # Wait for both processes to complete
    backend_proc.wait()
    frontend_proc.wait()


if __name__ == "__main__":
    run_commands()
