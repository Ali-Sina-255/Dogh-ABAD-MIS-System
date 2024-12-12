cd frontend
npm install concurrently --save-dev


"scripts": {
  "start": "concurrently \"npm run server\" \"npm run frontend\"",
  "server": "cd ../backend && call venv\\Scripts\\activate && python manage.py runserver",
  "frontend": "react-scripts start"
}


npm start
