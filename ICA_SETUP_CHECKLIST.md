# ICA Agent Studio Setup Checklist

## 🎯 What You Need to Get from ICA Agent Studio

This is your step-by-step checklist for setting up ICA integration with DevPulse.

---

## 📋 Required Information (3 Items)

You need to collect these 3 pieces of information from ICA Agent Studio:

### ✅ 1. **Agentic App ID**
- **What it is**: Unique identifier for your agentic application
- **Format**: `app_xxxxxxxxxx` or similar
- **Where to find it**: Top of the agentic app page or in the URL
- **Example**: `app_abc123xyz789`

### ✅ 2. **API Key**
- **What it is**: Authentication token for API access
- **Format**: Long alphanumeric string
- **Where to find it**: Workflow → Share → API Access → Create API Key
- **Example**: `your-api-key-here`
- **⚠️ IMPORTANT**: Copy immediately - shown only once!

### ✅ 3. **Context ID** (from Context Studio)
- **What it is**: Identifier for your Context Studio context
- **Format**: `ctx_xxxxxxxxxx`
- **Where to find it**: Context Studio → Your Context → Overview tab
- **Example**: `ctx_requirements_2024`

---

## 🚀 Step-by-Step Setup Process

### **STEP 1: Access ICA Agent Studio**

1. Go to: https://servicesessentials.ibm.com/launchpad/agent-assistant-studio
2. Log in with your IBM credentials
3. Switch to your **Personal Team** (top right)

---

### **STEP 2: Create Agentic App**

1. Click **"Create an Agentic App"** button
2. Fill in:
   - **App Name**: `DevPulse Code Analyzer`
   - **Description**: `AI-powered code analysis for DevPulse`
3. Click **"Create"**
4. **📝 COPY THE APP ID** from the top of the page
   - Look for something like: `App ID: app_xxxxx`
   - **Save it** - you'll need this for DevPulse configuration

**✅ Checkpoint**: You now have **Item #1: Agentic App ID**

---

### **STEP 3: Set Up Context Studio (If Not Done)**

**If you already completed the Context Studio Lab, skip to Step 4.**

If not:
1. Go to Context Studio
2. Create a new context
3. Upload documents (coding standards, best practices, etc.)
4. Publish the context
5. Expose as MCP server
6. **📝 COPY THE CONTEXT ID** (format: `ctx_xxxxx`)

**✅ Checkpoint**: You now have **Item #3: Context ID**

---

### **STEP 4: Configure MCP Server**

1. In your agentic app, go to **"MCP Servers"** page
2. Click **"Access MCP Gateway"** (opens Context Forge)
3. In Context Forge:
   - Go to **"MCP Servers"** tab
   - Click **"Add New MCP Server"**
   - Fill in:
     - **Server Name**: `DevPulse Context Studio`
     - **Server URL**: Your Context Studio MCP URL
     - **Transport Type**: `Streamable HTTP`
     - **Authentication**: `Bearer Token`
     - **Token**: Your MCP Gateway token
   - Click **"Save"**
4. Go to **"Virtual Server"** tab
5. Edit the default server
6. Select **all tools** from DevPulse Context Studio
7. Click **"Save"**

**✅ Checkpoint**: MCP server connected

---

### **STEP 5: Create and Deploy Agent**

1. Go to **"Agents"** page
2. Click **"Create Agent Orchestration"**
3. Configure:
   - **Platform**: `ICA`
   - **Framework**: `Strands`
   - **Model**: `GPT-5.1`
   - **Pattern**: `Single`
4. **Agent Prompt** (copy this):
   ```
   You are an expert code analysis assistant for DevPulse.
   
   Analyze code for:
   - Complexity metrics (cyclomatic, cognitive)
   - Quality issues and bugs
   - Security vulnerabilities
   - Refactoring opportunities
   
   Use Context Studio vector query tool with context ID: ctx_YOUR_CONTEXT_ID
   
   Provide specific, actionable insights with line numbers and code examples.
   ```
   **⚠️ Replace `ctx_YOUR_CONTEXT_ID` with your actual Context ID from Step 3!**

5. Click **"Generate"** or **"Create"**
6. Review the generated YAML
7. Click **"Deploy"**
8. Wait for deployment to complete (~30-60 seconds)

**✅ Checkpoint**: Agent deployed

---

### **STEP 6: Create Workflow**

1. Go to **"Workflow"** page
2. Click **"Create New Workflow"**
3. Add components in this order:
   - **Chat Input** component
   - **ICA Agent** component
     - **Agentic App ID**: Paste your App ID from Step 2
     - **Agent Name**: Select your deployed agent
   - **Chat Output** component
4. Connect them: Chat Input → ICA Agent → Chat Output
5. Click **"Playground"** to test
6. Test with: `"Analyze this Python code for complexity"`
7. Verify you get a response

**✅ Checkpoint**: Workflow working

---

### **STEP 7: Get API Key** ⭐ MOST IMPORTANT

1. In the workflow editor, click **"Share"** button
2. Select **"API Access"**
3. You'll see:
   - API Endpoint URL
   - Sample cURL command
4. Click **"Create an API Key"**
5. Fill in:
   - **Key Name**: `DevPulse Production`
   - **Description**: `API key for DevPulse backend`
6. Click **"Create"**
7. **⚠️ CRITICAL**: **COPY THE API KEY IMMEDIATELY**
   - It will be a long alphanumeric string
   - **This is shown ONLY ONCE!**
   - **Save it securely** (password manager, secure note)

**✅ Checkpoint**: You now have **Item #2: API Key**

---

## 📝 Final Configuration

Now you have all 3 required items. Update DevPulse:

### **Edit `backend/.env`**:

```env
# IBM ICA Agentic App Studio Configuration
ICA_AGENT_API_KEY=your-api-key-here                   # From Step 7
ICA_AGENT_APP_ID=app_xxxxxxxxxxxxx                    # From Step 2
ICA_AGENT_BASE_URL=https://langflow.servicesessentials.ibm.com/api/v1

# IBM Context Studio Configuration
ICA_CONTEXT_STUDIO_CONTEXT_ID=ctx_xxxxxxxxxxxxx       # From Step 3

# Switch to production mode
DEMO_MODE=False
```

### **Install Dependencies**:
```bash
cd backend
pip install httpx==0.25.2
```

### **Restart Backend**:
```bash
python -m app.main
```

---

## ✅ Verification Checklist

Check off each item as you complete it:

- [ ] Logged into ICA Agent Studio
- [ ] Created agentic app
- [ ] **Copied and saved Agentic App ID**
- [ ] Have Context ID from Context Studio
- [ ] Connected Context Studio MCP server
- [ ] Configured virtual server with tools
- [ ] Created and deployed agent
- [ ] Created workflow with 3 components
- [ ] Tested workflow in playground
- [ ] **Created and saved API Key**
- [ ] Updated `backend/.env` with all 3 values
- [ ] Installed httpx dependency
- [ ] Restarted backend
- [ ] Tested DevPulse with real ICA integration

---

## 🎯 Quick Reference

### **What You Need**:
1. **Agentic App ID**: `app_xxxxx` (from app page)
2. **API Key**: `sk_live_xxxxx` (from Share → API Access)
3. **Context ID**: `ctx_xxxxx` (from Context Studio)

### **Where to Put Them**:
File: `backend/.env`
```env
ICA_AGENT_API_KEY=<your_api_key>
ICA_AGENT_APP_ID=<your_app_id>
ICA_CONTEXT_STUDIO_CONTEXT_ID=<your_context_id>
DEMO_MODE=False
```

### **How to Test**:
1. Restart backend: `python -m app.main`
2. Open frontend: http://localhost:5173
3. Click "Scan Repository"
4. Verify analysis uses real ICA agent

---

## 🆘 Common Issues

### **"Can't find App ID"**
- Look at the URL when viewing your agentic app
- Or check the top of the agentic app page
- Format: `app_` followed by alphanumeric characters

### **"Lost my API Key"**
- You'll need to create a new one
- Go to Workflow → Share → API Access → Create API Key
- Delete the old key for security

### **"Context ID not working"**
- Verify format is `ctx_xxxxx`
- Check Context Studio → Your Context → Overview
- Make sure context is published

### **"Agent not responding"**
- Check agent is deployed (green status)
- Verify MCP server is "Active"
- Test in playground first

---

## 📞 Need Help?

If you get stuck:
1. Check the full guide: `ICA_INTEGRATION_GUIDE.md`
2. Review ICA documentation: https://servicesessentials.ibm.com/
3. Check agent logs in ICA Agent Studio
4. Verify all 3 values are correct in `.env`

---

## 🎉 Success!

Once you have all 3 items configured, DevPulse will use real ICA agents with Context Studio knowledge for production-quality code analysis!

---

**Made with Bob** 🤖