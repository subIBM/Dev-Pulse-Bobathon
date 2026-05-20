"""
Analysis API endpoints
"""
from fastapi import APIRouter, HTTPException
import logging

from app.models.analysis import AnalysisRequest, AnalysisResponse, RiskLevel
from app.services.mock_service import generate_mock_analysis
from app.database import db

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_codebase(request: AnalysisRequest):
    """
    Analyze codebase for technical debt and risks
    """
    try:
        logger.info(f"Analyzing codebase: {request.repository_path}")
        
        # Generate mock analysis
        analysis = generate_mock_analysis()
        
        # Store in database
        db.set_current_analysis(analysis.model_dump())
        
        logger.info(f"Analysis complete: {len(analysis.issues)} issues found")
        
        return analysis
    except Exception as e:
        logger.error(f"Error analyzing codebase: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/current", response_model=AnalysisResponse)
async def get_current_analysis():
    """
    Get current analysis results
    """
    try:
        analysis_data = db.get_current_analysis()
        
        if not analysis_data:
            # Return mock data if no analysis exists
            analysis_data = generate_mock_analysis().model_dump()
            db.set_current_analysis(analysis_data)
        
        return AnalysisResponse(**analysis_data)
    except Exception as e:
        logger.error(f"Error getting current analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/risks", response_model=AnalysisResponse)
async def get_risks():
    """
    Get risk analysis
    """
    return await get_current_analysis()


@router.get("/issues/{file_path:path}")
async def get_file_issues(file_path: str):
    """
    Get issues for a specific file
    """
    try:
        analysis_data = db.get_current_analysis()
        
        if not analysis_data:
            return {"issues": []}
        
        # Filter issues for the specific file
        file_issues = [
            issue for issue in analysis_data.get("issues", [])
            if issue.get("file_path") == file_path
        ]
        
        return {"issues": file_issues}
    except Exception as e:
        logger.error(f"Error getting file issues: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/summary")
async def get_analysis_summary():
    """
    Get analysis summary statistics
    """
    try:
        analysis_data = db.get_current_analysis()
        
        if not analysis_data:
            return {
                "total_issues": 0,
                "critical": 0,
                "high": 0,
                "medium": 0,
                "low": 0,
                "sprint_survival_probability": 100
            }
        
        issues = analysis_data.get("issues", [])
        
        # Count issues by severity
        severity_counts = {
            "critical": 0,
            "high": 0,
            "medium": 0,
            "low": 0
        }
        
        for issue in issues:
            severity = issue.get("severity", "low").lower()
            if severity in severity_counts:
                severity_counts[severity] += 1
        
        return {
            "total_issues": len(issues),
            **severity_counts,
            "sprint_survival_probability": analysis_data.get("sprint_survival_probability", 100)
        }
    except Exception as e:
        logger.error(f"Error getting analysis summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Made with Bob
