"""
Simple in-memory database for demo purposes
"""
import logging
from typing import Dict, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

# In-memory storage
_scans: Dict[str, dict] = {}
_refactors: Dict[str, dict] = {}
_current_repository: Optional[dict] = None
_current_analysis: Optional[dict] = None


async def init_db():
    """Initialize database"""
    logger.info("Initializing in-memory database...")
    global _scans, _refactors, _current_repository, _current_analysis
    _scans = {}
    _refactors = {}
    _current_repository = None
    _current_analysis = None
    logger.info("Database initialized successfully")


def store_scan(scan_id: str, scan_data: dict):
    """Store scan data"""
    _scans[scan_id] = {
        **scan_data,
        "created_at": datetime.now().isoformat()
    }


def get_scan(scan_id: str) -> Optional[dict]:
    """Get scan data"""
    return _scans.get(scan_id)


def store_refactor(refactor_id: str, refactor_data: dict):
    """Store refactor data"""
    _refactors[refactor_id] = {
        **refactor_data,
        "created_at": datetime.now().isoformat()
    }


def get_refactor(refactor_id: str) -> Optional[dict]:
    """Get refactor data"""
    return _refactors.get(refactor_id)


def set_current_repository(repo_data: dict):
    """Set current repository"""
    global _current_repository
    _current_repository = repo_data


def get_current_repository() -> Optional[dict]:
    """Get current repository"""
    return _current_repository


def set_current_analysis(analysis_data: dict):
    """Set current analysis"""
    global _current_analysis
    _current_analysis = analysis_data


def get_current_analysis() -> Optional[dict]:
    """Get current analysis"""
    return _current_analysis


def list_refactors() -> list:
    """List all refactors"""
    return [
        {
            "file_path": file_path,
            **data
        }
        for file_path, data in _refactors.items()
    ]


def delete_refactor(refactor_id: str) -> bool:
    """Delete refactor data"""
    if refactor_id in _refactors:
        del _refactors[refactor_id]
        return True
    return False


def clear_all():
    """Clear all data"""
    global _scans, _refactors, _current_repository, _current_analysis
    _scans = {}
    _refactors = {}
    _current_repository = None
    _current_analysis = None

# Made with Bob
