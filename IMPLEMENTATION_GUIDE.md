# DevPulse Implementation Guide

## Quick Start Timeline (May 20-22, 2026)

### Day 1 (May 20) - Foundation
- ✅ Architecture design complete
- ⏳ Project structure setup
- ⏳ Backend skeleton with FastAPI
- ⏳ Frontend skeleton with React + Vite
- ⏳ IBM API connection testing

### Day 2 (May 21) - Core Features
- ⏳ LocalIngestionService implementation
- ⏳ D3.js Sunburst visualization
- ⏳ IBM Agent Assistant Studio integration
- ⏳ Risk calculation engine
- ⏳ Demo dataset preparation

### Day 3 (May 22) - Demo Day
- ⏳ Final integration testing
- ⏳ Demo rehearsal
- ⏳ Stakeholder presentation

---

## Prerequisites

### Required Software
```bash
# Python 3.10+
python --version

# Node.js 18+
node --version

# Git
git --version
```

### IBM Cloud Setup
1. **IBM Cloud Account**: https://cloud.ibm.com
2. **IBM Bob API Access**: Contact IBM for API key
3. **IBM Agent Assistant Studio**: https://servicesessentials.ibm.com/launchpad/agent-assistant-studio

### Environment Variables
Create `.env` file in backend directory:
```env
# IBM Services
IBM_BOB_API_KEY=your_bob_api_key_here
IBM_BOB_BASE_URL=https://api.ibm.com/bob/v1
IBM_AGENT_STUDIO_URL=https://agent-assistant-studio.ibm.com/api
IBM_AGENT_STUDIO_API_KEY=your_agent_studio_key
IBM_AGENT_ID=your_configured_agent_id

# Application
DATABASE_PATH=./devpulse.db
LOG_LEVEL=INFO
CORS_ORIGINS=http://localhost:5173

# Development
DEBUG=True
```

---

## Step-by-Step Implementation

### Phase 1: Project Structure Setup

#### 1.1 Create Directory Structure
```bash
# Create main project directory
mkdir devpulse
cd devpulse

# Backend structure
mkdir -p backend/app/{models,services,clients,api,database,tests}
mkdir -p backend/app/services
mkdir -p backend/app/clients
mkdir -p backend/app/api
mkdir -p backend/app/database

# Frontend structure
mkdir -p frontend/src/{components,hooks,services,types,utils}
mkdir -p frontend/public

# Documentation
mkdir docs
```

#### 1.2 Initialize Backend
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Create requirements.txt
cat > requirements.txt << EOF
fastapi==0.109.0
uvicorn[standard]==0.27.0
pydantic==2.5.3
pydantic-settings==2.1.0
python-dotenv==1.0.0
GitPython==3.1.40
radon==6.0.1
aiohttp==3.9.1
python-multipart==0.0.6
sqlalchemy==2.0.25
aiosqlite==0.19.0
pytest==7.4.3
pytest-asyncio==0.21.1
black==23.12.1
pylint==3.0.3
EOF

# Install dependencies
pip install -r requirements.txt
```

#### 1.3 Initialize Frontend
```bash
cd ../frontend

# Create Vite + React + TypeScript project
npm create vite@latest . -- --template react-ts

# Install dependencies
npm install

# Install additional packages
npm install -D tailwindcss postcss autoprefixer
npm install d3 @types/d3
npm install axios
npm install react-query
npm install react-diff-viewer-continued
npm install lucide-react

# Initialize Tailwind
npx tailwindcss init -p
```

---

### Phase 2: Backend Implementation

#### 2.1 FastAPI Main Application
**File**: `backend/app/main.py`
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.api import repository, analysis, refactor
from app.database.db import init_db

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Initializing DevPulse backend...")
    await init_db()
    logger.info("Database initialized")
    yield
    # Shutdown
    logger.info("Shutting down DevPulse backend...")

app = FastAPI(
    title="DevPulse API",
    description="AI-Powered Sprint Orchestrator",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(repository.router, prefix="/api/repository", tags=["repository"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["analysis"])
app.include_router(refactor.router, prefix="/api/refactor", tags=["refactor"])

@app.get("/")
async def root():
    return {
        "message": "DevPulse API",
        "version": "1.0.0",
        "status": "operational"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

#### 2.2 Configuration Management
**File**: `backend/app/config.py`
```python
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # IBM Services
    ibm_bob_api_key: str
    ibm_bob_base_url: str = "https://api.ibm.com/bob/v1"
    ibm_agent_studio_url: str
    ibm_agent_studio_api_key: str
    ibm_agent_id: str
    
    # Application
    database_path: str = "./devpulse.db"
    log_level: str = "INFO"
    cors_origins: List[str] = ["http://localhost:5173"]
    
    # Development
    debug: bool = False
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
```

#### 2.3 Data Models
**File**: `backend/app/models/repository.py`
```python
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime

class FileInfo(BaseModel):
    path: str
    loc: int
    complexity: Optional[int] = None
    last_modified: Optional[datetime] = None
    active_branches: List[str] = []
    contributors: int = 0

class BranchInfo(BaseModel):
    name: str
    files_touched: int
    last_commit: datetime

class RepositorySnapshot(BaseModel):
    name: str
    path: str
    total_files: int
    total_loc: int
    files: List[FileInfo]
    branches: List[BranchInfo]
    scan_date: datetime

class ScanRequest(BaseModel):
    path: str

class ScanResponse(BaseModel):
    scan_id: str
    status: str
    message: Optional[str] = None
```

**File**: `backend/app/models/analysis.py`
```python
from pydantic import BaseModel
from typing import List, Optional, Dict
from enum import Enum

class IssueSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class IssueType(str, Enum):
    CIRCULAR_DEPENDENCY = "circular_dependency"
    HIGH_COMPLEXITY = "high_complexity"
    CODE_SMELL = "code_smell"
    SECURITY = "security"

class CodeIssue(BaseModel):
    type: IssueType
    severity: IssueSeverity
    description: str
    line: Optional[int] = None
    suggestion: Optional[str] = None

class AuditResult(BaseModel):
    file: str
    issues: List[CodeIssue]
    overall_score: float
    complexity_score: Optional[int] = None

class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class RiskScore(BaseModel):
    file: str
    risk_score: float
    risk_level: RiskLevel
    merge_conflict_probability: float
    sprint_impact: str
    reasons: List[str]
    predicted_conflict_date: Optional[str] = None

class SprintSurvival(BaseModel):
    probability: float
    high_risk_files: List[str]
    total_risks: int
    recommendation: str
```

#### 2.4 LocalIngestionService
**File**: `backend/app/services/ingestion.py`
```python
import os
import git
from pathlib import Path
from typing import List, Dict
from datetime import datetime, timedelta
import logging

from app.models.repository import (
    RepositorySnapshot, FileInfo, BranchInfo
)

logger = logging.getLogger(__name__)

class LocalIngestionService:
    def __init__(self):
        self.supported_extensions = {
            '.py', '.js', '.ts', '.tsx', '.jsx',
            '.java', '.cpp', '.c', '.go', '.rs',
            '.rb', '.php', '.swift', '.kt'
        }
    
    async def scan_repository(self, repo_path: str) -> RepositorySnapshot:
        """Scan a local Git repository and extract metadata"""
        logger.info(f"Scanning repository: {repo_path}")
        
        if not os.path.exists(repo_path):
            raise ValueError(f"Repository path does not exist: {repo_path}")
        
        try:
            repo = git.Repo(repo_path)
        except git.InvalidGitRepositoryError:
            raise ValueError(f"Not a valid Git repository: {repo_path}")
        
        # Extract file tree
        files = await self._parse_file_tree(repo_path)
        
        # Extract Git metadata
        branches = await self._extract_git_metadata(repo)
        
        # Calculate file churn and contributors
        files = await self._enrich_file_metadata(repo, files)
        
        total_loc = sum(f.loc for f in files)
        
        return RepositorySnapshot(
            name=os.path.basename(repo_path),
            path=repo_path,
            total_files=len(files),
            total_loc=total_loc,
            files=files,
            branches=branches,
            scan_date=datetime.now()
        )
    
    async def _parse_file_tree(self, repo_path: str) -> List[FileInfo]:
        """Parse file tree and count lines of code"""
        files = []
        
        for root, _, filenames in os.walk(repo_path):
            # Skip common ignore directories
            if any(ignore in root for ignore in ['.git', 'node_modules', 'venv', '__pycache__']):
                continue
            
            for filename in filenames:
                file_path = os.path.join(root, filename)
                ext = Path(filename).suffix
                
                if ext not in self.supported_extensions:
                    continue
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        loc = len(f.readlines())
                    
                    relative_path = os.path.relpath(file_path, repo_path)
                    
                    files.append(FileInfo(
                        path=relative_path,
                        loc=loc,
                        last_modified=datetime.fromtimestamp(
                            os.path.getmtime(file_path)
                        )
                    ))
                except Exception as e:
                    logger.warning(f"Error reading file {file_path}: {e}")
        
        return files
    
    async def _extract_git_metadata(self, repo: git.Repo) -> List[BranchInfo]:
        """Extract Git branch information"""
        branches = []
        cutoff_date = datetime.now() - timedelta(days=30)
        
        for branch in repo.branches:
            try:
                last_commit = branch.commit.committed_datetime
                
                if last_commit < cutoff_date:
                    continue
                
                # Count files touched in this branch
                files_touched = len(list(branch.commit.stats.files.keys()))
                
                branches.append(BranchInfo(
                    name=branch.name,
                    files_touched=files_touched,
                    last_commit=last_commit
                ))
            except Exception as e:
                logger.warning(f"Error processing branch {branch.name}: {e}")
        
        return branches
    
    async def _enrich_file_metadata(
        self,
        repo: git.Repo,
        files: List[FileInfo]
    ) -> List[FileInfo]:
        """Enrich file metadata with Git information"""
        
        for file_info in files:
            try:
                # Find which branches touch this file
                active_branches = []
                for branch in repo.branches:
                    try:
                        if file_info.path in branch.commit.stats.files:
                            active_branches.append(branch.name)
                    except:
                        pass
                
                file_info.active_branches = active_branches
                
                # Count contributors (simplified)
                commits = list(repo.iter_commits(paths=file_info.path, max_count=100))
                contributors = len(set(c.author.email for c in commits))
                file_info.contributors = contributors
                
            except Exception as e:
                logger.warning(f"Error enriching metadata for {file_info.path}: {e}")
        
        return files
```

#### 2.5 IBM Bob Client
**File**: `backend/app/clients/bob_client.py`
```python
import aiohttp
import logging
from typing import Dict, List

from app.config import settings

logger = logging.getLogger(__name__)

class IBMBobClient:
    def __init__(self):
        self.api_key = settings.ibm_bob_api_key
        self.base_url = settings.ibm_bob_base_url
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    async def analyze_code(
        self,
        code: str,
        language: str,
        file_path: str
    ) -> Dict:
        """Analyze code using IBM Bob API"""
        
        endpoint = f"{self.base_url}/analyze"
        
        payload = {
            "code": code,
            "language": language,
            "file_path": file_path,
            "analysis_types": [
                "complexity",
                "dependencies",
                "code_smells",
                "security"
            ]
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    endpoint,
                    json=payload,
                    headers=self.headers
                ) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        logger.error(f"Bob API error: {response.status}")
                        return self._mock_analysis(code, language)
        except Exception as e:
            logger.error(f"Error calling Bob API: {e}")
            return self._mock_analysis(code, language)
    
    def _mock_analysis(self, code: str, language: str) -> Dict:
        """Mock analysis for development/demo"""
        import random
        
        lines = code.split('\n')
        complexity = min(len(lines) // 10, 30)
        
        issues = []
        if complexity > 15:
            issues.append({
                "type": "high_complexity",
                "severity": "medium",
                "description": f"High cyclomatic complexity: {complexity}",
                "line": random.randint(1, len(lines)),
                "suggestion": "Consider breaking down into smaller functions"
            })
        
        if "import" in code and code.count("import") > 10:
            issues.append({
                "type": "circular_dependency",
                "severity": "high",
                "description": "Potential circular dependency detected",
                "line": random.randint(1, len(lines)),
                "suggestion": "Extract shared types to separate module"
            })
        
        return {
            "file": "analyzed_file",
            "issues": issues,
            "overall_score": max(1, 10 - len(issues) * 2),
            "complexity_score": complexity
        }
```

---

### Phase 3: Frontend Implementation

#### 3.1 Tailwind Configuration
**File**: `frontend/tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        risk: {
          low: '#4ade80',
          medium: '#fbbf24',
          high: '#ef4444',
          critical: '#dc2626'
        }
      }
    },
  },
  plugins: [],
}
```

#### 3.2 API Service
**File**: `frontend/src/services/api.ts`
```typescript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ScanRequest {
  path: string;
}

export interface ScanResponse {
  scan_id: string;
  status: string;
  message?: string;
}

export interface FileInfo {
  path: string;
  loc: number;
  complexity?: number;
  risk_score?: number;
  risk_level?: string;
}

export interface RepositoryData {
  name: string;
  total_files: number;
  total_loc: number;
  files: FileInfo[];
}

export const repositoryApi = {
  scanRepository: async (path: string): Promise<ScanResponse> => {
    const response = await apiClient.post('/repository/scan', { path });
    return response.data;
  },
  
  getScanStatus: async (scanId: string): Promise<any> => {
    const response = await apiClient.get(`/repository/scan/${scanId}`);
    return response.data;
  },
  
  getRepositoryTree: async (): Promise<RepositoryData> => {
    const response = await apiClient.get('/repository/tree');
    return response.data;
  },
};

export const analysisApi = {
  analyzeFile: async (filePath: string): Promise<any> => {
    const response = await apiClient.post('/analysis/file', { file_path: filePath });
    return response.data;
  },
  
  getRisks: async (): Promise<any> => {
    const response = await apiClient.get('/analysis/risks');
    return response.data;
  },
};

export const refactorApi = {
  generateRefactor: async (filePath: string, issues: any[]): Promise<any> => {
    const response = await apiClient.post('/refactor/generate', {
      file_path: filePath,
      issues,
    });
    return response.data;
  },
  
  getRefactor: async (refactorId: string): Promise<any> => {
    const response = await apiClient.get(`/refactor/${refactorId}`);
    return response.data;
  },
  
  applyRefactor: async (refactorId: string): Promise<any> => {
    const response = await apiClient.post('/refactor/apply', { refactor_id: refactorId });
    return response.data;
  },
};
```

#### 3.3 D3.js Sunburst Component
**File**: `frontend/src/components/CodebaseMap.tsx`
```typescript
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface FileNode {
  name: string;
  value?: number;
  complexity?: number;
  risk?: number;
  children?: FileNode[];
}

interface CodebaseMapProps {
  data: FileNode;
  onFileClick: (file: any) => void;
}

export const CodebaseMap: React.FC<CodebaseMapProps> = ({ data, onFileClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current || !data) return;
    
    const width = 800;
    const height = 800;
    const radius = Math.min(width, height) / 2;
    
    // Clear previous render
    d3.select(svgRef.current).selectAll('*').remove();
    
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);
    
    // Create hierarchy
    const root = d3.hierarchy(data)
      .sum(d => d.value || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0));
    
    // Create partition layout
    const partition = d3.partition<FileNode>()
      .size([2 * Math.PI, radius]);
    
    partition(root);
    
    // Color scale based on risk
    const colorScale = d3.scaleLinear<string>()
      .domain([0, 0.3, 0.6, 1])
      .range(['#4ade80', '#fbbf24', '#fb923c', '#ef4444']);
    
    // Create arc generator
    const arc = d3.arc<d3.HierarchyRectangularNode<FileNode>>()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .innerRadius(d => d.y0)
      .outerRadius(d => d.y1);
    
    // Draw arcs
    svg.selectAll('path')
      .data(root.descendants())
      .join('path')
      .attr('d', arc)
      .attr('fill', d => {
        const risk = d.data.risk || 0;
        return colorScale(risk);
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        if (d.data.value) {
          onFileClick(d.data);
        }
      })
      .on('mouseover', function() {
        d3.select(this).attr('opacity', 0.8);
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 1);
      })
      .append('title')
      .text(d => `${d.data.name}\nLOC: ${d.value}\nRisk: ${((d.data.risk || 0) * 100).toFixed(0)}%`);
    
  }, [data, onFileClick]);
  
  return (
    <div className="flex justify-center items-center bg-gray-50 rounded-lg p-4">
      <svg ref={svgRef}></svg>
    </div>
  );
};
```

---

## Demo Dataset Creation

### Sample Repository Structure
```bash
# Create demo repository
mkdir demo-repo
cd demo-repo
git init

# Create sample files with intentional issues
mkdir -p src/components src/utils src/services

# High-risk file (circular dependency, high complexity)
cat > src/components/UserProfile.tsx << 'EOF'
import React from 'react';
import { AuthContext } from '../services/AuthService';
import { UserAvatar } from './UserAvatar';

export const UserProfile = () => {
  // Intentionally complex function
  const handleUserUpdate = (data: any) => {
    if (data.type === 'email') {
      if (data.verified) {
        if (data.primary) {
          // Many nested conditions
          return true;
        }
      }
    }
    return false;
  };
  
  return <div>Profile</div>;
};
EOF

# Create multiple branches
git checkout -b feature/auth
git checkout -b feature/profile
git checkout -b bugfix/validation
```

---

## Testing Strategy

### Backend Tests
```python
# backend/app/tests/test_ingestion.py
import pytest
from app.services.ingestion import LocalIngestionService

@pytest.mark.asyncio
async def test_scan_repository():
    service = LocalIngestionService()
    result = await service.scan_repository("./demo-repo")
    assert result.total_files > 0
    assert result.total_loc > 0
```

### Frontend Tests
```typescript
// frontend/src/components/__tests__/CodebaseMap.test.tsx
import { render } from '@testing-library/react';
import { CodebaseMap } from '../CodebaseMap';

test('renders sunburst chart', () => {
  const mockData = {
    name: 'root',
    children: [{ name: 'src', value: 100 }]
  };
  
  const { container } = render(
    <CodebaseMap data={mockData} onFileClick={() => {}} />
  );
  
  expect(container.querySelector('svg')).toBeInTheDocument();
});
```

---

## Deployment Instructions

### Local Development
```bash
# Terminal 1: Backend
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Production Build
```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Frontend
cd frontend
npm run build
npm run preview
```

---

## Troubleshooting

### Common Issues

1. **IBM API Connection Failed**
   - Verify API keys in `.env`
   - Check network connectivity
   - Use mock mode for demo

2. **Git Repository Not Found**
   - Ensure path is absolute
   - Check Git repository is initialized
   - Verify read permissions

3. **D3.js Not Rendering**
   - Check browser console for errors
   - Verify data structure matches expected format
   - Ensure SVG dimensions are set

---

## Next Steps

After completing this implementation guide:

1. **Test with Real Repository**: Point DevPulse at an actual React/TypeScript project
2. **Refine Risk Algorithm**: Adjust weights based on real-world data
3. **Enhance Agent Workflows**: Add more sophisticated refactoring strategies
4. **Add More Visualizations**: Dependency graphs, complexity heatmaps
5. **CI/CD Integration**: Create GitHub Actions workflow

---

## Success Criteria

✅ Backend API responds to health check  
✅ Frontend loads without errors  
✅ Repository scan completes in < 30 seconds  
✅ D3.js visualization renders correctly  
✅ Risk scores calculated accurately  
✅ IBM Bob API integration working  
✅ Agent Assistant Studio generates refactors  
✅ Demo flow executes smoothly  

---

## Resources

- FastAPI Documentation: https://fastapi.tiangolo.com
- D3.js Examples: https://observablehq.com/@d3/gallery
- IBM Agent Assistant Studio: https://servicesessentials.ibm.com/launchpad/agent-assistant-studio
- React Query: https://tanstack.com/query/latest
- TailwindCSS: https://tailwindcss.com/docs