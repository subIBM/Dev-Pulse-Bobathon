"""
Repository data models
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum


class FileInfo(BaseModel):
    """Information about a single file"""
    path: str
    loc: int = Field(ge=0, description="Lines of code")
    complexity: Optional[int] = Field(None, ge=0)
    last_modified: Optional[datetime] = None
    active_branches: List[str] = Field(default_factory=list)
    contributors: int = Field(default=0, ge=0)
    risk_score: Optional[float] = Field(None, ge=0, le=1)
    risk_level: Optional[str] = None


class BranchInfo(BaseModel):
    """Information about a Git branch"""
    name: str
    files_touched: int = Field(ge=0)
    last_commit: datetime


class RepositorySnapshot(BaseModel):
    """Complete repository analysis snapshot"""
    name: str
    path: str
    total_files: int = Field(ge=0)
    total_loc: int = Field(ge=0)
    files: List[FileInfo]
    branches: List[BranchInfo] = Field(default_factory=list)
    scan_date: datetime = Field(default_factory=datetime.now)


class ScanStatus(str, Enum):
    """Scan status enumeration"""
    PROCESSING = "processing"
    COMPLETE = "complete"
    FAILED = "failed"


class ScanRequest(BaseModel):
    """Request to scan a repository"""
    path: str = Field(..., min_length=1)


class ScanResponse(BaseModel):
    """Response from scan request"""
    scan_id: str
    status: ScanStatus
    message: Optional[str] = None
    data: Optional[RepositorySnapshot] = None

# Made with Bob
