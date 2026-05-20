"""
Refactor data models
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

from app.models.analysis import CodeIssue


class RefactorChangeType(str, Enum):
    """Types of refactoring changes"""
    EXTRACT_COMPONENT = "extract_component"
    REMOVE_DEPENDENCY = "remove_dependency"
    SIMPLIFY_LOGIC = "simplify_logic"


class RefactorChange(BaseModel):
    """A single refactoring change"""
    type: RefactorChangeType
    description: str
    files_created: List[str] = Field(default_factory=list)


class ComplexityImprovement(BaseModel):
    """Complexity improvement metrics"""
    before: int = Field(ge=0)
    after: int = Field(ge=0)
    reduction_percentage: float = Field(ge=0, le=100)


class RefactorStatus(str, Enum):
    """Refactor operation status"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETE = "complete"
    APPLIED = "applied"
    REJECTED = "rejected"
    FAILED = "failed"


class RefactorResult(BaseModel):
    """Result of refactoring operation"""
    refactor_id: str
    file_path: str
    original_code: str
    refactored_code: str
    changes: List[RefactorChange]
    complexity_improvement: ComplexityImprovement
    migration_steps: List[str]
    test_code: Optional[str] = None
    status: RefactorStatus


class RefactorRequest(BaseModel):
    """Request to generate refactor"""
    file_path: str = Field(..., min_length=1)
    issues: List[CodeIssue]


class RefactorResponse(BaseModel):
    """Response from refactor generation"""
    refactor_id: str
    status: RefactorStatus
    message: Optional[str] = None


class ApplyRefactorRequest(BaseModel):
    """Request to apply refactor"""
    refactor_id: str = Field(..., min_length=1)


class ApplyRefactorResponse(BaseModel):
    """Response from applying refactor"""
    success: bool
    files_modified: List[str] = Field(default_factory=list)
    message: Optional[str] = None

# Made with Bob
