import os
import subprocess
import sys
import time

# Auto-detect base directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(BASE_DIR, "Backend")
frontend_dir = os.path.join(BASE_DIR, "Frontend")


def run_backend():
    print("🚀 Starting Django Backend...")

    # Detect virtual environment path
    activate_script = os.path.join(backend_dir, "venv/bin/activate")

    if os.path.exists(activate_script):
        print("🔵 Virtual environment detected. Activating venv...")
        command = "bash -c 'source venv/bin/activate && python3 manage.py runserver'"
    else:
        print("⚠️ No venv found! Running directly with python...")
        command = "python3 manage.py runserver"

    return subprocess.Popen(command, shell=True, cwd=backend_dir)


def run_frontend():
    print("🚀 Starting Frontend...")
    command = "npm run dev"  # Vite uses "npm run dev"
    return subprocess.Popen(command, shell=True, cwd=frontend_dir)


def run_commands():
    backend_proc = run_backend()
    time.sleep(3)

    frontend_proc = run_frontend()

    print("\n==============================")
    print("   ✔ Both servers started!   ")
    print("==============================")
    print("Backend running at: http://127.0.0.1:8000")
    print("Frontend running at: http://localhost:5173")
    print("==============================")

    backend_proc.wait()
    frontend_proc.wait()


if __name__ == "__main__":
    run_commands()
