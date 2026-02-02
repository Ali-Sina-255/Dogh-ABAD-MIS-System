import os

from celery import Celery

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

# Create the Celery app instance
app = Celery("config")

# Configure Celery to use Django settings
app.config_from_object("django.conf:settings", namespace="CELERY")

# Automatically discover tasks in Django apps
app.autodiscover_tasks()


# Debugging task for Celery (optional)
@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f"Request: {self.request!r}")
