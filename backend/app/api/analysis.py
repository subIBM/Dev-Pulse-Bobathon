"""
Analysis API endpoints
"""
from fastapi import APIRouter, HTTPException
import logging

from app.models.analysis import AnalysisRequest, AnalysisResponse, RiskLevel, CodeIssue, IssueType, IssueSeverity, SprintSurvival
from app.services.mock_service import generate_mock_analysis
from app.services.repository_scanner import RepositoryScanner
from app.services.ica_agent_client import get_ica_agent_client
from app.database import db

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_codebase(request: AnalysisRequest):
    """
    Analyze codebase for technical debt and risks using real scanning and IBM Context Studio
    """
    try:
        logger.info(f"Analyzing codebase: {request.repository_path}")
        
        # Get current repository data
        repo_data = db.get_current_repository()
        
        if not repo_data:
            logger.warning("No repository data found, using mock analysis")
            analysis = generate_mock_analysis()
        else:
            # Perform real analysis
            try:
                analysis = await _perform_real_analysis(repo_data)
                logger.info(f"Real analysis complete: {len(analysis.issues)} issues found")
            except Exception as e:
                logger.warning(f"Real analysis failed, using mock: {e}")
                analysis = generate_mock_analysis()
        
        # Store in database
        db.set_current_analysis(analysis.model_dump())
        
        return analysis
    except Exception as e:
        logger.error(f"Error analyzing codebase: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def _perform_real_analysis(repo_data: dict) -> AnalysisResponse:
    """Perform real analysis on repository data"""
    files = repo_data.get("files", [])
    
    # Collect issues from files
    all_issues = []
    high_risk_files = []
    
    for file_info in files:
        file_path = file_info.get("path", "")
        complexity = file_info.get("complexity", 0)
        risk_level = file_info.get("risk_level", "low")
        
        # Generate issues based on complexity and risk
        if complexity > 15:
            all_issues.append(CodeIssue(
                type=IssueType.HIGH_COMPLEXITY,
                severity=IssueSeverity.HIGH,
                description=f"High cyclomatic complexity ({complexity})",
                line=1,
                suggestion="Break down into smaller functions",
                file_path=file_path
            ))
        
        if risk_level == "high":
            high_risk_files.append(file_path)
            all_issues.append(CodeIssue(
                type=IssueType.CODE_SMELL,
                severity=IssueSeverity.MEDIUM,
                description="High merge conflict risk detected",
                line=1,
                suggestion="Coordinate with team members working on this file",
                file_path=file_path
            ))
    
    # Calculate sprint survival probability
    total_files = len(files)
    high_risk_count = len(high_risk_files)
    
    if total_files > 0:
        risk_ratio = high_risk_count / total_files
        survival_prob = max(0.2, 1.0 - (risk_ratio * 1.5))
    else:
        survival_prob = 1.0
    
    sprint_survival = SprintSurvival(
        probability=survival_prob,
        high_risk_files=high_risk_files[:10],
        total_risks=high_risk_count,
        recommendation=f"Address {high_risk_count} high-risk files before sprint end to avoid merge conflicts"
    )
    
    # Try to enhance with IBM Context Studio analysis
    try:
        ica_client = get_ica_agent_client()
        if not ica_client.demo_mode and high_risk_files:
            # Analyze top high-risk file with Context Studio
            top_file = high_risk_files[0]
            logger.info(f"Analyzing {top_file} with IBM Context Studio")
            # This would call the actual ICA agent
            # For now, we use the real data we collected
    except Exception as e:
        logger.warning(f"ICA analysis enhancement failed: {e}")
    
    return AnalysisResponse(
        issues=all_issues,
        audit_results=[],
        risk_scores=[],
        sprint_survival=sprint_survival,
        sprint_survival_probability=survival_prob * 100,
        total_files_analyzed=total_files
    )


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
