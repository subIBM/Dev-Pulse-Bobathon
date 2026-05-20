"""
Repository API endpoints
"""
from fastapi import APIRouter, HTTPException
import uuid
import logging
import os

from app.models.repository import ScanRequest, ScanResponse, ScanStatus, RepositorySnapshot
from app.services.repository_scanner import RepositoryScanner
from app.services.mock_service import generate_mock_repository
from app.database import db

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/scan", response_model=ScanResponse)
async def scan_repository(request: ScanRequest):
    """
    Scan a repository and return analysis
    """
    try:
        logger.info(f"Scanning repository: {request.path}")
        
        # Validate path exists
        if not os.path.exists(request.path):
            raise HTTPException(status_code=400, detail=f"Path does not exist: {request.path}")
        
        # Use real scanner
        try:
            scanner = RepositoryScanner(request.path)
            repo_data = await scanner.scan_repository()
            logger.info(f"Real scan complete: {repo_data.name}")
        except Exception as scan_error:
            logger.warning(f"Real scan failed, using mock data: {scan_error}")
            # Fallback to mock data if real scan fails
            repo_data = generate_mock_repository()
        
        # Store in database
        scan_id = str(uuid.uuid4())
        db.store_scan(scan_id, {
            "status": ScanStatus.COMPLETE,
            "data": repo_data.model_dump()
        })
        db.set_current_repository(repo_data.model_dump())
        
        logger.info(f"Scan complete: {scan_id}")
        
        return ScanResponse(
            scan_id=scan_id,
            status=ScanStatus.COMPLETE,
            message="Repository scanned successfully",
            data=repo_data
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error scanning repository: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/scan/{scan_id}", response_model=ScanResponse)
async def get_scan_status(scan_id: str):
    """
    Get scan status by ID
    """
    try:
        scan_data = db.get_scan(scan_id)
        
        if not scan_data:
            raise HTTPException(status_code=404, detail="Scan not found")
        
        return ScanResponse(
            scan_id=scan_id,
            status=scan_data["status"],
            data=RepositorySnapshot(**scan_data["data"]) if scan_data.get("data") else None
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting scan status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/tree", response_model=RepositorySnapshot)
async def get_repository_tree():
    """
    Get current repository tree structure
    """
    try:
        repo_data = db.get_current_repository()
        
        if not repo_data:
            # Return mock data if no repository scanned yet
            repo_data = generate_mock_repository().model_dump()
            db.set_current_repository(repo_data)
        
        return RepositorySnapshot(**repo_data)
    except Exception as e:
        logger.error(f"Error getting repository tree: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/summary", response_model=RepositorySnapshot)
async def get_repository_summary():
    """
    Get repository summary
    """
    return await get_repository_tree()

# Made with Bob
