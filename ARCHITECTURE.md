# DevPulse: AI-Powered Sprint Orchestrator - Architecture Plan

## Executive Summary

**Project**: DevPulse - Core Architect AI-Powered Sprint Orchestrator  
**Timeline**: May 20-22, 2026 (2 days)  
**Target**: IBM Consulting Demo  
**Core Innovation**: Agentic AI that predicts and fixes architectural blockers before they break sprints

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        DevPulse System                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐         ┌──────────────────┐            │
│  │  React Frontend  │◄────────┤  FastAPI Backend │            │
│  │  + D3.js + Tail  │  REST   │  + Python Core   │            │
│  └──────────────────┘         └──────────────────┘            │
│           │                            │                        │
│           │                            ▼                        │
│           │                   ┌─────────────────┐              │
│           │                   │ Core Services   │              │
│           │                   ├─────────────────┤              │
│           │                   │ • LocalIngest   │              │
│           │                   │ • ArchAuditor   │              │
│           │                   │ • RiskPredictor │              │
│           │                   └─────────────────┘              │
│           │                            │                        │
│           │                            ▼                        │
│           │                   ┌─────────────────┐              │
│           └──────────────────►│  SQLite Local   │              │
│                                └─────────────────┘              │
│                                         │                       │
│                                         ▼                       │
│                        ┌────────────────────────────┐          │
│                        │  External AI Services      │          │
│                        ├────────────────────────────┤          │
│                        │ • IBM Bob API              │          │
│                        │ • IBM Agent Assistant      │          │
│                        │   Studio (AgenticFixer)    │          │
│                        └────────────────────────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Styling**: TailwindCSS 3.x
- **Visualization**: D3.js v7 (Sunburst charts)
- **State Management**: React Context API + React Query
- **HTTP Client**: Axios
- **Build Tool**: Vite

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Async Runtime**: asyncio + uvicorn
- **Git Integration**: GitPython library
- **Code Analysis**: ast (Python AST parser), radon (complexity metrics)
- **Database**: SQLite3 (local, lightweight)
- **API Documentation**: OpenAPI/Swagger (auto-generated)

### AI/ML Services
- **IBM Bob API**: Core code intelligence and architectural analysis
- **IBM Agent Assistant Studio**: Agentic workflow orchestration for refactoring
- **Authentication**: IBM Cloud IAM tokens

### Development Tools
- **Package Management**: pip (backend), npm (frontend)
- **Code Quality**: pylint, black, prettier
- **Testing**: pytest (backend), Jest + React Testing Library (frontend)

---

## Detailed Component Design

### 1. Backend Services Architecture

#### 1.1 LocalIngestionService
**Purpose**: Parse local Git repositories and extract metadata

**Key Functions**:
```python
class LocalIngestionService:
    def scan_repository(repo_path: str) -> RepositorySnapshot
    def extract_git_metadata() -> GitMetadata
    def parse_file_tree() -> FileTree
    def detect_active_branches() -> List[BranchInfo]
    def calculate_file_churn() -> Dict[str, int]
```

**Data Extracted**:
- File structure and hierarchy
- Git branch activity (last 30 days)
- File modification frequency
- Developer touchpoints per file
- Lines of code per file/directory

**Output Format**:
```json
{
  "repository": {
    "name": "my-react-app",
    "path": "/local/path",
    "total_files": 245,
    "total_loc": 15420
  },
  "files": [
    {
      "path": "src/components/UserProfile.tsx",
      "loc": 320,
      "complexity": 15,
      "last_modified": "2026-05-18",
      "active_branches": ["feature/auth", "bugfix/profile"],
      "contributors": 3
    }
  ],
  "branches": [
    {
      "name": "feature/auth",
      "files_touched": 12,
      "last_commit": "2026-05-19"
    }
  ]
}
```

#### 1.2 ArchitectureAuditor
**Purpose**: Use IBM Bob API to analyze code quality and architectural issues

**Key Functions**:
```python
class ArchitectureAuditor:
    def audit_file(file_path: str, content: str) -> AuditResult
    def detect_circular_dependencies(files: List[File]) -> List[CircularDep]
    def calculate_complexity_score(file: File) -> ComplexityScore
    def identify_code_smells(file: File) -> List[CodeSmell]
```

**IBM Bob API Integration**:
```python
# Pseudo-code for Bob API call
async def call_bob_api(code_snippet: str, analysis_type: str):
    headers = {"Authorization": f"Bearer {IBM_API_KEY}"}
    payload = {
        "code": code_snippet,
        "language": "typescript",
        "analysis": ["complexity", "dependencies", "smells"]
    }
    response = await http_client.post(
        "https://api.ibm.com/bob/v1/analyze",
        json=payload,
        headers=headers
    )
    return response.json()
```

**Output Format**:
```json
{
  "file": "src/components/UserProfile.tsx",
  "issues": [
    {
      "type": "circular_dependency",
      "severity": "high",
      "description": "Circular import detected with AuthContext",
      "line": 5,
      "suggestion": "Extract shared types to separate module"
    },
    {
      "type": "high_complexity",
      "severity": "medium",
      "cyclomatic_complexity": 18,
      "description": "Function handleUserUpdate has too many branches"
    }
  ],
  "overall_score": 6.2
}
```

#### 1.3 RiskPredictor
**Purpose**: Calculate sprint failure probability based on code + Git data

**Risk Calculation Algorithm**:
```python
def calculate_sprint_risk(file: File, git_data: GitMetadata) -> RiskScore:
    # Factors:
    # 1. Code complexity (weight: 0.3)
    # 2. Number of active branches touching file (weight: 0.4)
    # 3. Number of contributors (weight: 0.2)
    # 4. Recent modification frequency (weight: 0.1)
    
    complexity_risk = normalize(file.complexity, max=50)
    branch_risk = normalize(len(file.active_branches), max=5)
    contributor_risk = normalize(file.contributors, max=4)
    churn_risk = normalize(file.modifications_last_week, max=10)
    
    total_risk = (
        complexity_risk * 0.3 +
        branch_risk * 0.4 +
        contributor_risk * 0.2 +
        churn_risk * 0.1
    )
    
    return {
        "risk_score": total_risk,
        "risk_level": get_risk_level(total_risk),
        "merge_conflict_probability": branch_risk * 0.85,
        "sprint_impact": calculate_impact(file)
    }
```

**Output Format**:
```json
{
  "file": "src/components/UserProfile.tsx",
  "risk_score": 0.78,
  "risk_level": "high",
  "merge_conflict_probability": 0.85,
  "sprint_impact": "critical",
  "reasons": [
    "3 active branches modifying this file",
    "High cyclomatic complexity (18)",
    "Modified 7 times in last 3 days"
  ],
  "predicted_conflict_date": "2026-05-23"
}
```

#### 1.4 AgenticFixer (IBM Agent Assistant Studio)
**Purpose**: Generate refactored code using agentic AI workflows

**Agent Design**:
```
Agent: CodeRefactorAgent
├── Input: Problematic code + audit results
├── Tools:
│   ├── CodeAnalyzer (IBM Bob API)
│   ├── DependencyResolver
│   ├── CodeGenerator
│   └── TestGenerator
├── Workflow:
│   1. Analyze current code structure
│   2. Identify refactoring strategy
│   3. Generate decoupled components
│   4. Create migration plan
│   5. Generate unit tests
└── Output: Before/After code diff + explanation
```

**IBM Agent Assistant Studio Configuration**:
```yaml
agent:
  name: CodeRefactorAgent
  description: Autonomous code refactoring agent
  model: watsonx-granite-code-34b
  tools:
    - name: analyze_code
      type: api_call
      endpoint: https://api.ibm.com/bob/v1/analyze
    - name: generate_refactor
      type: llm_generation
      prompt_template: |
        Given this code with issues:
        {code}
        
        Issues found:
        {issues}
        
        Generate a refactored version that:
        1. Removes circular dependencies
        2. Reduces complexity
        3. Follows SOLID principles
        4. Maintains functionality
  workflow:
    - step: analyze
      tool: analyze_code
    - step: plan
      tool: llm_reasoning
    - step: generate
      tool: generate_refactor
    - step: validate
      tool: analyze_code
```

**Output Format**:
```json
{
  "original_code": "...",
  "refactored_code": "...",
  "changes": [
    {
      "type": "extract_component",
      "description": "Extracted UserAvatar into separate component",
      "files_created": ["src/components/UserAvatar.tsx"]
    },
    {
      "type": "remove_circular_dep",
      "description": "Moved shared types to types/user.ts"
    }
  ],
  "complexity_improvement": {
    "before": 18,
    "after": 8,
    "reduction": "55%"
  },
  "migration_steps": [
    "1. Create new UserAvatar component",
    "2. Update imports in UserProfile",
    "3. Run tests to verify functionality"
  ]
}
```

### 2. Frontend Architecture

#### 2.1 Component Hierarchy
```
App
├── Header
├── RepositorySelector
├── Dashboard
│   ├── CodebaseMap (D3.js Sunburst)
│   ├── RiskPanel
│   │   ├── RiskCard (multiple)
│   │   └── SprintSurvivalScore
│   └── RefactorViewer
│       ├── CodeDiffDisplay
│       └── ApplyRefactorButton
└── Footer
```

#### 2.2 D3.js Sunburst Visualization

**Data Structure**:
```javascript
const sunburstData = {
  name: "root",
  children: [
    {
      name: "src",
      children: [
        {
          name: "components",
          children: [
            {
              name: "UserProfile.tsx",
              value: 320, // LOC
              complexity: 18,
              risk: 0.78,
              color: "#ff4444" // Red for high risk
            }
          ]
        }
      ]
    }
  ]
};
```

**Color Coding**:
- Green (#4ade80): Low risk (0-0.3)
- Yellow (#fbbf24): Medium risk (0.3-0.6)
- Red (#ef4444): High risk (0.6-1.0)

**Interactions**:
- Click: Show file details in RiskPanel
- Hover: Display tooltip with metrics
- Zoom: Focus on specific directory

#### 2.3 Active Risk Panel

**Features**:
- Real-time risk cards sorted by severity
- Sprint survival probability gauge
- Predicted conflict timeline
- One-click refactor button

**Risk Card Component**:
```jsx
<RiskCard>
  <FileIcon />
  <FileName>src/components/UserProfile.tsx</FileName>
  <RiskBadge level="high">High Risk</RiskBadge>
  <Metrics>
    <Metric label="Complexity" value="18" />
    <Metric label="Active Branches" value="3" />
    <Metric label="Conflict Probability" value="85%" />
  </Metrics>
  <IssueList>
    <Issue>Circular dependency with AuthContext</Issue>
    <Issue>High cyclomatic complexity</Issue>
  </IssueList>
  <Button onClick={handleRefactor}>
    Apply Bob AI Refactor
  </Button>
</RiskCard>
```

#### 2.4 Bob AI Refactor Diff Viewer

**Features**:
- Side-by-side code comparison
- Syntax highlighting
- Line-by-line diff markers
- Explanation of changes
- Apply/Reject buttons

**Implementation**:
```jsx
import { DiffEditor } from 'react-diff-viewer-continued';

<RefactorViewer>
  <DiffEditor
    oldValue={originalCode}
    newValue={refactoredCode}
    splitView={true}
    showDiffOnly={false}
  />
  <ChangeExplanation>
    <h3>Changes Made:</h3>
    <ul>
      {changes.map(change => (
        <li key={change.id}>{change.description}</li>
      ))}
    </ul>
  </ChangeExplanation>
  <ActionButtons>
    <Button variant="primary" onClick={applyRefactor}>
      Apply Refactor
    </Button>
    <Button variant="secondary" onClick={closeViewer}>
      Cancel
    </Button>
  </ActionButtons>
</RefactorViewer>
```

### 3. API Endpoints

#### 3.1 Repository Management
```
POST /api/repository/scan
Body: { "path": "/local/repo/path" }
Response: { "scan_id": "uuid", "status": "processing" }

GET /api/repository/scan/{scan_id}
Response: { "status": "complete", "data": {...} }

GET /api/repository/tree
Response: { "tree": [...], "metrics": {...} }
```

#### 3.2 Code Analysis
```
POST /api/analyze/file
Body: { "file_path": "src/App.tsx" }
Response: { "audit_result": {...}, "risk_score": {...} }

GET /api/analyze/risks
Response: { "high_risk_files": [...], "sprint_survival": 0.65 }
```

#### 3.3 Agentic Refactoring
```
POST /api/refactor/generate
Body: { "file_path": "src/App.tsx", "issues": [...] }
Response: { "refactor_id": "uuid", "status": "processing" }

GET /api/refactor/{refactor_id}
Response: {
  "original_code": "...",
  "refactored_code": "...",
  "changes": [...]
}

POST /api/refactor/apply
Body: { "refactor_id": "uuid" }
Response: { "success": true, "files_modified": [...] }
```

### 4. Database Schema (SQLite)

```sql
-- Scan sessions
CREATE TABLE scans (
    id TEXT PRIMARY KEY,
    repository_path TEXT NOT NULL,
    scan_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT CHECK(status IN ('processing', 'complete', 'failed')),
    total_files INTEGER,
    total_loc INTEGER
);

-- File analysis results
CREATE TABLE file_analyses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scan_id TEXT REFERENCES scans(id),
    file_path TEXT NOT NULL,
    loc INTEGER,
    complexity INTEGER,
    risk_score REAL,
    risk_level TEXT,
    audit_results TEXT, -- JSON blob
    UNIQUE(scan_id, file_path)
);

-- Refactor history
CREATE TABLE refactors (
    id TEXT PRIMARY KEY,
    scan_id TEXT REFERENCES scans(id),
    file_path TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT CHECK(status IN ('pending', 'complete', 'applied', 'rejected')),
    original_code TEXT,
    refactored_code TEXT,
    changes TEXT -- JSON blob
);

-- Risk predictions
CREATE TABLE risk_predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scan_id TEXT REFERENCES scans(id),
    file_path TEXT NOT NULL,
    predicted_conflict_date DATE,
    merge_conflict_probability REAL,
    sprint_impact TEXT,
    reasons TEXT -- JSON array
);
```

---

## IBM Integration Details

### IBM Bob API Integration

**Authentication**:
```python
import requests
from typing import Dict

class IBMBobClient:
    def __init__(self, api_key: str, base_url: str):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    async def analyze_code(self, code: str, language: str) -> Dict:
        endpoint = f"{self.base_url}/analyze"
        payload = {
            "code": code,
            "language": language,
            "analysis_types": [
                "complexity",
                "dependencies",
                "code_smells",
                "security"
            ]
        }
        response = await self.session.post(
            endpoint,
            json=payload,
            headers=self.headers
        )
        return response.json()
```

**Configuration** (`.env` file):
```env
IBM_BOB_API_KEY=your_api_key_here
IBM_BOB_BASE_URL=https://api.ibm.com/bob/v1
IBM_AGENT_STUDIO_URL=https://agent-assistant-studio.ibm.com/api
IBM_AGENT_STUDIO_API_KEY=your_agent_studio_key
```

### IBM Agent Assistant Studio Integration

**Agent Creation**:
1. Create agent via Agent Assistant Studio UI
2. Configure tools and workflows
3. Get agent ID and API endpoint
4. Integrate via REST API

**API Call Example**:
```python
class AgentAssistantClient:
    async def invoke_refactor_agent(
        self,
        code: str,
        issues: List[Dict]
    ) -> Dict:
        endpoint = f"{self.base_url}/agents/{self.agent_id}/invoke"
        payload = {
            "input": {
                "code": code,
                "issues": issues,
                "language": "typescript",
                "refactor_goals": [
                    "reduce_complexity",
                    "remove_circular_deps",
                    "improve_testability"
                ]
            }
        }
        response = await self.session.post(
            endpoint,
            json=payload,
            headers=self.headers
        )
        return response.json()
```

---

## Project Structure

```
devpulse/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI app entry
│   │   ├── config.py               # Configuration
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── repository.py      # Data models
│   │   │   ├── analysis.py
│   │   │   └── refactor.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── ingestion.py       # LocalIngestionService
│   │   │   ├── auditor.py         # ArchitectureAuditor
│   │   │   ├── risk.py            # RiskPredictor
│   │   │   └── agentic_fixer.py   # AgenticFixer
│   │   ├── clients/
│   │   │   ├── __init__.py
│   │   │   ├── bob_client.py      # IBM Bob API client
│   │   │   └── agent_client.py    # Agent Assistant client
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── repository.py      # Repository endpoints
│   │   │   ├── analysis.py        # Analysis endpoints
│   │   │   └── refactor.py        # Refactor endpoints
│   │   └── database/
│   │       ├── __init__.py
│   │       ├── db.py              # SQLite connection
│   │       └── schema.sql         # Database schema
│   ├── tests/
│   │   ├── test_ingestion.py
│   │   ├── test_auditor.py
│   │   └── test_risk.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── RepositorySelector.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── CodebaseMap.tsx    # D3.js Sunburst
│   │   │   ├── RiskPanel.tsx
│   │   │   ├── RiskCard.tsx
│   │   │   ├── RefactorViewer.tsx
│   │   │   └── SprintSurvivalScore.tsx
│   │   ├── hooks/
│   │   │   ├── useRepository.ts
│   │   │   ├── useAnalysis.ts
│   │   │   └── useRefactor.ts
│   │   ├── services/
│   │   │   └── api.ts             # API client
│   │   ├── types/
│   │   │   └── index.ts           # TypeScript types
│   │   ├── utils/
│   │   │   ├── d3-helpers.ts
│   │   │   └── risk-calculator.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── docs/
│   ├── API.md                      # API documentation
│   ├── SETUP.md                    # Setup instructions
│   └── DEMO.md                     # Demo script
├── .gitignore
├── README.md
└── ARCHITECTURE.md                 # This file
```

---

## Demo Flow Script

### Setup (Pre-Demo)
1. Clone a sample React repository with known issues
2. Run DevPulse backend: `uvicorn app.main:app --reload`
3. Run DevPulse frontend: `npm run dev`
4. Open browser to `http://localhost:5173`

### Demo Steps (5 minutes)

**Step 1: Repository Scan (30 seconds)**
- Click "Select Repository" button
- Choose local React project folder
- Show loading animation
- Display "Scan Complete: 245 files analyzed"

**Step 2: Codebase Visualization (1 minute)**
- Show D3.js Sunburst chart with color-coded files
- Hover over green (safe) files - show low complexity
- Hover over yellow (medium risk) files
- **WOW Moment**: Click glowing red node (high risk file)

**Step 3: Risk Analysis (1.5 minutes)**
- Risk Panel slides in showing:
  - File: `src/components/UserProfile.tsx`
  - Risk Level: HIGH (0.78)
  - Issues:
    - Circular Dependency detected
    - 3 active branches touching this file
    - Cyclomatic complexity: 18
  - **Key Insight**: "85% chance of sprint-killing merge conflict on Friday"
- Show Sprint Survival Score: 65% (Yellow warning)

**Step 4: Agentic Blocker Guard (2 minutes)**
- Click "Apply Bob AI Refactor" button
- Show loading: "Bob AI analyzing architecture..."
- Display side-by-side diff viewer:
  - Left: Original messy code
  - Right: Refactored clean code
- Highlight changes:
  - Extracted UserAvatar component
  - Removed circular dependency
  - Reduced complexity from 18 to 8
- Show migration steps
- Click "Apply Refactor"
- Show success message: "Refactor applied. Risk reduced to 0.25"

**Step 5: Verification (30 seconds)**
- Return to Sunburst chart
- Show file now colored green (low risk)
- Sprint Survival Score updated to 92% (Green)
- Display message: "Sprint blocker eliminated. Team velocity protected."

---

## Key Differentiators

### vs. SonarQube
- **SonarQube**: Static analysis, red squiggly lines
- **DevPulse**: Predictive risk + agentic fixes

### vs. GitHub Copilot
- **Copilot**: Line-by-line autocomplete
- **DevPulse**: System-wide architectural refactoring

### vs. Jira Dashboards
- **Jira**: What happened yesterday (lagging indicator)
- **DevPulse**: What will break tomorrow (leading indicator)

---

## Success Metrics

### Technical Metrics
- Scan 1000+ file repository in < 30 seconds
- Generate refactor suggestions in < 10 seconds
- Achieve 90%+ accuracy in merge conflict prediction
- Reduce code complexity by 40%+ on average

### Business Metrics
- Reduce sprint failures by 60%
- Save 8 hours/week of senior architect time
- Prevent 3+ merge conflicts per sprint
- Increase team velocity by 25%

---

## Risk Mitigation

### Technical Risks
1. **IBM API Rate Limits**
   - Mitigation: Cache analysis results, batch requests
2. **Large Repository Performance**
   - Mitigation: Incremental scanning, file filtering
3. **Agent Assistant Studio Latency**
   - Mitigation: Async processing, progress indicators

### Timeline Risks
1. **IBM Integration Complexity**
   - Mitigation: Use mock APIs for demo, integrate later
2. **D3.js Learning Curve**
   - Mitigation: Use pre-built Sunburst templates
3. **Agent Configuration**
   - Mitigation: Pre-configure agent before demo

---

## Next Steps

1. **Immediate (Today - May 20)**
   - Set up project structure
   - Initialize FastAPI backend
   - Create React frontend skeleton
   - Test IBM Bob API connection

2. **Tomorrow (May 21)**
   - Implement LocalIngestionService
   - Build D3.js Sunburst visualization
   - Integrate IBM Agent Assistant Studio
   - Create demo dataset

3. **Demo Day (May 22)**
   - Final testing
   - Prepare demo script
   - Run through demo 3x
   - Present to stakeholders

---

## Conclusion

DevPulse represents a paradigm shift from reactive code quality tools to proactive sprint protection. By combining local Git intelligence with IBM's agentic AI capabilities, we deliver a zero-setup solution that predicts and prevents architectural disasters before they impact delivery timelines.

**The WOW Factor**: An AI that doesn't just tell you what's wrong—it fixes it for you.