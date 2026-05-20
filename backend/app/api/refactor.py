"""
Refactor API endpoints
"""
from fastapi import APIRouter, HTTPException
import logging

from app.models.refactor import RefactorRequest, RefactorResponse, RefactorStatus
from app.services.mock_service import generate_mock_refactor
from app.database import db

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/generate", response_model=RefactorResponse)
async def generate_refactor(request: RefactorRequest):
    """
    Generate refactor suggestions for a file
    """
    try:
        logger.info(f"Generating refactor for: {request.file_path}")
        
        # Generate mock refactor
        refactor = generate_mock_refactor(request.file_path)
        
        # Store in database
        db.store_refactor(request.file_path, refactor.model_dump())
        
        logger.info(f"Refactor generated for: {request.file_path}")
        
        return refactor
    except Exception as e:
        logger.error(f"Error generating refactor: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{file_path:path}", response_model=RefactorResponse)
async def get_refactor(file_path: str):
    """
    Get refactor suggestions for a file
    """
    try:
        refactor_data = db.get_refactor(file_path)
        
        if not refactor_data:
            # Generate mock refactor if not found
            refactor_data = generate_mock_refactor(file_path).model_dump()
            db.store_refactor(file_path, refactor_data)
        
        return RefactorResponse(**refactor_data)
    except Exception as e:
        logger.error(f"Error getting refactor: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/apply/{file_path:path}")
async def apply_refactor(file_path: str):
    """
    Apply refactor suggestions to a file
    """
    try:
        refactor_data = db.get_refactor(file_path)
        
        if not refactor_data:
            raise HTTPException(status_code=404, detail="Refactor not found")
        
        # In a real implementation, this would apply the changes to the file
        # For demo purposes, we just mark it as applied
        refactor_data["status"] = RefactorStatus.APPLIED
        db.store_refactor(file_path, refactor_data)
        
        logger.info(f"Refactor applied for: {file_path}")
        
        return {
            "success": True,
            "message": f"Refactor applied to {file_path}",
            "file_path": file_path
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error applying refactor: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/list/all")
async def list_refactors():
    """
    List all available refactors
    """
    try:
        refactors = db.list_refactors()
        return {"refactors": refactors}
    except Exception as e:
        logger.error(f"Error listing refactors: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{file_path:path}")
async def delete_refactor(file_path: str):
    """
    Delete refactor suggestions for a file
    """
    try:
        success = db.delete_refactor(file_path)
        
        if not success:
            raise HTTPException(status_code=404, detail="Refactor not found")
        
        return {
            "success": True,
            "message": f"Refactor deleted for {file_path}"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting refactor: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Made with Bob
