# AI Research Agent - Full Stack Application

Multi-agent research system with FastAPI backend and Next.js frontend.

## Project Structure
```
deep_research_agent/
├── backend/    # FastAPI server & AI agents
└── frontend/   # Next.js React application
```

## Quick Start

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
cp .env.example .env  # Add your API keys
python app.py
```

Backend runs on: http://localhost:8000

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: http://localhost:3000

## Environment Variables

### Backend (.env)
```
EXA_API_KEY=your_key_here
CEREBRAS_API_KEY=your_key_here
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc