# DevPulse Backend

FastAPI backend for DevPulse - AI-Powered Sprint Orchestrator

## 🚀 Quick Start

### Prerequisites

- Python 3.9 or higher
- pip (Python package manager)

### Installation

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Create virtual environment:**
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Configure environment:**
```bash
# Copy example environment file
cp .env.example .env

# Edit .env if needed (default settings work for demo mode)
```

### Running the Server

**Option 1: Using Python directly**
```bash
python -m app.main
```

**Option 2: Using Uvicorn**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The server will start at: **http://localhost:8000**

### Verify Installation

1. **Check API health:**
```bash
curl http://localhost:8000/health
```

2. **View API documentation:**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 📁 Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── config.py               # Configuration management
│   ├── api/                    # API endpoints
│   │   ├── __init__.py
│   │   ├── repository.py       # Repository scanning endpoints
│   │   ├── analysis.py         # Code analysis endpoints
│   │   └── refactor.py         # Refactoring endpoints
│   ├── models/                 # Pydantic models
│   │   ├── __init__.py
│   │   ├── repository.py       # Repository data models
│   │   ├── analysis.py         # Analysis data models
│   │   └── refactor.py         # Refactor data models
│   ├── services/               # Business logic
│   │   ├── __init__.py
│   │   └── mock_service.py     # Mock data generation
│   └── database/               # Data storage
│       ├── __init__.py
│       └── db.py               # In-memory database
├── requirements.txt            # Python dependencies
├── .env                        # Environment configuration
├── .env.example                # Example environment file
└── README.md                   # This file
```

## 🔧 Configuration

### Environment Variables

Edit `.env` file to configure:

```env
# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=True

# CORS Origins
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Demo Mode (uses mock data)
DEMO_MODE=True

# IBM API Keys (optional, for production)
IBM_BOB_API_KEY=your_key_here
IBM_AGENT_ASSISTANT_API_KEY=your_key_here
```

### Demo Mode

By default, the backend runs in **DEMO_MODE** which:
- Uses mock data for all responses
- Doesn't require IBM API keys
- Perfect for development and demos
- Provides realistic sample data

## 📡 API Endpoints

### Repository Endpoints

- `POST /api/repository/scan` - Scan a repository
- `GET /api/repository/scan/{scan_id}` - Get scan status
- `GET /api/repository/tree` - Get repository tree
- `GET /api/repository/summary` - Get repository summary

### Analysis Endpoints

- `POST /api/analysis/analyze` - Analyze codebase
- `GET /api/analysis/current` - Get current analysis
- `GET /api/analysis/risks` - Get risk analysis
- `GET /api/analysis/issues/{file_path}` - Get file issues
- `GET /api/analysis/summary` - Get analysis summary

### Refactor Endpoints

- `POST /api/refactor/generate` - Generate refactor suggestions
- `GET /api/refactor/{file_path}` - Get refactor for file
- `POST /api/refactor/apply/{file_path}` - Apply refactor
- `GET /api/refactor/list/all` - List all refactors
- `DELETE /api/refactor/{file_path}` - Delete refactor

## 🧪 Testing

### Manual Testing

1. **Start the backend server**
2. **Open Swagger UI:** http://localhost:8000/docs
3. **Try the endpoints:**
   - POST `/api/repository/scan` with `{"path": "/test/repo"}`
   - GET `/api/analysis/current`
   - POST `/api/refactor/generate` with `{"file_path": "src/App.tsx"}`

### Using curl

```bash
# Health check
curl http://localhost:8000/health

# Scan repository
curl -X POST http://localhost:8000/api/repository/scan \
  -H "Content-Type: application/json" \
  -d '{"path": "/test/repo"}'

# Get analysis
curl http://localhost:8000/api/analysis/current

# Generate refactor
curl -X POST http://localhost:8000/api/refactor/generate \
  -H "Content-Type: application/json" \
  -d '{"file_path": "src/App.tsx"}'
```

## 🔍 Development

### Adding New Endpoints

1. Create endpoint in appropriate file under `app/api/`
2. Add route to router
3. Import in `app/main.py` if needed
4. Test using Swagger UI

### Adding New Models

1. Create Pydantic model in `app/models/`
2. Import in endpoint files
3. Use for request/response validation

### Logging

Logs are configured in `app/main.py`:
```python
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:8000 | xargs kill -9
```

### Module Not Found

```bash
# Ensure virtual environment is activated
# Reinstall dependencies
pip install -r requirements.txt
```

### CORS Issues

- Check `CORS_ORIGINS` in `.env`
- Ensure frontend URL is included
- Default: `http://localhost:5173,http://localhost:3000`

## 📦 Dependencies

Key dependencies:
- **FastAPI** - Modern web framework
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation
- **python-dotenv** - Environment management
- **GitPython** - Git operations (for production)
- **Radon** - Code complexity analysis (for production)

## 🚢 Production Deployment

### Using Docker (Recommended)

```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Using Gunicorn

```bash
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

## 📝 License

Made with Bob - IBM DevPulse Project

## 🤝 Support

For issues or questions:
1. Check API documentation: http://localhost:8000/docs
2. Review logs in console
3. Verify environment configuration in `.env`