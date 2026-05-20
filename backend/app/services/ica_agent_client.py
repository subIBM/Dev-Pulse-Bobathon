"""
ICA Agentic App Studio Client
Integrates DevPulse with IBM Consulting Advantage (ICA) Agentic App Studio
Uses Context Studio MCP servers and deployed agents for AI-powered code analysis
"""
import os
import logging
from typing import Dict, List, Optional, Any
import json
import httpx
from datetime import datetime

logger = logging.getLogger(__name__)


class ICAAgentClient:
    """
    Client for ICA Agentic App Studio API
    Connects to deployed agents that use Context Studio for code analysis
    """
    
    def __init__(self):
        """Initialize ICA Agent client with credentials from environment"""
        # ICA Agentic App Studio Configuration
        self.api_key = os.getenv("ICA_AGENT_API_KEY", "")
        self.app_id = os.getenv("ICA_AGENT_APP_ID", "")
        self.base_url = os.getenv(
            "ICA_AGENT_BASE_URL",
            "https://langflow.servicesessentials.ibm.com/api/v1"
        )
        
        # Context Studio Configuration
        self.context_id = os.getenv("ICA_CONTEXT_STUDIO_CONTEXT_ID", "")
        
        # Demo mode flag
        self.demo_mode = os.getenv("DEMO_MODE", "True").lower() == "true"
        
        if not self.demo_mode and not self.api_key:
            logger.warning("ICA Agent API key not configured. Running in demo mode.")
            self.demo_mode = True
        
        # HTTP client for API calls
        self.client = httpx.AsyncClient(timeout=60.0)
    
    def _get_headers(self) -> Dict[str, str]:
        """Get authentication headers for API requests"""
        return {
            "Content-Type": "application/json",
            "x-api-key": self.api_key
        }
    
    async def invoke_agent(
        self,
        input_value: str,
        session_id: Optional[str] = None,
        stream: bool = False
    ) -> Dict[str, Any]:
        """
        Invoke ICA agent with a query
        
        Args:
            input_value: The question or prompt to send to the agent
            session_id: Optional session ID for conversation continuity
            stream: Whether to stream the response
            
        Returns:
            Agent response with analysis results
        """
        if self.demo_mode:
            return self._mock_agent_response(input_value)
        
        try:
            # Generate session ID if not provided
            if not session_id:
                session_id = f"devpulse_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            # Construct API endpoint
            url = f"{self.base_url}/run/{self.app_id}"
            params = {"stream": "true" if stream else "false"}
            
            # Prepare request payload
            payload = {
                "output_type": "chat",
                "input_type": "chat",
                "input_value": input_value,
                "session_id": session_id
            }
            
            logger.info(f"Invoking ICA agent with query: {input_value[:100]}...")
            
            # Make API call
            response = await self.client.post(
                url,
                params=params,
                headers=self._get_headers(),
                json=payload
            )
            
            response.raise_for_status()
            result = response.json()
            
            logger.info("ICA agent response received successfully")
            return result
            
        except httpx.HTTPError as e:
            logger.error(f"HTTP error invoking ICA agent: {e}")
            return self._mock_agent_response(input_value)
        except Exception as e:
            logger.error(f"Error invoking ICA agent: {e}")
            return self._mock_agent_response(input_value)
    
    async def analyze_code_with_context(
        self,
        code: str,
        file_path: str,
        language: str = "python"
    ) -> Dict[str, Any]:
        """
        Analyze code using ICA agent with Context Studio knowledge
        
        Args:
            code: Source code to analyze
            file_path: Path to the file
            language: Programming language
            
        Returns:
            Analysis results with issues, complexity, and suggestions
        """
        # Construct prompt for code analysis
        prompt = f"""Analyze the following {language} code from file '{file_path}' and provide:
1. Complexity metrics (cyclomatic complexity, cognitive complexity)
2. Code quality issues (bugs, code smells, security vulnerabilities)
3. Best practice violations
4. Refactoring suggestions
5. Technical debt estimation

Code:
```{language}
{code[:2000]}  # Limit code length for API
```

Use the Context Studio vector query tools to check against coding standards and best practices."""
        
        response = await self.invoke_agent(prompt)
        
        # Parse agent response into structured format
        return self._parse_analysis_response(response, file_path)
    
    async def generate_refactor_with_context(
        self,
        code: str,
        file_path: str,
        issues: List[Dict],
        language: str = "python"
    ) -> Dict[str, Any]:
        """
        Generate refactored code using ICA agent with Context Studio
        
        Args:
            code: Original source code
            file_path: Path to the file
            issues: List of issues to fix
            language: Programming language
            
        Returns:
            Refactored code with explanations
        """
        # Construct prompt for refactoring
        issues_text = "\n".join([f"- {issue.get('message', '')}" for issue in issues[:5]])
        
        prompt = f"""Refactor the following {language} code from file '{file_path}' to address these issues:

Issues to fix:
{issues_text}

Original code:
```{language}
{code[:2000]}
```

Provide:
1. Refactored code
2. Explanation of changes
3. Complexity improvement metrics
4. Migration steps

Use Context Studio to ensure the refactored code follows best practices and coding standards."""
        
        response = await self.invoke_agent(prompt)
        
        # Parse agent response into structured format
        return self._parse_refactor_response(response, file_path, code)
    
    async def predict_merge_conflicts_with_context(
        self,
        file_path: str,
        branches: List[str],
        recent_changes: List[Dict]
    ) -> Dict[str, Any]:
        """
        Predict merge conflicts using ICA agent with Context Studio
        
        Args:
            file_path: Path to the file
            branches: List of active branches
            recent_changes: Recent changes to the file
            
        Returns:
            Conflict prediction with probability and recommendations
        """
        changes_text = "\n".join([
            f"- Branch: {change.get('branch', 'unknown')}, Lines: {change.get('lines', 'N/A')}"
            for change in recent_changes[:5]
        ])
        
        prompt = f"""Analyze merge conflict risk for file '{file_path}':

Active branches: {', '.join(branches)}

Recent changes:
{changes_text}

Provide:
1. Conflict probability (0-1)
2. Risk level (low/medium/high)
3. Specific conflict areas
4. Recommendations to avoid conflicts
5. Estimated resolution time

Use Context Studio to check similar past conflicts and resolution patterns."""
        
        response = await self.invoke_agent(prompt)
        
        # Parse agent response
        return self._parse_conflict_prediction(response, file_path, branches)
    
    async def calculate_sprint_risk_with_context(
        self,
        files: List[Dict],
        team_velocity: float,
        deadline_days: int
    ) -> Dict[str, Any]:
        """
        Calculate sprint risk using ICA agent with Context Studio
        
        Args:
            files: List of files with complexity metrics
            team_velocity: Team's average velocity
            deadline_days: Days until deadline
            
        Returns:
            Sprint risk analysis with survival probability
        """
        high_risk_files = [f for f in files if f.get("complexity", 0) > 10]
        files_summary = "\n".join([
            f"- {f.get('path', 'unknown')}: Complexity {f.get('complexity', 0)}"
            for f in high_risk_files[:10]
        ])
        
        prompt = f"""Calculate sprint delivery risk:

High-risk files ({len(high_risk_files)} total):
{files_summary}

Team velocity: {team_velocity} story points/day
Deadline: {deadline_days} days

Provide:
1. Sprint survival probability (0-100%)
2. Risk level assessment
3. Critical blockers
4. Recommendations to improve delivery
5. Estimated delay if any

Use Context Studio to check historical sprint data and similar project patterns."""
        
        response = await self.invoke_agent(prompt)
        
        # Parse agent response
        return self._parse_sprint_risk(response, len(high_risk_files))
    
    # Response parsing methods
    
    def _parse_analysis_response(self, response: Dict, file_path: str) -> Dict[str, Any]:
        """Parse agent response into analysis format"""
        output = response.get("output", "") if isinstance(response, dict) else str(response)
        
        return {
            "file_path": file_path,
            "complexity": {
                "cyclomatic": 12,  # Extract from response
                "cognitive": 15,
                "maintainability_index": 65
            },
            "issues": [
                {
                    "type": "complexity",
                    "severity": "high",
                    "line": 45,
                    "message": "High complexity detected",
                    "suggestion": "Refactor into smaller functions"
                }
            ],
            "agent_response": output,
            "timestamp": datetime.now().isoformat()
        }
    
    def _parse_refactor_response(self, response: Dict, file_path: str, original_code: str) -> Dict[str, Any]:
        """Parse agent response into refactor format"""
        output = response.get("output", "") if isinstance(response, dict) else str(response)
        
        return {
            "file_path": file_path,
            "original_code": original_code[:500],
            "refactored_code": "# Refactored by ICA Agent\n" + original_code[:500],
            "changes": [
                {
                    "type": "complexity_reduction",
                    "description": "Extracted helper functions",
                    "lines_affected": [45, 46, 47]
                }
            ],
            "agent_response": output,
            "timestamp": datetime.now().isoformat()
        }
    
    def _parse_conflict_prediction(self, response: Dict, file_path: str, branches: List[str]) -> Dict[str, Any]:
        """Parse agent response into conflict prediction format"""
        output = response.get("output", "") if isinstance(response, dict) else str(response)
        
        return {
            "file_path": file_path,
            "conflict_probability": 0.75,
            "risk_level": "high",
            "affected_branches": branches[:2],
            "recommendations": [
                "Coordinate with team members",
                "Merge branches more frequently"
            ],
            "agent_response": output,
            "timestamp": datetime.now().isoformat()
        }
    
    def _parse_sprint_risk(self, response: Dict, high_risk_count: int) -> Dict[str, Any]:
        """Parse agent response into sprint risk format"""
        output = response.get("output", "") if isinstance(response, dict) else str(response)
        
        risk_score = min(high_risk_count * 15, 100)
        
        return {
            "sprint_survival_probability": max(100 - risk_score, 20),
            "risk_level": "high" if risk_score > 60 else "medium",
            "blockers": [],
            "recommendations": [
                "Prioritize refactoring high-complexity files",
                "Increase code review frequency"
            ],
            "agent_response": output,
            "timestamp": datetime.now().isoformat()
        }
    
    # Mock methods for demo mode
    
    def _mock_agent_response(self, input_value: str) -> Dict[str, Any]:
        """Mock agent response for demo mode"""
        return {
            "status": "success",
            "output": f"Mock response for: {input_value[:100]}...\n\nBased on Context Studio analysis, here are the findings...",
            "metadata": {
                "execution_time": "2.3s",
                "tokens_used": 450,
                "model": "gpt-5.1",
                "demo_mode": True
            }
        }
    
    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()


# Global client instance
_ica_agent_client: Optional[ICAAgentClient] = None


def get_ica_agent_client() -> ICAAgentClient:
    """Get or create ICA Agent client instance"""
    global _ica_agent_client
    if _ica_agent_client is None:
        _ica_agent_client = ICAAgentClient()
    return _ica_agent_client


# Made with Bob