"""
Repository Scanner Service
Combines Git scanning and code analysis to provide comprehensive repository insights
"""
import os
import logging
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime
import asyncio

from app.services.git_scanner import GitScanner
from app.services.code_analyzer import CodeAnalyzer
from app.models.repository import FileInfo, BranchInfo, RepositorySnapshot

logger = logging.getLogger(__name__)


class RepositoryScanner:
    """Scans repositories and analyzes code"""
    
    # File extensions to analyze
    CODE_EXTENSIONS = {
        '.py', '.js', '.ts', '.tsx', '.jsx', '.java', '.cpp', '.c', 
        '.go', '.rs', '.rb', '.php', '.cs', '.swift', '.kt', '.scala'
    }
    
    # Directories to skip
    SKIP_DIRS = {
        'node_modules', 'venv', '.venv', 'env', '.env', 'dist', 'build',
        '__pycache__', '.git', '.idea', '.vscode', 'target', 'bin', 'obj'
    }
    
    def __init__(self, repo_path: str):
        """
        Initialize repository scanner
        
        Args:
            repo_path: Path to the repository
        """
        self.repo_path = Path(repo_path)
        self.git_scanner = GitScanner(repo_path)
        self.is_git_repo = False
        
    async def scan_repository(self) -> RepositorySnapshot:
        """
        Perform complete repository scan
        
        Returns:
            RepositorySnapshot with all analysis data
        """
        logger.info(f"Starting repository scan: {self.repo_path}")
        
        # Validate repository exists
        if not self.repo_path.exists():
            raise ValueError(f"Repository path does not exist: {self.repo_path}")
        
        # Check if it's a Git repository
        self.is_git_repo = self.git_scanner.validate_repository()
        
        # Get repository name
        repo_name = self.git_scanner.get_repository_name() if self.is_git_repo else self.repo_path.name
        
        # Scan files
        files = await self._scan_files()
        
        # Get Git branches if available
        branches = []
        if self.is_git_repo:
            branch_data = self.git_scanner.get_active_branches()
            branches = [
                BranchInfo(
                    name=b["name"],
                    files_touched=0,  # Will be calculated
                    last_commit=b["last_commit"]
                )
                for b in branch_data[:10]  # Limit to 10 branches
            ]
        
        # Calculate totals
        total_files = len(files)
        total_loc = sum(f.loc for f in files)
        
        logger.info(f"Scan complete: {total_files} files, {total_loc} LOC")
        
        return RepositorySnapshot(
            name=repo_name,
            path=str(self.repo_path),
            total_files=total_files,
            total_loc=total_loc,
            files=files,
            branches=branches,
            scan_date=datetime.now()
        )
    
    async def _scan_files(self) -> List[FileInfo]:
        """
        Scan all code files in repository
        
        Returns:
            List of FileInfo objects
        """
        files = []
        
        # Walk through directory
        for root, dirs, filenames in os.walk(self.repo_path):
            # Skip excluded directories
            dirs[:] = [d for d in dirs if d not in self.SKIP_DIRS]
            
            for filename in filenames:
                file_path = Path(root) / filename
                
                # Check if it's a code file
                if file_path.suffix.lower() not in self.CODE_EXTENSIONS:
                    continue
                
                # Analyze file
                try:
                    file_info = await self._analyze_file(file_path)
                    if file_info:
                        files.append(file_info)
                except Exception as e:
                    logger.warning(f"Error analyzing {file_path}: {e}")
                    continue
        
        return files
    
    async def _analyze_file(self, file_path: Path) -> Optional[FileInfo]:
        """
        Analyze a single file
        
        Args:
            file_path: Path to the file
            
        Returns:
            FileInfo object or None if analysis fails
        """
        try:
            # Get relative path from repo root
            rel_path = file_path.relative_to(self.repo_path)
            
            # Analyze code
            analyzer = CodeAnalyzer(str(file_path))
            analysis = analyzer.get_full_analysis()
            
            if "error" in analysis:
                return None
            
            # Get complexity metrics
            complexity_data = analysis.get("complexity", {})
            raw_metrics = analysis.get("raw_metrics", {})
            
            # Calculate complexity score
            avg_complexity = complexity_data.get("average_complexity", 1)
            max_complexity = complexity_data.get("max_complexity", 1)
            complexity_score = max(avg_complexity, max_complexity)
            
            # Get LOC
            loc = raw_metrics.get("loc", 0)
            
            # Get Git info if available
            git_info = {}
            active_branches = []
            contributors = 0
            last_modified = datetime.now()
            
            if self.is_git_repo:
                git_info = self.git_scanner.get_file_git_info(str(rel_path))
                active_branches = git_info.get("active_branches", [])
                contributors = git_info.get("contributor_count", 0)
                last_modified = git_info.get("last_modified", datetime.now())
            
            # Calculate risk score
            risk_score = self._calculate_risk_score(
                complexity_score,
                len(active_branches),
                contributors,
                loc
            )
            
            # Determine risk level
            if risk_score > 0.7:
                risk_level = "high"
            elif risk_score > 0.4:
                risk_level = "medium"
            else:
                risk_level = "low"
            
            return FileInfo(
                path=str(rel_path),
                loc=loc,
                complexity=int(complexity_score),
                last_modified=last_modified,
                active_branches=active_branches[:5],  # Limit to 5
                contributors=contributors,
                risk_score=round(risk_score, 2),
                risk_level=risk_level
            )
            
        except Exception as e:
            logger.error(f"Error analyzing file {file_path}: {e}")
            return None
    
    def _calculate_risk_score(
        self,
        complexity: float,
        active_branches: int,
        contributors: int,
        loc: int
    ) -> float:
        """
        Calculate risk score for a file
        
        Args:
            complexity: Cyclomatic complexity
            active_branches: Number of active branches touching the file
            contributors: Number of contributors
            loc: Lines of code
            
        Returns:
            Risk score between 0 and 1
        """
        # Normalize factors
        complexity_factor = min(complexity / 20, 1.0)  # Max at 20
        branch_factor = min(active_branches / 5, 1.0)  # Max at 5 branches
        contributor_factor = min(contributors / 5, 0.5)  # Max 0.5 at 5 contributors
        size_factor = min(loc / 500, 0.3)  # Max 0.3 at 500 LOC
        
        # Weighted combination
        risk_score = (
            complexity_factor * 0.4 +
            branch_factor * 0.3 +
            contributor_factor * 0.2 +
            size_factor * 0.1
        )
        
        return min(risk_score, 1.0)
    
    async def analyze_specific_file(self, file_path: str) -> Dict:
        """
        Analyze a specific file in detail
        
        Args:
            file_path: Relative path to file from repo root
            
        Returns:
            Detailed analysis dict
        """
        full_path = self.repo_path / file_path
        
        if not full_path.exists():
            raise ValueError(f"File not found: {file_path}")
        
        # Code analysis
        analyzer = CodeAnalyzer(str(full_path))
        analysis = analyzer.get_full_analysis()
        
        # Git analysis
        git_info = {}
        conflict_risk = {}
        
        if self.is_git_repo:
            git_info = self.git_scanner.get_file_git_info(file_path)
            conflict_risk = self.git_scanner.calculate_merge_conflict_risk(file_path)
        
        return {
            "file_path": file_path,
            "code_analysis": analysis,
            "git_info": git_info,
            "conflict_risk": conflict_risk
        }


# Made with Bob