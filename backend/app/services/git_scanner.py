"""
Git Repository Scanner Service
Scans local Git repositories to extract real metrics and data
"""
import os
import logging
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime
import git
from git.exc import InvalidGitRepositoryError, GitCommandError

logger = logging.getLogger(__name__)


class GitScanner:
    """Scans Git repositories for branch and commit information"""
    
    def __init__(self, repo_path: str):
        """
        Initialize Git scanner
        
        Args:
            repo_path: Path to the Git repository
        """
        self.repo_path = Path(repo_path)
        self.repo: Optional[git.Repo] = None
        
    def validate_repository(self) -> bool:
        """Check if path is a valid Git repository"""
        try:
            self.repo = git.Repo(self.repo_path)
            return True
        except InvalidGitRepositoryError:
            logger.warning(f"Not a valid Git repository: {self.repo_path}")
            return False
        except Exception as e:
            logger.error(f"Error validating repository: {e}")
            return False
    
    def get_repository_name(self) -> str:
        """Get repository name from path or remote"""
        if self.repo and self.repo.remotes:
            try:
                remote_url = self.repo.remotes.origin.url
                # Extract name from URL
                name = remote_url.split('/')[-1].replace('.git', '')
                return name
            except:
                pass
        
        # Fallback to directory name
        return self.repo_path.name
    
    def get_active_branches(self) -> List[Dict]:
        """Get list of active branches with recent activity"""
        if not self.repo:
            return []
        
        branches = []
        try:
            for branch in self.repo.branches:
                try:
                    last_commit = branch.commit
                    branches.append({
                        "name": branch.name,
                        "last_commit": last_commit.committed_datetime,
                        "author": last_commit.author.name,
                        "message": last_commit.message.strip()[:100]
                    })
                except Exception as e:
                    logger.warning(f"Error processing branch {branch.name}: {e}")
                    continue
        except Exception as e:
            logger.error(f"Error getting branches: {e}")
        
        return branches
    
    def get_file_git_info(self, file_path: str) -> Dict:
        """
        Get Git information for a specific file
        
        Args:
            file_path: Relative path to file from repo root
            
        Returns:
            Dict with Git metadata
        """
        if not self.repo:
            return {}
        
        try:
            # Get commits that modified this file
            commits = list(self.repo.iter_commits(paths=file_path, max_count=10))
            
            if not commits:
                return {
                    "last_modified": None,
                    "contributors": [],
                    "commit_count": 0,
                    "active_branches": []
                }
            
            # Get unique contributors
            contributors = list(set([c.author.name for c in commits]))
            
            # Get branches that have this file
            active_branches = []
            for branch in self.repo.branches:
                try:
                    # Check if file exists in branch
                    branch.commit.tree / file_path
                    active_branches.append(branch.name)
                except:
                    continue
            
            return {
                "last_modified": commits[0].committed_datetime,
                "contributors": contributors,
                "contributor_count": len(contributors),
                "commit_count": len(commits),
                "active_branches": active_branches,
                "last_commit_message": commits[0].message.strip()[:100]
            }
            
        except Exception as e:
            logger.error(f"Error getting Git info for {file_path}: {e}")
            return {}
    
    def get_file_changes_by_branch(self, file_path: str) -> List[Dict]:
        """
        Get recent changes to a file grouped by branch
        
        Args:
            file_path: Relative path to file
            
        Returns:
            List of changes per branch
        """
        if not self.repo:
            return []
        
        changes = []
        try:
            for branch in self.repo.branches:
                try:
                    commits = list(self.repo.iter_commits(
                        branch.name,
                        paths=file_path,
                        max_count=5
                    ))
                    
                    if commits:
                        changes.append({
                            "branch": branch.name,
                            "commit_count": len(commits),
                            "last_change": commits[0].committed_datetime,
                            "author": commits[0].author.name
                        })
                except Exception as e:
                    logger.debug(f"Error checking branch {branch.name}: {e}")
                    continue
                    
        except Exception as e:
            logger.error(f"Error getting file changes: {e}")
        
        return changes
    
    def calculate_merge_conflict_risk(self, file_path: str) -> Dict:
        """
        Calculate merge conflict risk for a file
        
        Args:
            file_path: Relative path to file
            
        Returns:
            Risk assessment dict
        """
        changes = self.get_file_changes_by_branch(file_path)
        
        # Count branches with recent changes
        active_branch_count = len(changes)
        
        # Calculate risk score
        if active_branch_count == 0:
            risk_level = "low"
            probability = 0.1
        elif active_branch_count == 1:
            risk_level = "low"
            probability = 0.2
        elif active_branch_count == 2:
            risk_level = "medium"
            probability = 0.5
        else:
            risk_level = "high"
            probability = 0.8
        
        return {
            "active_branches": active_branch_count,
            "risk_level": risk_level,
            "conflict_probability": probability,
            "branch_details": changes
        }
    
    def get_repository_stats(self) -> Dict:
        """Get overall repository statistics"""
        if not self.repo:
            return {}
        
        try:
            # Count total commits
            commit_count = sum(1 for _ in self.repo.iter_commits())
            
            # Get all contributors
            contributors = set()
            for commit in self.repo.iter_commits(max_count=100):
                contributors.add(commit.author.name)
            
            # Get branch count
            branch_count = len(list(self.repo.branches))
            
            return {
                "total_commits": commit_count,
                "total_contributors": len(contributors),
                "total_branches": branch_count,
                "current_branch": self.repo.active_branch.name if self.repo.active_branch else "unknown"
            }
            
        except Exception as e:
            logger.error(f"Error getting repository stats: {e}")
            return {}


# Made with Bob