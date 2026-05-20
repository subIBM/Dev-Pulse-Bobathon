"""
Analysis data models
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


class IssueSeverity(str, Enum):
    """Issue severity levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class IssueType(str, Enum):
    """Types of code issues"""
    CIRCULAR_DEPENDENCY = "circular_dependency"
    HIGH_COMPLEXITY = "high_complexity"
    CODE_SMELL = "code_smell"
    SECURITY = "security"


class CodeIssue(BaseModel):
    """A code quality issue"""
    type: IssueType
    severity: IssueSeverity
    description: str
    line: Optional[int] = None
    suggestion: Optional[str] = None


class AuditResult(BaseModel):
    """Result of code audit"""
    file: str
    issues: List[CodeIssue]
    overall_score: float = Field(ge=0, le=10)
    complexity_score: Optional[int] = None


class RiskLevel(str, Enum):
    """Risk level classification"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class RiskScore(BaseModel):
    """Risk assessment for a file"""
    file: str
    risk_score: float = Field(ge=0, le=1)
    risk_level: RiskLevel
    merge_conflict_probability: float = Field(ge=0, le=1)
    sprint_impact: str
    reasons: List[str]
    predicted_conflict_date: Optional[str] = None


class SprintSurvival(BaseModel):
    """Sprint survival probability"""
    probability: float = Field(ge=0, le=1)
    high_risk_files: List[str]
    total_risks: int = Field(ge=0)
    recommendation: str


class AnalyzeFileRequest(BaseModel):
    """Request to analyze a file"""
    file_path: str = Field(..., min_length=1)


class AnalyzeFileResponse(BaseModel):
    """Response from file analysis"""
    audit_result: AuditResult
    risk_score: RiskScore

class AnalysisRequest(BaseModel):
    """Request to analyze a codebase"""
    repository_path: str = Field(..., min_length=1)
    branch: Optional[str] = "main"


class AnalysisResponse(BaseModel):
    """Response from codebase analysis"""
    issues: List[CodeIssue]
    audit_results: List[AuditResult]
    risk_scores: List[RiskScore]
    sprint_survival: SprintSurvival
    sprint_survival_probability: float = Field(ge=0, le=100)
    total_files_analyzed: int = Field(ge=0)

# Made with Bob
