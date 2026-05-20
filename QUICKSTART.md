# 🚀 DevPulse Quick Start Guide

Get DevPulse up and running in 5 minutes!

## Prerequisites

Before you begin, ensure you have:
- **Python 3.9+** installed ([Download](https://www.python.org/downloads/))
- **Node.js 16+** installed ([Download](https://nodejs.org/))
- **Git** installed ([Download](https://git-scm.com/))

## 🎯 One-Command Startup

### Windows
```bash
start-devpulse.bat
```

### macOS/Linux
```bash
chmod +x start-devpulse.sh
./start-devpulse.sh
```

That's it! The script will:
1. ✅ Set up Python virtual environment
2. ✅ Install backend dependencies
3. ✅ Start FastAPI backend server
4. ✅ Install frontend dependencies
5. ✅ Start React frontend server
6. ✅ Open the app in your browser

## 🌐 Access Points

Once started, access DevPulse at:

- **Frontend Application**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **API ReDoc**: http://localhost:8000/redoc

## 📋 Manual Setup (Alternative)

If you prefer manual setup:

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend
python -m app.main
```

Backend runs at: http://localhost:8000

### Frontend Setup

```bash
# Navigate to frontend (in a new terminal)
cd frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```

Frontend runs at: http://localhost:5173

## 🎮 First Steps

1. **Open the application** at http://localhost:5173

2. **Scan a repository**:
   - Click "Scan Repository" button
   - Enter any path (demo mode uses mock data)
   - Watch the D3.js sunburst visualization appear

3. **Explore the codebase map**:
   - Click on any node to see details
   - Red nodes indicate high-risk areas
   - Hover for complexity metrics

4. **View risk analysis**:
   - Check the "Active Risks" panel
   - See predicted merge conflicts
   - Review technical debt issues

5. **Try AI refactoring**:
   - Click on a high-risk file
   - Click "View AI Refactor"
   - See Bob's suggested improvements
   - View before/after code diff

## 🔧 Configuration

### Demo Mode (Default)

DevPulse runs in demo mode by default, using mock data. No IBM API keys required!

### Production Mode

To use real IBM APIs, edit `backend/.env`:

```env
DEMO_MODE=False
IBM_BOB_API_KEY=your_key_here
IBM_AGENT_ASSISTANT_API_KEY=your_key_here
```

## 🐛 Troubleshooting

### Port Already in Use

**Backend (Port 8000)**:
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:8000 | xargs kill -9
```

**Frontend (Port 5173)**:
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5173 | xargs kill -9
```

### Python Not Found

Ensure Python is in your PATH:
```bash
python --version
# or
python3 --version
```

### Node Not Found

Ensure Node.js is in your PATH:
```bash
node --version
npm --version
```

### Dependencies Installation Failed

**Backend**:
```bash
cd backend
pip install --upgrade pip
pip install -r requirements.txt
```

**Frontend**:
```bash
cd frontend
npm cache clean --force
npm install
```

### CORS Errors

Check `backend/.env` has correct frontend URL:
```env
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

## 📚 Next Steps

- Read [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- Check [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for development
- Review [DEMO_SCRIPT.md](./DEMO_SCRIPT.md) for presentation tips
- See [IBM_AGENT_ASSISTANT_SETUP.md](./IBM_AGENT_ASSISTANT_SETUP.md) for AI configuration

## 🎯 Key Features to Try

1. **Codebase Visualization**
   - Interactive D3.js sunburst chart
   - Color-coded complexity levels
   - Drill-down navigation

2. **Risk Prediction**
   - Merge conflict detection
   - Technical debt analysis
   - Sprint survival probability

3. **AI Refactoring**
   - Bob-powered code improvements
   - Before/after diff viewer
   - One-click application

4. **Real-time Analysis**
   - Instant feedback
   - Live updates
   - No external dependencies

## 💡 Demo Tips

- Use the mock data to demonstrate features
- Show the sunburst visualization first (WOW moment!)
- Click on red nodes to show risk analysis
- Demonstrate AI refactoring with side-by-side diff
- Highlight the sprint survival score

## 🛑 Stopping the Application

### Using Startup Scripts

- **Windows**: Close the Backend and Frontend command windows
- **macOS/Linux**: Press `Ctrl+C` in the terminal

### Manual Stop

```bash
# Find and kill processes
# Windows
taskkill /F /IM python.exe
taskkill /F /IM node.exe

# macOS/Linux
pkill -f "python -m app.main"
pkill -f "npm run dev"
```

## 📞 Support

If you encounter issues:

1. Check the logs:
   - Backend: Console output or `backend.log`
   - Frontend: Console output or `frontend.log`

2. Verify prerequisites:
   ```bash
   python --version  # Should be 3.9+
   node --version    # Should be 16+
   npm --version
   ```

3. Review documentation:
   - Backend: `backend/README.md`
   - Frontend: `frontend/README.md`

4. Check API health:
   ```bash
   curl http://localhost:8000/health
   ```

## 🎉 Success Indicators

You'll know everything is working when:

- ✅ Backend shows "Application startup complete" in console
- ✅ Frontend shows "Local: http://localhost:5173" in console
- ✅ Browser opens to DevPulse application
- ✅ You see the DevPulse logo and "Scan Repository" button
- ✅ API docs accessible at http://localhost:8000/docs

## 🚀 Ready for Demo?

Your DevPulse instance is now ready for the May 22nd demo! 

**Quick Demo Checklist**:
- [ ] Both servers running
- [ ] Frontend loads in browser
- [ ] Can scan a repository
- [ ] Sunburst visualization appears
- [ ] Risk panel shows issues
- [ ] AI refactor modal works
- [ ] Sprint survival score displays

---

**Made with Bob** - DevPulse: AI-Powered Sprint Orchestrator