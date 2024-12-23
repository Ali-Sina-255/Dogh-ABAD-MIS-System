import subprocess
import os
import sys
import time

# Define paths for backend and frontend directories
backend_dir = os.path.join(os.getcwd(), 'backend')
frontend_dir = os.path.join(os.getcwd(), 'frontend')

# Define the commands to run
backend_command = ["python", "manage.py", "runserver"]
frontend_command = ["npm", "run", "dev"]

def activate_virtualenv():
    """Return the path to activate the virtual environment in the backend."""
    return os.path.join(backend_dir, 'venv', 'Scripts', 'activate.bat')

def run_backend():
    """Activate the virtual environment and run the Django server."""
    venv_activation = activate_virtualenv()
    # Run the backend Django server using subprocess
    command = f"call {venv_activation} && python manage.py runserver"
    return subprocess.Popen(command, shell=True, cwd=backend_dir)

def run_frontend():
    """Run the frontend development server."""
    return subprocess.Popen(frontend_command, shell=True, cwd=frontend_dir)

def run_commands():
    """Run both backend and frontend commands concurrently."""
    # Start the backend server in a separate process
    backend_proc = run_backend()

    # Give the backend a moment to initialize
    time.sleep(3)  # Adjust this if needed for a faster backend start

    # Start the frontend server in a separate process
    frontend_proc = run_frontend()

    # Wait for both processes to finish
    backend_proc.wait()
    frontend_proc.wait()

if __name__ == "__main__":
    run_commands()

