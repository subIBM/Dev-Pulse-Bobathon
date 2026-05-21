"""
Mock service for demo purposes
Provides realistic data without requiring actual Git repos or IBM APIs
"""
import random
import uuid
from datetime import datetime, timedelta
from typing import List

from app.models.repository import FileInfo, BranchInfo, RepositorySnapshot
from app.models.analysis import (
    CodeIssue, IssueType, IssueSeverity, AuditResult,
    RiskScore, RiskLevel, SprintSurvival
)
from app.models.refactor import (
    RefactorResult, RefactorChange, RefactorChangeType,
    ComplexityImprovement, RefactorStatus
)


def generate_mock_repository(repo_name: str = "demo-react-app") -> RepositorySnapshot:
    """Generate mock repository data"""
    
    # Mock file structure
    files = [
        # High risk files
        FileInfo(
            path="src/components/UserProfile.tsx",
            loc=320,
            complexity=18,
            last_modified=datetime.now() - timedelta(days=1),
            active_branches=["feature/auth", "feature/profile", "bugfix/validation"],
            contributors=3,
            risk_score=0.78,
            risk_level="high"
        ),
        FileInfo(
            path="src/services/AuthService.ts",
            loc=250,
            complexity=15,
            last_modified=datetime.now() - timedelta(days=2),
            active_branches=["feature/auth", "bugfix/security"],
            contributors=2,
            risk_score=0.65,
            risk_level="medium"
        ),
        # Medium risk files
        FileInfo(
            path="src/components/Dashboard.tsx",
            loc=180,
            complexity=10,
            last_modified=datetime.now() - timedelta(days=5),
            active_branches=["feature/dashboard"],
            contributors=1,
            risk_score=0.45,
            risk_level="medium"
        ),
        FileInfo(
            path="src/utils/validation.ts",
            loc=150,
            complexity=8,
            last_modified=datetime.now() - timedelta(days=7),
            active_branches=[],
            contributors=2,
            risk_score=0.35,
            risk_level="low"
        ),
        # Low risk files
        FileInfo(
            path="src/components/Header.tsx",
            loc=80,
            complexity=3,
            last_modified=datetime.now() - timedelta(days=10),
            active_branches=[],
            contributors=1,
            risk_score=0.15,
            risk_level="low"
        ),
        FileInfo(
            path="src/components/Footer.tsx",
            loc=60,
            complexity=2,
            last_modified=datetime.now() - timedelta(days=15),
            active_branches=[],
            contributors=1,
            risk_score=0.10,
            risk_level="low"
        ),
        FileInfo(
            path="src/types/user.ts",
            loc=40,
            complexity=1,
            last_modified=datetime.now() - timedelta(days=20),
            active_branches=[],
            contributors=1,
            risk_score=0.05,
            risk_level="low"
        ),
    ]
    
    # Add more low-risk files to reach realistic count
    for i in range(20):
        files.append(FileInfo(
            path=f"src/components/Component{i}.tsx",
            loc=random.randint(50, 150),
            complexity=random.randint(1, 5),
            last_modified=datetime.now() - timedelta(days=random.randint(10, 30)),
            active_branches=[],
            contributors=1,
            risk_score=random.uniform(0.05, 0.25),
            risk_level="low"
        ))
    
    branches = [
        BranchInfo(
            name="feature/auth",
            files_touched=5,
            last_commit=datetime.now() - timedelta(hours=6)
        ),
        BranchInfo(
            name="feature/profile",
            files_touched=3,
            last_commit=datetime.now() - timedelta(hours=12)
        ),
        BranchInfo(
            name="bugfix/validation",
            files_touched=2,
            last_commit=datetime.now() - timedelta(days=1)
        ),
    ]
    
    total_loc = sum(f.loc for f in files)
    
    return RepositorySnapshot(
        name=repo_name,
        path=f"/mock/path/{repo_name}",
        total_files=len(files),
        total_loc=total_loc,
        files=files,
        branches=branches,
        scan_date=datetime.now()
    )


def generate_mock_audit(file_path: str) -> AuditResult:
    """Generate mock audit result"""
    
    issues = []
    
    if "UserProfile" in file_path:
        issues = [
            CodeIssue(
                type=IssueType.CIRCULAR_DEPENDENCY,
                severity=IssueSeverity.HIGH,
                description="Circular dependency detected with AuthContext",
                line=5,
                suggestion="Extract shared types to separate module"
            ),
            CodeIssue(
                type=IssueType.HIGH_COMPLEXITY,
                severity=IssueSeverity.MEDIUM,
                description="Function handleUserUpdate has cyclomatic complexity of 18",
                line=45,
                suggestion="Break down into smaller functions"
            ),
        ]
        score = 4.5
        complexity = 18
    elif "AuthService" in file_path:
        issues = [
            CodeIssue(
                type=IssueType.CODE_SMELL,
                severity=IssueSeverity.MEDIUM,
                description="Long method detected",
                line=30,
                suggestion="Consider extracting helper methods"
            ),
        ]
        score = 6.0
        complexity = 15
    else:
        score = 8.5
        complexity = 5
    
    return AuditResult(
        file=file_path,
        issues=issues,
        overall_score=score,
        complexity_score=complexity
    )


def generate_mock_risk(file_path: str) -> RiskScore:
    """Generate mock risk score"""
    
    if "UserProfile" in file_path:
        return RiskScore(
            file=file_path,
            risk_score=0.78,
            risk_level=RiskLevel.HIGH,
            merge_conflict_probability=0.85,
            sprint_impact="critical",
            reasons=[
                "3 active branches modifying this file",
                "High cyclomatic complexity (18)",
                "Modified 7 times in last 3 days",
                "Circular dependency detected"
            ],
            predicted_conflict_date=(datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d")
        )
    elif "AuthService" in file_path:
        return RiskScore(
            file=file_path,
            risk_score=0.65,
            risk_level=RiskLevel.MEDIUM,
            merge_conflict_probability=0.45,
            sprint_impact="moderate",
            reasons=[
                "2 active branches touching this file",
                "Medium complexity (15)",
                "Security-critical component"
            ],
            predicted_conflict_date=(datetime.now() + timedelta(days=4)).strftime("%Y-%m-%d")
        )
    else:
        return RiskScore(
            file=file_path,
            risk_score=0.25,
            risk_level=RiskLevel.LOW,
            merge_conflict_probability=0.10,
            sprint_impact="low",
            reasons=["Low complexity", "No active branches"],
            predicted_conflict_date=None
        )


def generate_mock_sprint_survival() -> SprintSurvival:
    """Generate mock sprint survival data"""
    return SprintSurvival(
        probability=0.65,
        high_risk_files=[
            "src/components/UserProfile.tsx",
            "src/services/AuthService.ts"
        ],
        total_risks=2,
        recommendation="Address high-risk files before Friday to avoid sprint-killing merge conflicts"
    )

def generate_mock_analysis():
    """Generate complete mock analysis response"""
    from app.models.analysis import AnalysisResponse
    
    # Generate issues for high-risk files
    issues = [
        CodeIssue(
            type=IssueType.CIRCULAR_DEPENDENCY,
            severity=IssueSeverity.HIGH,
            description="Circular dependency detected with AuthContext",
            line=5,
            suggestion="Extract shared types to separate module"
        ),
        CodeIssue(
            type=IssueType.HIGH_COMPLEXITY,
            severity=IssueSeverity.MEDIUM,
            description="Function handleUserUpdate has cyclomatic complexity of 18",
            line=45,
            suggestion="Break down into smaller functions"
        ),
        CodeIssue(
            type=IssueType.CODE_SMELL,
            severity=IssueSeverity.MEDIUM,
            description="Long method detected in AuthService",
            line=30,
            suggestion="Consider extracting helper methods"
        ),
    ]
    
    # Generate audit results
    audit_results = [
        generate_mock_audit("src/components/UserProfile.tsx"),
        generate_mock_audit("src/services/AuthService.ts"),
        generate_mock_audit("src/components/Dashboard.tsx"),
    ]
    
    # Generate risk scores
    risk_scores = [
        generate_mock_risk("src/components/UserProfile.tsx"),
        generate_mock_risk("src/services/AuthService.ts"),
        generate_mock_risk("src/components/Dashboard.tsx"),
    ]
    
    # Generate sprint survival
    sprint_survival = generate_mock_sprint_survival()
    
    return AnalysisResponse(
        issues=issues,
        audit_results=audit_results,
        risk_scores=risk_scores,
        sprint_survival=sprint_survival,
        sprint_survival_probability=sprint_survival.probability * 100,
        total_files_analyzed=27
    )



def generate_mock_refactor(file_path: str) -> RefactorResult:
    """Generate mock refactor result tailored to the requested file"""
    normalized_path = file_path.replace("\\", "/")
    file_name = normalized_path.split("/")[-1]
    module_name = file_name.rsplit(".", 1)[0] if "." in file_name else file_name
    safe_identifier = "".join(char if char.isalnum() else "_" for char in module_name).strip("_") or "module"
    extension = file_name.rsplit(".", 1)[-1].lower() if "." in file_name else ""

    if extension == "py":
        original_code = f'''# File: {file_name}

def analyze_{safe_identifier}_payload(payload):
    if not payload:
        return {{"file": "{file_name}", "result": []}}

    if isinstance(payload, dict):
        if payload.get("source") == "{module_name}":
            if payload.get("records"):
                values = []
                for record in payload.get("records", []):
                    if record.get("is_valid"):
                        values.append(record.get("value"))
                return {{"file": "{file_name}", "result": values}}

    return {{"file": "{file_name}", "result": []}}'''
        refactored_code = f'''# Refactor target: {file_name}

def _collect_valid_{safe_identifier}_values(records):
    return [record.get("value") for record in records if record.get("is_valid")]


def analyze_{safe_identifier}_payload(payload):
    if not isinstance(payload, dict):
        return {{"file": "{file_name}", "result": []}}

    if payload.get("source") != "{module_name}":
        return {{"file": "{file_name}", "result": []}}

    records = payload.get("records", [])
    return {{"file": "{file_name}", "result": _collect_valid_{safe_identifier}_values(records)}}'''
        changes = [
            RefactorChange(
                type=RefactorChangeType.SIMPLIFY_LOGIC,
                description=f"Converted nested payload parsing in {file_name} into guard-clause flow specific to {module_name}",
                files_created=[]
            ),
            RefactorChange(
                type=RefactorChangeType.EXTRACT_COMPONENT,
                description=f"Extracted {safe_identifier}-specific record collection helper for {file_name}",
                files_created=[]
            ),
        ]
        migration_steps = [
            f"1. Replace nested parsing logic inside {file_name} with explicit guard clauses for {module_name}",
            f"2. Extract reusable record filtering helper dedicated to {file_name}",
            f"3. Re-run tests for {file_name} input validation and valid-record extraction",
            f"4. Verify the {module_name} source gate still rejects unrelated payloads",
        ]
        test_code = f'''def test_analyze_{safe_identifier}_payload_rejects_other_sources():
    payload = {{"source": "other_module", "records": [{{"is_valid": True, "value": 1}}]}}
    assert analyze_{safe_identifier}_payload(payload) == {{"file": "{file_name}", "result": []}}


def test_analyze_{safe_identifier}_payload_returns_valid_values():
    payload = {{
        "source": "{module_name}",
        "records": [
            {{"is_valid": True, "value": "{file_name}-A"}},
            {{"is_valid": False, "value": "{file_name}-B"}},
            {{"is_valid": True, "value": "{file_name}-C"}},
        ],
    }}
    assert analyze_{safe_identifier}_payload(payload) == {{"file": "{file_name}", "result": ["{file_name}-A", "{file_name}-C"]}}'''
        before = 14
        after = 6
    else:
        original_code = f'''// File: {file_name}
export function process{safe_identifier.title()}Data(input: any) {{
  if (input) {{
    if (input.module === "{module_name}") {{
      if (Array.isArray(input.entries)) {{
        return input.entries
          .filter((entry: any) => entry.enabled)
          .map((entry: any) => `${{entry.value}}::{file_name}`);
      }}
    }}
  }}
  return [];
}}'''
        refactored_code = f'''// Refactor target: {file_name}
const mapEnabled{safe_identifier.title()}Entries = (entries: any[] = []) =>
  entries
    .filter((entry) => entry.enabled)
    .map((entry) => `${{entry.value}}::{file_name}`);

export function process{safe_identifier.title()}Data(input: any) {{
  if (!input || input.module !== "{module_name}" || !Array.isArray(input.entries)) {{
    return [];
  }}

  return mapEnabled{safe_identifier.title()}Entries(input.entries);
}}'''
        changes = [
            RefactorChange(
                type=RefactorChangeType.SIMPLIFY_LOGIC,
                description=f"Replaced nested branching in {file_name} with module-specific guard clauses",
                files_created=[]
            ),
            RefactorChange(
                type=RefactorChangeType.EXTRACT_COMPONENT,
                description=f"Extracted {module_name}-specific enabled-entry mapping helper for {file_name}",
                files_created=[]
            ),
        ]
        migration_steps = [
            f"1. Add a top-level guard clause for invalid {file_name} input shapes",
            f"2. Extract enabled-entry mapping logic into a helper named for {module_name}",
            f"3. Re-run tests for {file_name} with both matching and non-matching module values",
            f"4. Verify generated output still tags values with {file_name}",
        ]
        test_code = f'''describe("process{safe_identifier.title()}Data", () => {{
  it("ignores unrelated modules for {file_name}", () => {{
    expect(process{safe_identifier.title()}Data({{ module: "other", entries: [{{ enabled: true, value: 1 }}] }})).toEqual([]);
  }});

  it("maps enabled entries for {file_name}", () => {{
    expect(
      process{safe_identifier.title()}Data({{
        module: "{module_name}",
        entries: [
          {{ enabled: true, value: "A" }},
          {{ enabled: false, value: "B" }},
          {{ enabled: true, value: "C" }},
        ],
      }})
    ).toEqual(["A::{file_name}", "C::{file_name}"]);
  }});
}});'''
        before = 12
        after = 5

    complexity_improvement = ComplexityImprovement(
        before=before,
        after=after,
        reduction_percentage=round(((before - after) / before) * 100, 1)
    )

    return RefactorResult(
        refactor_id=str(uuid.uuid4()),
        file_path=file_path,
        original_code=original_code,
        refactored_code=refactored_code,
        changes=changes,
        complexity_improvement=complexity_improvement,
        migration_steps=migration_steps,
        test_code=test_code,
        status=RefactorStatus.COMPLETE
    )

# Made with Bob
