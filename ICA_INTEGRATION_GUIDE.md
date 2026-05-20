# IBM ICA Agentic App Studio Integration Guide

Complete guide to integrate DevPulse with IBM Consulting Advantage (ICA) Agentic App Studio and Context Studio.

---

## 📋 Overview

This guide walks you through connecting DevPulse to:
- **ICA Agentic App Studio** - For AI-powered code analysis agents
- **Context Studio** - For domain-specific knowledge via MCP servers
- **Deployed Workflows** - For production-ready API access

---

## 🎯 Prerequisites

Before starting, ensure you have:

- ✅ Access to IBM Consulting Advantage (ICA) platform
- ✅ Completed the [ICA Context Studio Lab](https://pages.github.ibm.com/guild-of-coding-agents-at-consulting/documentation/docs/enablement-materials/ica-labs/ica-context-studio-lab/)
- ✅ A published Context Studio schema with loaded documents
- ✅ Context Studio exposed as an MCP server
- ✅ Your Context ID from Context Studio (format: `ctx_xxxxx`)
- ✅ DevPulse application installed and running

---

## 🚀 Step-by-Step Integration

### Step 1: Access ICA Agentic App Studio

1. **Switch to Personal Team**:
   - Log in to IBM Consulting Advantage
   - Click on your profile/team selector
   - Select your **Personal Team**

2. **Navigate to Agentic App Studio**:
   - Go to: https://servicesessentials.ibm.com/launchpad/agent-assistant-studio
   - Familiarize yourself with the interface

3. **Create New Agentic App**:
   - Click "Create an Agentic App"
   - **App Name**: `DevPulse Code Analyzer`
   - **Description**: `AI-powered code analysis and refactoring assistant for DevPulse`
   - Click "Create"
   - **Save the App ID** (you'll need this later)

---

### Step 2: Configure MCP Server (Context Studio)

1. **Access MCP Gateway**:
   - In your agentic app, go to "MCP Servers" page
   - Click "Access MCP Gateway"
   - Context Forge will open

2. **Add Context Studio MCP Server**:
   - In Context Forge, open "MCP Servers" tab
   - Scroll to "Add New MCP Server or Gateway"
   - Configure:
     - **Server Name**: `DevPulse Context Studio`
     - **Server URL**: Your Context Studio MCP URL (from Context Studio Lab)
       - Format: `https://servicesessentials.ibm.com/mcp-gateway/service/gateway/servers/xxxx/mcp`
     - **Description**: `Code analysis knowledge base for DevPulse`
     - **Tags**: `devpulse`, `code-analysis`, `context-studio`
     - **Visibility**: `Private`
     - **Transport Type**: `Streamable HTTP`
     - **Authentication Type**: `Bearer Token`
     - **Token**: Your MCP Gateway Token (from Context Studio Lab)
   - Click "Save"
   - Verify status shows "Active"

3. **Configure Virtual Server**:
   - In Context Forge, go to "Virtual Server" tab
   - Find the default server
   - Click "Edit" (pencil icon)
   - Select **all tools** from DevPulse Context Studio MCP server
   - Click "Save Changes"

4. **Verify Tools**:
   - Return to MCP Servers page in your agentic app
   - Check the "Tools" column
   - Click the tools count link
   - Verify Context Studio tools appear (e.g., vector_query, semantic_search)

---

### Step 3: Create AI Agent

1. **Create Agent Orchestration**:
   - Navigate to "Agents" page
   - Click "Create Agent Orchestration"
   - Interactive Assistant will appear

2. **Configure Agent**:
   - **Platform**: `ICA (IBM Consulting Advantage)`
   - **Framework**: `Strands`
   - **Model**: `GPT-5.1` (or latest available)
   - **Pattern**: `Single`

3. **Agent Prompt** (copy and customize):
   ```
   You are an expert code analysis assistant for DevPulse, an AI-powered sprint orchestrator.
   
   Your role is to:
   1. Analyze code for complexity, quality issues, and technical debt
   2. Predict merge conflicts based on branch activity
   3. Generate refactoring suggestions with before/after code
   4. Calculate sprint delivery risks
   
   Use the Context Studio vector query tool with context ID: ctx_YOUR_CONTEXT_ID_HERE
   
   When analyzing code:
   - Provide specific line numbers for issues
   - Calculate cyclomatic and cognitive complexity
   - Identify security vulnerabilities
   - Suggest concrete refactoring steps
   - Estimate time savings from improvements
   
   When predicting merge conflicts:
   - Analyze branch overlap patterns
   - Calculate conflict probability (0-1)
   - Identify specific conflict areas
   - Provide actionable recommendations
   
   When calculating sprint risk:
   - Consider file complexity and team velocity
   - Calculate sprint survival probability (0-100%)
   - Identify critical blockers
   - Suggest mitigation strategies
   
   Always provide structured, actionable insights based on Context Studio knowledge.
   ```
   
   **Important**: Replace `ctx_YOUR_CONTEXT_ID_HERE` with your actual Context ID!

4. **Review Agent YAML**:
   - Verify model configuration
   - Check Context Studio tools are included
   - Confirm system prompt includes your Context ID
   - Adjust parameters if needed (temperature, max_tokens)

5. **Deploy Agent**:
   - Click "Deploy"
   - Wait for deployment (30-60 seconds)
   - **Save the Agent Name** (you'll need this)

6. **Test Agent**:
   - Click "Invoke" on the deployed agent
   - Test query: `"Analyze this Python function for complexity: def process_data(items): ..."`
   - Verify response uses Context Studio
   - Check response quality

---

### Step 4: Create Workflow

1. **Create New Workflow**:
   - Navigate to "Workflow" page
   - Click "Create New Workflow"
   - Workflow canvas opens

2. **Add Components**:
   
   **a. Chat Input Component**:
   - Add "Chat Input" component
   - Position at start of workflow
   
   **b. ICA Agent Component**:
   - Add "ICA Agent" component
   - Configure:
     - **Agentic App ID**: Copy from top of page, paste here
     - **Agent Name**: Select your deployed agent
   
   **c. Chat Output Component**:
   - Add "Chat Output" component
   - Position at end of workflow

3. **Connect Components**:
   - Connect: Chat Input → ICA Agent → Chat Output
   - Verify all connections are valid
   - Check for validation errors

4. **Test in Playground**:
   - Click "Playground" button
   - Test queries:
     - `"Analyze code complexity for a React component"`
     - `"Predict merge conflict risk for file X"`
     - `"Calculate sprint survival probability"`
   - Verify responses are accurate
   - Check Context Studio is being used

---

### Step 5: Configure API Access

1. **Open API Configuration**:
   - In workflow editor, click "Share" button
   - Select "API Access"

2. **Get API Endpoint**:
   - Copy the API endpoint URL
   - **Important**: Change host from `agentstudio.servicesessentials.ibm.com` to `langflow.servicesessentials.ibm.com`
   - Example:
     ```
     https://langflow.servicesessentials.ibm.com/api/v1/run/YOUR_APP_ID?stream=false
     ```

3. **Create API Key**:
   - Click "Create an API Key"
   - **Key Name**: `DevPulse Production API Key`
   - **Description**: `API key for DevPulse backend integration`
   - Click "Create"
   - **IMPORTANT**: Copy the API key immediately (shown only once!)
   - Store securely (password manager, environment variables)

4. **Save cURL Command**:
   - Copy the sample cURL command
   - Save to a secure location
   - Example format:
     ```bash
     curl --request POST \
          --url 'https://langflow.servicesessentials.ibm.com/api/v1/run/YOUR_APP_ID?stream=false' \
          --header 'Content-Type: application/json' \
          --header "x-api-key: YOUR_API_KEY" \
          --data '{
                    "output_type": "chat",
                    "input_type": "chat",
                    "input_value": "Analyze this code...",
                    "session_id": "devpulse_session_001"
                  }'
     ```

5. **Test API**:
   - Run the cURL command in terminal
   - Verify you get a successful response
   - Check response format matches expectations

---

### Step 6: Configure DevPulse Backend

1. **Update Environment Variables**:
   
   Edit `backend/.env`:
   ```env
   # IBM ICA Agentic App Studio Configuration
   ICA_AGENT_API_KEY=your_api_key_from_step_5
   ICA_AGENT_APP_ID=your_app_id_from_step_1
   ICA_AGENT_BASE_URL=https://langflow.servicesessentials.ibm.com/api/v1
   
   # IBM Context Studio Configuration
   ICA_CONTEXT_STUDIO_CONTEXT_ID=ctx_your_context_id
   
   # Set to False to use real ICA APIs
   DEMO_MODE=False
   ```

2. **Install Dependencies**:
   ```bash
   cd backend
   pip install httpx==0.25.2
   ```

3. **Restart Backend**:
   ```bash
   # Stop current backend (Ctrl+C)
   python -m app.main
   ```

4. **Verify Integration**:
   - Backend should start without errors
   - Check logs for "ICA Agent client initialized"
   - No warnings about missing API keys

---

### Step 7: Test End-to-End Integration

1. **Test via API Documentation**:
   - Open: http://localhost:8000/docs
   - Try `/api/analysis/analyze` endpoint
   - Verify it uses ICA agent (check response metadata)

2. **Test via Frontend**:
   - Open: http://localhost:5173
   - Click "Scan Repository"
   - Verify analysis uses real ICA agent
   - Check refactor suggestions are from ICA

3. **Verify Context Studio Usage**:
   - In ICA Agentic App Studio, check agent logs
   - Verify Context Studio tools are being called
   - Check response quality improves with context

---

## 🔧 Configuration Reference

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `ICA_AGENT_API_KEY` | API key from Step 5 | `sk_xxxxx...` |
| `ICA_AGENT_APP_ID` | Agentic App ID from Step 1 | `app_xxxxx...` |
| `ICA_AGENT_BASE_URL` | ICA API base URL | `https://langflow.servicesessentials.ibm.com/api/v1` |
| `ICA_CONTEXT_STUDIO_CONTEXT_ID` | Context ID from Context Studio | `ctx_xxxxx...` |
| `DEMO_MODE` | Use mock data (True) or real APIs (False) | `False` |

### API Request Format

```json
{
  "output_type": "chat",
  "input_type": "chat",
  "input_value": "Your query here",
  "session_id": "unique_session_id"
}
```

### API Response Format

```json
{
  "status": "success",
  "output": "Agent response text...",
  "metadata": {
    "execution_time": "2.3s",
    "tokens_used": 450,
    "model": "gpt-5.1"
  }
}
```

---

## 🐛 Troubleshooting

### Issue: "API key not found"
**Solution**: Verify `ICA_AGENT_API_KEY` in `backend/.env` is correct and not empty.

### Issue: "Agent not found"
**Solution**: Check `ICA_AGENT_APP_ID` matches your agentic app ID exactly.

### Issue: "Context Studio tools not available"
**Solution**: 
1. Verify MCP server is "Active" in Context Forge
2. Check virtual server includes Context Studio tools
3. Redeploy the agent

### Issue: "401 Unauthorized"
**Solution**: 
1. Verify API key is valid and not expired
2. Check API key has correct permissions
3. Regenerate API key if needed

### Issue: "Timeout errors"
**Solution**:
1. Increase timeout in `ica_agent_client.py` (default: 60s)
2. Check ICA service status
3. Verify network connectivity

---

## 📊 Monitoring & Logs

### Backend Logs
```bash
# View backend logs
cd backend
tail -f ../backend.log
```

### ICA Agent Logs
1. Go to ICA Agentic App Studio
2. Navigate to your agent
3. Click "Logs" or "Monitoring"
4. View execution history and errors

### Context Studio Usage
1. Go to Context Studio
2. Check "Analytics" tab
3. View query patterns and usage

---

## 🔒 Security Best Practices

1. **API Key Management**:
   - Store API keys in environment variables
   - Never commit API keys to version control
   - Rotate keys regularly (every 90 days)
   - Use different keys for dev/staging/production

2. **Access Control**:
   - Keep agentic apps in Personal Team for development
   - Move to Team workspace for production
   - Set appropriate visibility (Private/Team/Public)

3. **Data Privacy**:
   - Code analyzed by ICA agents stays within IBM infrastructure
   - Context Studio data is encrypted at rest
   - API calls use HTTPS/TLS

---

## 📚 Additional Resources

- [ICA Agentic App Studio Documentation](https://servicesessentials.ibm.com/launchpad/agent-assistant-studio)
- [Context Studio Lab](https://pages.github.ibm.com/guild-of-coding-agents-at-consulting/documentation/docs/enablement-materials/ica-labs/ica-context-studio-lab/)
- [ICA Platform Overview](https://servicesessentials.ibm.com/)
- [DevPulse Architecture](./ARCHITECTURE.md)

---

## ✅ Integration Checklist

Use this checklist to verify your integration:

- [ ] ICA Agentic App created with correct name
- [ ] Context Studio MCP server connected and active
- [ ] Virtual server configured with Context Studio tools
- [ ] AI agent deployed with correct prompt and Context ID
- [ ] Workflow created with Chat Input → Agent → Chat Output
- [ ] Workflow tested in playground successfully
- [ ] API key created and stored securely
- [ ] API endpoint URL updated (langflow host)
- [ ] Backend `.env` configured with all credentials
- [ ] Backend restarted with new configuration
- [ ] End-to-end test successful via frontend
- [ ] Agent logs show Context Studio tool usage

---

## 🎉 Success!

Once all steps are complete, DevPulse will use real ICA agents powered by Context Studio for:
- ✅ Code complexity analysis
- ✅ Merge conflict prediction
- ✅ AI-powered refactoring
- ✅ Sprint risk calculation

Your DevPulse instance is now production-ready with enterprise-grade AI capabilities!

---

**Made with Bob** - DevPulse: AI-Powered Sprint Orchestrator