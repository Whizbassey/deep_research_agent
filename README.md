# Cognitia Deep Research - AI-Powered Multi-Agent Research System

A production-ready full-stack application featuring dynamic multi-agent research with intelligent query complexity analysis, real-time activity streaming, and rate limiting. Built with FastAPI, React/TypeScript, Cerebras GPT-OSS 120B (Free Tier), and Exa search.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Python](https://img.shields.io/badge/python-3.12+-blue)
![React](https://img.shields.io/badge/react-18+-61DAFB?logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi)

## 🌟 Key Features

### 🤖 Intelligent Agent Orchestration
- **Dynamic Subagent Allocation**: Automatically determines optimal number of research agents (2-6) based on query complexity
- **Complexity Analysis**: AI-powered analysis scores queries 1-5 and explains allocation decisions
- **Parallel Research**: Multiple specialized agents work simultaneously for faster results

### 📊 Real-Time Progress Tracking
- **Live Progress Bar**: Watch research progress from 0-100% with phase indicators
- **Activity Streaming**: Server-Sent Events (SSE) provide real-time updates
- **Agent Status**: See which agents are active, completed, and their individual progress
- **Source Tracking**: Real-time count of sources collected across all agents

### 🛡️ Security & Production Features
- **API Authentication**: API key-based authentication for secure access
- **Rate Limiting**: 10 requests per hour per IP with clear feedback
- **Input Validation**: Model selection validation and query sanitization
- **XSS Protection**: Markdown content sanitization
- **CORS Security**: Configured for specific origins only
- **Error Handling**: Generic error messages to clients, detailed logs server-side
- **Session Management**: Per-session activity tracking
- **Request Headers**: Rate limit status exposed via headers

### 🎨 Modern UI/UX
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Mode**: Theme toggle for user preference
- **Activity Dashboard**: Auto-switches to activity view during research
- **Results Visualization**: Complexity score, subagent count, source metrics
- **Export Options**: Download research reports as PDF or DOCX with proper table formatting

## 🏗️ Architecture

```
deep_research_agent/
├── backend/
│   ├── agents/
│   │   ├── lead_agent.py          # Orchestrates research with QueryAnalyzer
│   │   ├── sub_agent.py            # Specialized research agents
│   │   └── query_analyzer.py       # Dynamic complexity analysis
│   ├── api/
│   │   ├── routes.py               # REST API endpoints
│   │   ├── models.py               # Pydantic request/response models
│   │   └── dependencies.py         # Dependency injection
│   ├── middleware/
│   │   └── rate_limit.py           # Rate limiting middleware
│   ├── services/
│   │   ├── ai_service.py           # Cerebras GPT-OSS 120B integration
│   │   └── search_service.py       # Exa web search
│   └── utils/
│       ├── activity.py             # Activity logging & streaming
│       └── prompts.py              # AI prompt templates
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ActivityFeed.tsx    # Real-time activity display
    │   │   ├── ResearchResults.tsx # Results with complexity metrics
    │   │   ├── SearchForm.tsx      # Query input form
    │   │   └── Sidebar.tsx         # Activity/Sources tabs
    │   └── pages/
    │       └── Index.tsx           # Main application page
    └── public/
```

## 🚀 Quick Start

### Prerequisites
- Python 3.12+
- Node.js 18+
- API Keys: [Cerebras](https://cerebras.ai), [Exa](https://exa.ai)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Linux/Mac)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your API keys:
# EXA_API_KEY=your_exa_key
# CEREBRAS_API_KEY=your_cerebras_key

# Start server
python app.py
```

Backend: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Health Check: http://localhost:8000/api/v1/health

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
echo "VITE_API_URL=http://localhost:8000/api/v1" > .env.local

# Start development server
npm run dev
```

Frontend: http://localhost:5173

## 📖 API Reference

### Research Endpoint
```http
POST /api/v1/research
Content-Type: application/json

{
  "query": "Best practices for React performance optimization",
  "num_results_per_agent": 3
}
```

**Response:**
```json
{
  "query": "Best practices for React performance optimization",
  "subagents": 4,
  "total_sources": 12,
  "synthesis": "Executive Summary: ...",
  "session_id": "abc123...",
  "complexity_analysis": {
    "complexity_score": 3,
    "num_subagents": 4,
    "explanation": "Multiple optimization techniques require comprehensive coverage",
    "estimated_sources": 16
  }
}
```

### Activity Stream (SSE)
```http
GET /api/v1/activity/stream/{session_id}
```

Real-time Server-Sent Events stream of research activities.

### Rate Limit Status
```http
GET /api/v1/rate-limit
```

Returns current rate limit status:
```json
{
  "limit": 10,
  "remaining": 8,
  "reset_seconds": 1800,
  "window_hours": 1
}
```

## 🎯 Query Complexity Examples

### Simple Query (2 subagents)
**Query:** "What is React?"
- Complexity Score: 1/5
- Subagents: 2
- Focus: Definition, Basic use cases

### Moderate Query (4 subagents)
**Query:** "Best practices for Node.js authentication"
- Complexity Score: 3/5
- Subagents: 4
- Focus: Fundamentals, Current methods, Security concerns, Implementation examples

### Complex Query (6 subagents)
**Query:** "AI impact on software development in 2025"
- Complexity Score: 5/5
- Subagents: 6
- Focus: Fundamentals, Tools landscape, Ethics, Future predictions, Case studies, Market analysis

## 🔧 Configuration

### Backend Settings (`backend/config/settings.py`)
```python
AI_MODEL = "gpt-oss-120b"          # Cerebras model (Free tier)
MAX_TOKENS = 2000                  # Response length
TEMPERATURE = 0.2                  # Creativity vs precision
DEFAULT_SEARCH_RESULTS = 10        # Sources per agent
MAX_CHARACTERS_PER_RESULT = 2000   # Content length per source
```

### Rate Limiting (`backend/middleware/rate_limit.py`)
```python
max_requests = 10      # Requests per window
window_hours = 1       # Time window
```

## 🧪 Development

### Running Tests
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### Code Quality
```bash
# Backend linting
cd backend
ruff check .
black .

# Frontend linting
cd frontend
npm run lint
```

## 📈 Performance

- **Inference Speed**: GPT-OSS 120B on Cerebras delivers fast inference on the free tier
- **Response Time**: Typical research queries complete in 10-30 seconds
- **Concurrent Agents**: Up to 6 agents working in parallel
- **Source Coverage**: 6-30 sources depending on query complexity

## 🤝 Tech Stack

### Backend
- **FastAPI**: Modern, fast web framework
- **Cerebras GPT-OSS 120B**: Open-source model (free tier available)
- **Exa**: Neural search for high-quality sources
- **Pydantic**: Data validation and settings
- **Server-Sent Events**: Real-time streaming

### Frontend
- **React 18**: Component-based UI
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Vite**: Fast build tooling
- **shadcn/ui**: Modern component library

## 📄 License

MIT License - feel free to use this project for your portfolio or commercial applications.

## 🙏 Acknowledgments

- [Cerebras](https://cerebras.ai) for blazing-fast AI inference
- [Exa](https://exa.ai) for semantic web search
- [FastAPI](https://fastapi.tiangolo.com) for the excellent web framework

---

**Built with ❤️ for recruiters and hiring managers** - Demonstrates production-ready AI application architecture, real-time systems, and modern full-stack development practices.