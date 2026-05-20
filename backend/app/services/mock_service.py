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
    """Generate mock refactor result"""
    
    original_code = """import React from 'react';
import { AuthContext } from '../services/AuthService';

export const UserProfile = () => {
  const handleUserUpdate = (data: any) => {
    if (data.type === 'email') {
      if (data.verified) {
        if (data.primary) {
          return true;
        }
      }
    }
    return false;
  };
  
  return <div>Profile</div>;
};"""
    
    refactored_code = """import React from 'react';
import { UserProfileProps } from '../types/user';
import { useUserUpdate } from '../hooks/useUserUpdate';

export const UserProfile = ({ userId }: UserProfileProps) => {
  const { handleUpdate } = useUserUpdate();
  
  return (
    <div>
      <h2>User Profile</h2>
      {/* Clean component structure */}
    </div>
  );
};"""
    
    changes = [
        RefactorChange(
            type=RefactorChangeType.EXTRACT_COMPONENT,
            description="Extracted user update logic to custom hook",
            files_created=["src/hooks/useUserUpdate.ts"]
        ),
        RefactorChange(
            type=RefactorChangeType.REMOVE_DEPENDENCY,
            description="Removed circular dependency by extracting shared types",
            files_created=["src/types/user.ts"]
        ),
        RefactorChange(
            type=RefactorChangeType.SIMPLIFY_LOGIC,
            description="Simplified conditional logic and reduced nesting",
            files_created=[]
        ),
    ]
    
    complexity_improvement = ComplexityImprovement(
        before=18,
        after=8,
        reduction_percentage=55.6
    )
    
    migration_steps = [
        "1. Create src/types/user.ts with UserProfileProps interface",
        "2. Create src/hooks/useUserUpdate.ts with extracted logic",
        "3. Update UserProfile.tsx imports and implementation",
        "4. Run tests to verify functionality",
        "5. Remove old AuthContext import"
    ]
    
    test_code = """import { render, screen } from '@testing-library/react';
import { UserProfile } from './UserProfile';

describe('UserProfile', () => {
  it('renders user profile', () => {
    render(<UserProfile userId="123" />);
    expect(screen.getByText('User Profile')).toBeInTheDocument();
  });
});"""
    
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
