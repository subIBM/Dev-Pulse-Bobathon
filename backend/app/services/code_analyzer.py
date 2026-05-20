"""
Code Complexity Analyzer Service
Analyzes code files for complexity metrics using AST parsing
"""
import os
import logging
from pathlib import Path
from typing import Dict, List, Optional
import ast
from radon.complexity import cc_visit
from radon.metrics import mi_visit, h_visit
from radon.raw import analyze

logger = logging.getLogger(__name__)


class CodeAnalyzer:
    """Analyzes code files for complexity and quality metrics"""
    
    SUPPORTED_EXTENSIONS = {
        '.py': 'python',
        '.js': 'javascript',
        '.ts': 'typescript',
        '.tsx': 'typescript',
        '.jsx': 'javascript',
        '.java': 'java',
        '.cpp': 'cpp',
        '.c': 'c',
        '.go': 'go',
        '.rs': 'rust',
        '.rb': 'ruby',
        '.php': 'php'
    }
    
    def __init__(self, file_path: str):
        """
        Initialize code analyzer
        
        Args:
            file_path: Path to the code file
        """
        self.file_path = Path(file_path)
        self.language = self._detect_language()
        self.content: Optional[str] = None
        
    def _detect_language(self) -> str:
        """Detect programming language from file extension"""
        ext = self.file_path.suffix.lower()
        return self.SUPPORTED_EXTENSIONS.get(ext, 'unknown')
    
    def read_file(self) -> bool:
        """Read file content"""
        try:
            with open(self.file_path, 'r', encoding='utf-8', errors='ignore') as f:
                self.content = f.read()
            return True
        except Exception as e:
            logger.error(f"Error reading file {self.file_path}: {e}")
            return False
    
    def calculate_complexity(self) -> Dict:
        """
        Calculate cyclomatic complexity
        
        Returns:
            Dict with complexity metrics
        """
        if not self.content:
            return {"error": "No content loaded"}
        
        # For Python files, use radon
        if self.language == 'python':
            return self._analyze_python_complexity()
        
        # For other languages, use basic heuristics
        return self._analyze_generic_complexity()
    
    def _analyze_python_complexity(self) -> Dict:
        """Analyze Python code complexity using radon"""
        try:
            # Cyclomatic complexity
            cc_results = cc_visit(self.content)
            
            # Calculate average and max complexity
            if cc_results:
                complexities = [block.complexity for block in cc_results]
                avg_complexity = sum(complexities) / len(complexities)
                max_complexity = max(complexities)
                
                # Get high complexity functions
                high_complexity_blocks = [
                    {
                        "name": block.name,
                        "complexity": block.complexity,
                        "line": block.lineno,
                        "type": block.classname or "function"
                    }
                    for block in cc_results
                    if block.complexity > 10
                ]
            else:
                avg_complexity = 1
                max_complexity = 1
                high_complexity_blocks = []
            
            # Maintainability Index
            try:
                mi_score = mi_visit(self.content, multi=True)
                maintainability = mi_score if isinstance(mi_score, (int, float)) else 100
            except:
                maintainability = 100
            
            # Halstead metrics
            try:
                halstead = h_visit(self.content)
                halstead_metrics = {
                    "volume": halstead.total.volume if halstead else 0,
                    "difficulty": halstead.total.difficulty if halstead else 0,
                    "effort": halstead.total.effort if halstead else 0
                }
            except:
                halstead_metrics = {"volume": 0, "difficulty": 0, "effort": 0}
            
            return {
                "average_complexity": round(avg_complexity, 2),
                "max_complexity": max_complexity,
                "maintainability_index": round(maintainability, 2),
                "high_complexity_blocks": high_complexity_blocks,
                "halstead": halstead_metrics,
                "total_blocks": len(cc_results) if cc_results else 0
            }
            
        except Exception as e:
            logger.error(f"Error analyzing Python complexity: {e}")
            return self._analyze_generic_complexity()
    
    def _analyze_generic_complexity(self) -> Dict:
        """Analyze code complexity using generic heuristics"""
        if not self.content:
            return {}
        
        lines = self.content.split('\n')
        
        # Count control flow statements
        control_keywords = ['if', 'else', 'elif', 'for', 'while', 'switch', 'case', 'catch', 'try']
        control_count = sum(
            1 for line in lines
            for keyword in control_keywords
            if keyword in line.lower()
        )
        
        # Estimate complexity based on control flow
        estimated_complexity = max(1, control_count // 3)
        
        # Count nesting levels
        max_nesting = 0
        current_nesting = 0
        for line in lines:
            stripped = line.lstrip()
            if stripped:
                indent = len(line) - len(stripped)
                current_nesting = indent // 4  # Assuming 4-space indents
                max_nesting = max(max_nesting, current_nesting)
        
        return {
            "average_complexity": estimated_complexity,
            "max_complexity": estimated_complexity,
            "maintainability_index": max(0, 100 - (estimated_complexity * 5)),
            "max_nesting_level": max_nesting,
            "control_flow_count": control_count,
            "estimated": True
        }
    
    def analyze_raw_metrics(self) -> Dict:
        """
        Analyze raw code metrics (LOC, comments, etc.)
        
        Returns:
            Dict with raw metrics
        """
        if not self.content:
            return {}
        
        # For Python, use radon
        if self.language == 'python':
            try:
                raw = analyze(self.content)
                return {
                    "loc": raw.loc,
                    "lloc": raw.lloc,
                    "sloc": raw.sloc,
                    "comments": raw.comments,
                    "multi": raw.multi,
                    "blank": raw.blank,
                    "single_comments": raw.single_comments
                }
            except Exception as e:
                logger.error(f"Error analyzing raw metrics: {e}")
        
        # Generic analysis
        lines = self.content.split('\n')
        loc = len(lines)
        blank = sum(1 for line in lines if not line.strip())
        
        # Estimate comments (basic heuristic)
        comment_chars = ['#', '//', '/*', '*', '--']
        comments = sum(
            1 for line in lines
            if any(line.strip().startswith(c) for c in comment_chars)
        )
        
        return {
            "loc": loc,
            "sloc": loc - blank,
            "blank": blank,
            "comments": comments,
            "estimated": True
        }
    
    def detect_code_smells(self) -> List[Dict]:
        """
        Detect common code smells
        
        Returns:
            List of detected code smells
        """
        if not self.content:
            return []
        
        smells = []
        lines = self.content.split('\n')
        
        # Long method detection
        if len(lines) > 100:
            smells.append({
                "type": "long_file",
                "severity": "medium",
                "line": 1,
                "message": f"File is very long ({len(lines)} lines). Consider splitting.",
                "suggestion": "Break down into smaller, focused modules"
            })
        
        # Deep nesting detection
        for i, line in enumerate(lines, 1):
            stripped = line.lstrip()
            if stripped:
                indent = len(line) - len(stripped)
                nesting_level = indent // 4
                
                if nesting_level > 4:
                    smells.append({
                        "type": "deep_nesting",
                        "severity": "high",
                        "line": i,
                        "message": f"Deep nesting detected (level {nesting_level})",
                        "suggestion": "Extract nested logic into separate functions"
                    })
        
        # Long line detection
        for i, line in enumerate(lines, 1):
            if len(line) > 120:
                smells.append({
                    "type": "long_line",
                    "severity": "low",
                    "line": i,
                    "message": f"Line too long ({len(line)} characters)",
                    "suggestion": "Break line into multiple lines"
                })
        
        # TODO/FIXME detection
        for i, line in enumerate(lines, 1):
            if 'TODO' in line or 'FIXME' in line:
                smells.append({
                    "type": "technical_debt",
                    "severity": "low",
                    "line": i,
                    "message": "Technical debt marker found",
                    "suggestion": "Address or document the TODO/FIXME"
                })
        
        return smells[:20]  # Limit to 20 smells
    
    def get_full_analysis(self) -> Dict:
        """
        Get complete code analysis
        
        Returns:
            Dict with all analysis results
        """
        if not self.read_file():
            return {"error": "Could not read file"}
        
        return {
            "file_path": str(self.file_path),
            "language": self.language,
            "complexity": self.calculate_complexity(),
            "raw_metrics": self.analyze_raw_metrics(),
            "code_smells": self.detect_code_smells()
        }


# Made with Bob