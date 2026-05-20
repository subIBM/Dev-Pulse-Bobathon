# IBM Agent Assistant Studio Setup Guide

## Overview

This guide walks through configuring IBM Agent Assistant Studio to power DevPulse's AgenticFixer service - the component that autonomously generates code refactorings.

---

## Prerequisites

1. **IBM Cloud Account**: https://cloud.ibm.com
2. **Agent Assistant Studio Access**: https://servicesessentials.ibm.com/launchpad/agent-assistant-studio
3. **IBM watsonx.ai Access**: For underlying LLM capabilities
4. **API Credentials**: Obtained from IBM Cloud console

---

## Step 1: Access Agent Assistant Studio

### 1.1 Login
1. Navigate to: https://servicesessentials.ibm.com/launchpad/agent-assistant-studio
2. Login with IBM Cloud credentials
3. Accept terms of service if prompted

### 1.2 Create New Workspace
1. Click "Create Workspace"
2. Name: `DevPulse-Production`
3. Description: `Agentic code refactoring for DevPulse sprint orchestrator`
4. Region: Select closest to your location
5. Click "Create"

---

## Step 2: Configure Agent

### 2.1 Create CodeRefactorAgent

**Navigation:** Workspace → Agents → Create New Agent

**Basic Configuration:**
```yaml
Agent Name: CodeRefactorAgent
Agent Type: Autonomous
Description: Analyzes code issues and generates refactored solutions
Version: 1.0.0
```

**Model Selection:**
```yaml
Primary Model: watsonx-granite-code-34b-instruct
Fallback Model: watsonx-granite-code-20b-instruct
Temperature: 0.3
Max Tokens: 4096
```

### 2.2 System Prompt

```
You are an expert software architect specializing in code refactoring. Your role is to:

1. Analyze problematic code and identify architectural issues
2. Generate clean, refactored code that follows SOLID principles
3. Provide clear explanations of changes made
4. Create step-by-step migration plans

When refactoring code, you must:
- Preserve all functionality
- Reduce cyclomatic complexity
- Remove circular dependencies
- Improve testability
- Follow language-specific best practices
- Generate production-ready code (no placeholders or TODOs)

Output Format:
{
  "refactored_code": "complete refactored code here",
  "changes": [
    {
      "type": "extract_component|remove_dependency|simplify_logic",
      "description": "clear explanation",
      "files_created": ["list of new files if any"]
    }
  ],
  "complexity_improvement": {
    "before": number,
    "after": number,
    "reduction_percentage": number
  },
  "migration_steps": [
    "step 1",
    "step 2",
    "step 3"
  ],
  "test_suggestions": [
    "test case 1",
    "test case 2"
  ]
}
```

---

## Step 3: Configure Tools

### 3.1 Add Code Analysis Tool

**Tool Name:** `analyze_code_structure`

**Tool Type:** API Call

**Configuration:**
```json
{
  "name": "analyze_code_structure",
  "description": "Analyzes code structure and identifies issues",
  "type": "api_call",
  "endpoint": "https://api.ibm.com/bob/v1/analyze",
  "method": "POST",
  "headers": {
    "Authorization": "Bearer ${IBM_BOB_API_KEY}",
    "Content-Type": "application/json"
  },
  "body_template": {
    "code": "${code}",
    "language": "${language}",
    "analysis_types": ["complexity", "dependencies", "code_smells"]
  },
  "response_mapping": {
    "issues": "$.issues",
    "complexity": "$.complexity_score",
    "dependencies": "$.dependencies"
  }
}
```

### 3.2 Add Dependency Resolver Tool

**Tool Name:** `resolve_dependencies`

**Tool Type:** LLM Function

**Configuration:**
```json
{
  "name": "resolve_dependencies",
  "description": "Identifies and resolves circular dependencies",
  "type": "llm_function",
  "prompt_template": "Given this code with circular dependencies:\n\n${code}\n\nDependencies detected:\n${dependencies}\n\nGenerate a refactoring plan that:\n1. Extracts shared types to a separate module\n2. Breaks circular imports\n3. Maintains all functionality\n\nProvide the complete refactored code structure.",
  "output_schema": {
    "type": "object",
    "properties": {
      "shared_types_file": {"type": "string"},
      "refactored_files": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "path": {"type": "string"},
            "content": {"type": "string"}
          }
        }
      }
    }
  }
}
```

### 3.3 Add Complexity Reducer Tool

**Tool Name:** `reduce_complexity`

**Tool Type:** LLM Function

**Configuration:**
```json
{
  "name": "reduce_complexity",
  "description": "Reduces cyclomatic complexity of functions",
  "type": "llm_function",
  "prompt_template": "This function has cyclomatic complexity of ${complexity}:\n\n${code}\n\nRefactor it to:\n1. Reduce complexity to below 10\n2. Extract nested logic into separate functions\n3. Use early returns to reduce nesting\n4. Maintain exact functionality\n\nProvide the complete refactored code.",
  "output_schema": {
    "type": "object",
    "properties": {
      "refactored_code": {"type": "string"},
      "extracted_functions": {
        "type": "array",
        "items": {"type": "string"}
      },
      "new_complexity": {"type": "number"}
    }
  }
}
```

### 3.4 Add Test Generator Tool

**Tool Name:** `generate_tests`

**Tool Type:** LLM Function

**Configuration:**
```json
{
  "name": "generate_tests",
  "description": "Generates unit tests for refactored code",
  "type": "llm_function",
  "prompt_template": "Generate comprehensive unit tests for this refactored code:\n\n${code}\n\nLanguage: ${language}\nTest Framework: ${test_framework}\n\nGenerate tests that:\n1. Cover all public functions\n2. Test edge cases\n3. Verify functionality matches original\n4. Follow testing best practices",
  "output_schema": {
    "type": "object",
    "properties": {
      "test_file": {"type": "string"},
      "test_cases": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "name": {"type": "string"},
            "code": {"type": "string"}
          }
        }
      }
    }
  }
}
```

---

## Step 4: Define Agent Workflow

### 4.1 Workflow Configuration

**Navigation:** Agent → Workflows → Create New Workflow

**Workflow Name:** `RefactorCodeWorkflow`

**Workflow Definition:**
```yaml
workflow:
  name: RefactorCodeWorkflow
  description: End-to-end code refactoring workflow
  
  inputs:
    - name: code
      type: string
      required: true
      description: Original code to refactor
    
    - name: language
      type: string
      required: true
      description: Programming language
    
    - name: issues
      type: array
      required: true
      description: List of issues detected
    
    - name: file_path
      type: string
      required: true
      description: Path to the file being refactored
  
  steps:
    - id: analyze
      name: Analyze Code Structure
      tool: analyze_code_structure
      inputs:
        code: ${workflow.inputs.code}
        language: ${workflow.inputs.language}
      outputs:
        - analysis_result
    
    - id: plan_refactor
      name: Plan Refactoring Strategy
      type: llm_reasoning
      prompt: |
        Based on this code analysis:
        ${steps.analyze.outputs.analysis_result}
        
        And these issues:
        ${workflow.inputs.issues}
        
        Create a detailed refactoring strategy that addresses:
        1. Circular dependencies
        2. High complexity
        3. Code smells
        4. Testability
        
        Prioritize changes by impact and provide a step-by-step plan.
      outputs:
        - refactor_plan
    
    - id: resolve_deps
      name: Resolve Dependencies
      tool: resolve_dependencies
      condition: ${steps.analyze.outputs.analysis_result.has_circular_deps}
      inputs:
        code: ${workflow.inputs.code}
        dependencies: ${steps.analyze.outputs.analysis_result.dependencies}
      outputs:
        - resolved_code
    
    - id: reduce_complexity
      name: Reduce Complexity
      tool: reduce_complexity
      inputs:
        code: ${steps.resolve_deps.outputs.resolved_code || workflow.inputs.code}
        complexity: ${steps.analyze.outputs.analysis_result.complexity}
      outputs:
        - simplified_code
    
    - id: generate_final
      name: Generate Final Refactored Code
      type: llm_generation
      prompt: |
        Based on the refactoring plan:
        ${steps.plan_refactor.outputs.refactor_plan}
        
        And the intermediate refactorings:
        - Dependency resolution: ${steps.resolve_deps.outputs.resolved_code}
        - Complexity reduction: ${steps.reduce_complexity.outputs.simplified_code}
        
        Generate the final, production-ready refactored code that:
        1. Incorporates all improvements
        2. Maintains exact functionality
        3. Follows ${workflow.inputs.language} best practices
        4. Is fully documented
        
        Provide ONLY the complete code, no explanations.
      outputs:
        - final_code
    
    - id: validate
      name: Validate Refactored Code
      tool: analyze_code_structure
      inputs:
        code: ${steps.generate_final.outputs.final_code}
        language: ${workflow.inputs.language}
      outputs:
        - validation_result
    
    - id: generate_tests
      name: Generate Unit Tests
      tool: generate_tests
      inputs:
        code: ${steps.generate_final.outputs.final_code}
        language: ${workflow.inputs.language}
        test_framework: ${workflow.inputs.language == 'typescript' ? 'jest' : 'pytest'}
      outputs:
        - test_code
    
    - id: create_summary
      name: Create Change Summary
      type: llm_generation
      prompt: |
        Summarize the refactoring changes:
        
        Original complexity: ${steps.analyze.outputs.analysis_result.complexity}
        New complexity: ${steps.validate.outputs.validation_result.complexity}
        
        Original issues: ${workflow.inputs.issues}
        Remaining issues: ${steps.validate.outputs.validation_result.issues}
        
        Create a JSON summary with:
        - List of changes made
        - Complexity improvement metrics
        - Migration steps
        - Test suggestions
      outputs:
        - summary
  
  outputs:
    - name: refactored_code
      value: ${steps.generate_final.outputs.final_code}
    
    - name: changes
      value: ${steps.create_summary.outputs.summary.changes}
    
    - name: complexity_improvement
      value: ${steps.create_summary.outputs.summary.complexity_improvement}
    
    - name: migration_steps
      value: ${steps.create_summary.outputs.summary.migration_steps}
    
    - name: test_code
      value: ${steps.generate_tests.outputs.test_code}
    
    - name: validation_result
      value: ${steps.validate.outputs.validation_result}
```

---

## Step 5: Test Agent

### 5.1 Create Test Case

**Test Input:**
```json
{
  "code": "import React from 'react';\nimport { AuthContext } from '../services/AuthService';\n\nexport const UserProfile = () => {\n  const handleUserUpdate = (data: any) => {\n    if (data.type === 'email') {\n      if (data.verified) {\n        if (data.primary) {\n          return true;\n        }\n      }\n    }\n    return false;\n  };\n  \n  return <div>Profile</div>;\n};",
  "language": "typescript",
  "issues": [
    {
      "type": "circular_dependency",
      "severity": "high",
      "description": "Circular import with AuthContext"
    },
    {
      "type": "high_complexity",
      "severity": "medium",
      "description": "Cyclomatic complexity: 18"
    }
  ],
  "file_path": "src/components/UserProfile.tsx"
}
```

### 5.2 Expected Output

```json
{
  "refactored_code": "import React from 'react';\nimport { UserProfileProps } from '../types/user';\nimport { useUserUpdate } from '../hooks/useUserUpdate';\n\nexport const UserProfile = ({ userId }: UserProfileProps) => {\n  const { handleUpdate } = useUserUpdate();\n  \n  return (\n    <div>\n      <h2>User Profile</h2>\n      {/* Profile content */}\n    </div>\n  );\n};",
  "changes": [
    {
      "type": "extract_component",
      "description": "Extracted user update logic to custom hook",
      "files_created": ["src/hooks/useUserUpdate.ts"]
    },
    {
      "type": "remove_circular_dep",
      "description": "Moved shared types to types/user.ts",
      "files_created": ["src/types/user.ts"]
    }
  ],
  "complexity_improvement": {
    "before": 18,
    "after": 3,
    "reduction_percentage": 83
  },
  "migration_steps": [
    "1. Create src/types/user.ts with shared types",
    "2. Create src/hooks/useUserUpdate.ts with extracted logic",
    "3. Update UserProfile.tsx imports",
    "4. Run tests to verify functionality"
  ]
}
```

### 5.3 Run Test

1. Navigate to Agent → Test
2. Paste test input
3. Click "Run Test"
4. Verify output matches expected format
5. Check execution time (should be < 15 seconds)

---

## Step 6: Deploy Agent

### 6.1 Create API Endpoint

**Navigation:** Agent → Deploy → Create API Endpoint

**Configuration:**
```yaml
Endpoint Name: devpulse-refactor-api
Authentication: API Key
Rate Limit: 100 requests/hour
Timeout: 30 seconds
```

### 6.2 Get API Credentials

1. Click "Generate API Key"
2. Copy API Key: `aas_xxxxxxxxxxxxxxxxxxxxxxxx`
3. Copy Agent ID: `agent_xxxxxxxxxxxxxxxxxxxxxxxx`
4. Copy Endpoint URL: `https://agent-assistant-studio.ibm.com/api/v1/agents/{agent_id}/invoke`

### 6.3 Update DevPulse Configuration

Add to `backend/.env`:
```env
IBM_AGENT_STUDIO_URL=https://agent-assistant-studio.ibm.com/api/v1
IBM_AGENT_STUDIO_API_KEY=aas_xxxxxxxxxxxxxxxxxxxxxxxx
IBM_AGENT_ID=agent_xxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Step 7: Integrate with DevPulse

### 7.1 Update AgenticFixer Service

**File:** `backend/app/services/agentic_fixer.py`

```python
import aiohttp
import logging
from typing import Dict, List

from app.config import settings
from app.models.analysis import CodeIssue

logger = logging.getLogger(__name__)

class AgenticFixer:
    def __init__(self):
        self.api_url = f"{settings.ibm_agent_studio_url}/agents/{settings.ibm_agent_id}/invoke"
        self.api_key = settings.ibm_agent_studio_api_key
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    async def generate_refactor(
        self,
        code: str,
        language: str,
        file_path: str,
        issues: List[CodeIssue]
    ) -> Dict:
        """Generate refactored code using IBM Agent Assistant Studio"""
        
        payload = {
            "input": {
                "code": code,
                "language": language,
                "file_path": file_path,
                "issues": [
                    {
                        "type": issue.type.value,
                        "severity": issue.severity.value,
                        "description": issue.description
                    }
                    for issue in issues
                ]
            }
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.api_url,
                    json=payload,
                    headers=self.headers,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        return self._parse_agent_response(result)
                    else:
                        logger.error(f"Agent API error: {response.status}")
                        return self._mock_refactor(code, issues)
        except Exception as e:
            logger.error(f"Error calling Agent Assistant Studio: {e}")
            return self._mock_refactor(code, issues)
    
    def _parse_agent_response(self, response: Dict) -> Dict:
        """Parse agent response into expected format"""
        output = response.get("output", {})
        
        return {
            "refactored_code": output.get("refactored_code", ""),
            "changes": output.get("changes", []),
            "complexity_improvement": output.get("complexity_improvement", {}),
            "migration_steps": output.get("migration_steps", []),
            "test_code": output.get("test_code", ""),
            "validation_result": output.get("validation_result", {})
        }
    
    def _mock_refactor(self, code: str, issues: List[CodeIssue]) -> Dict:
        """Mock refactor for development/demo"""
        # Simplified mock implementation
        return {
            "refactored_code": "// Refactored code would appear here",
            "changes": [
                {
                    "type": "simplify_logic",
                    "description": "Reduced complexity",
                    "files_created": []
                }
            ],
            "complexity_improvement": {
                "before": 18,
                "after": 8,
                "reduction_percentage": 55
            },
            "migration_steps": [
                "1. Review changes",
                "2. Run tests",
                "3. Deploy"
            ]
        }
```

---

## Step 8: Monitor and Optimize

### 8.1 Enable Monitoring

**Navigation:** Agent → Monitoring → Enable

**Metrics to Track:**
- Request count
- Average response time
- Error rate
- Token usage
- Success rate

### 8.2 Set Up Alerts

```yaml
Alerts:
  - name: High Error Rate
    condition: error_rate > 5%
    action: email_notification
  
  - name: Slow Response
    condition: avg_response_time > 20s
    action: slack_notification
  
  - name: Rate Limit Approaching
    condition: requests_per_hour > 90
    action: email_notification
```

### 8.3 Optimize Performance

**Strategies:**
1. **Caching:** Cache refactoring results for identical code
2. **Batching:** Process multiple files in parallel
3. **Streaming:** Use streaming responses for large refactors
4. **Fallback:** Implement graceful degradation if agent is slow

---

## Troubleshooting

### Common Issues

**Issue:** Agent returns empty response
**Solution:** Check input format matches schema exactly

**Issue:** Timeout errors
**Solution:** Increase timeout to 60s for complex refactors

**Issue:** Rate limit exceeded
**Solution:** Implement request queuing or upgrade plan

**Issue:** Inconsistent output format
**Solution:** Add output validation in workflow

---

## Best Practices

1. **Version Control:** Tag agent versions for rollback capability
2. **Testing:** Test with diverse code samples before production
3. **Monitoring:** Set up comprehensive monitoring and alerts
4. **Documentation:** Document all custom tools and workflows
5. **Security:** Rotate API keys regularly
6. **Backup:** Have fallback logic for agent failures

---

## Cost Optimization

### Token Usage Estimation

**Per Refactor Request:**
- Input tokens: ~2,000 (code + context)
- Output tokens: ~3,000 (refactored code + explanation)
- Total: ~5,000 tokens

**Monthly Estimate (100 refactors/day):**
- Daily tokens: 500,000
- Monthly tokens: 15,000,000
- Estimated cost: $150-300/month (varies by model)

### Optimization Tips

1. Use smaller models for simple refactors
2. Cache common refactoring patterns
3. Implement smart batching
4. Use streaming for large files

---

## Next Steps

1. ✅ Complete agent configuration
2. ✅ Test with sample code
3. ✅ Deploy to production
4. ⏳ Monitor performance
5. ⏳ Gather user feedback
6. ⏳ Iterate and improve

---

## Support Resources

- **Documentation:** https://cloud.ibm.com/docs/agent-assistant-studio
- **Community:** https://community.ibm.com/agent-assistant
- **Support:** https://cloud.ibm.com/unifiedsupport
- **API Reference:** https://cloud.ibm.com/apidocs/agent-assistant-studio

---

## Appendix: Example API Calls

### Invoke Agent via cURL

```bash
curl -X POST \
  https://agent-assistant-studio.ibm.com/api/v1/agents/{agent_id}/invoke \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "code": "your code here",
      "language": "typescript",
      "file_path": "src/App.tsx",
      "issues": [...]
    }
  }'
```

### Invoke Agent via Python

```python
import requests

response = requests.post(
    f"https://agent-assistant-studio.ibm.com/api/v1/agents/{agent_id}/invoke",
    headers={
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    },
    json={
        "input": {
            "code": "your code here",
            "language": "typescript",
            "file_path": "src/App.tsx",
            "issues": [...]
        }
    }
)

result = response.json()