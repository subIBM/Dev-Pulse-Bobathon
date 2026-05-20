# GitHub Deployment Guide for DevPulse

This guide will help you push DevPulse to GitHub and set up CI/CD pipelines.

## Prerequisites

- Git installed on your system
- GitHub account
- GitHub repository created (or ready to create)

## Step 1: Initialize Git Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: DevPulse - AI-powered code analysis tool"
```

## Step 2: Connect to GitHub

### Option A: Create New Repository on GitHub
1. Go to https://github.com/new
2. Name your repository (e.g., `devpulse`)
3. Choose visibility (Public or Private)
4. **DO NOT** initialize with README, .gitignore, or license
5. Click "Create repository"

### Option B: Use Existing Repository
Skip to Step 3 if you already have a repository.

## Step 3: Link Local Repository to GitHub

```bash
# Add remote origin (replace with your repository URL)
git remote add origin https://github.com/YOUR_USERNAME/devpulse.git

# Verify remote
git remote -v

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 4: Set Up GitHub Secrets (Optional)

For CI/CD and deployment, add these secrets in your GitHub repository:

1. Go to: `Settings` → `Secrets and variables` → `Actions`
2. Click `New repository secret`
3. Add the following secrets:

| Secret Name | Description | Required |
|------------|-------------|----------|
| `IBM_API_KEY` | IBM Cloud API Key | Optional |
| `ICA_AGENT_ID` | IBM Code Assistant Agent ID | Optional |
| `DOCKER_USERNAME` | Docker Hub username | For Docker deployment |
| `DOCKER_PASSWORD` | Docker Hub password | For Docker deployment |

## Step 5: Enable GitHub Actions

The CI/CD pipeline is already configured in `.github/workflows/ci-cd.yml`.

It will automatically:
- ✅ Run backend tests on Python 3.11
- ✅ Run frontend tests and build
- ✅ Lint code (flake8 for Python, ESLint for TypeScript)
- ✅ Build Docker images
- ✅ Run security scans with Trivy

The pipeline runs on:
- Every push to `main` or `develop` branches
- Every pull request to `main` or `develop` branches

## Step 6: Verify Deployment

After pushing, check:

1. **Actions Tab**: https://github.com/YOUR_USERNAME/devpulse/actions
   - Verify all workflows pass
   - Check for any errors

2. **Security Tab**: https://github.com/YOUR_USERNAME/devpulse/security
   - Review security alerts (if any)

## Project Structure

```
devpulse/
├── .github/
│   └── workflows/
│       └── ci-cd.yml          # GitHub Actions CI/CD pipeline
├── backend/
│   ├── app/                   # FastAPI application
│   ├── requirements.txt       # Python dependencies
│   ├── Dockerfile            # Backend Docker image
│   └── .env.example          # Environment template
├── frontend/
│   ├── src/                  # React TypeScript source
│   ├── package.json          # Node dependencies
│   ├── Dockerfile           # Frontend Docker image
│   └── nginx.conf           # Nginx configuration
├── .gitignore               # Git ignore rules
├── docker-compose.yml       # Docker Compose setup
└── README.md               # Main documentation
```

## Docker Deployment

### Local Docker Build

```bash
# Build and run with Docker Compose
docker-compose up --build

# Access the application
# Frontend: http://localhost
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Individual Container Build

```bash
# Backend
cd backend
docker build -t devpulse-backend .
docker run -p 8000:8000 devpulse-backend

# Frontend
cd frontend
docker build -t devpulse-frontend .
docker run -p 80:80 devpulse-frontend
```

## Environment Variables

### Backend (.env)
```env
ENVIRONMENT=production
LOG_LEVEL=info
IBM_API_KEY=your_api_key_here
ICA_AGENT_ID=your_agent_id_here
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

## Continuous Deployment Options

### Option 1: GitHub Pages (Frontend Only)
Add this to `.github/workflows/ci-cd.yml`:

```yaml
deploy-frontend:
  runs-on: ubuntu-latest
  needs: frontend-test
  if: github.ref == 'refs/heads/main'
  steps:
    - uses: actions/checkout@v4
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./frontend/dist
```

### Option 2: Docker Hub
Add this to `.github/workflows/ci-cd.yml`:

```yaml
push-docker:
  runs-on: ubuntu-latest
  needs: [backend-test, frontend-test]
  if: github.ref == 'refs/heads/main'
  steps:
    - uses: docker/login-action@v3
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}
    - uses: docker/build-push-action@v5
      with:
        context: ./backend
        push: true
        tags: yourusername/devpulse-backend:latest
```

### Option 3: Cloud Platforms

#### Heroku
```bash
heroku create devpulse-backend
heroku create devpulse-frontend
git push heroku main
```

#### AWS/Azure/GCP
Use the respective CLI tools and follow their deployment guides.

## Troubleshooting

### Issue: CI/CD Pipeline Fails

**Solution**: Check the Actions tab for detailed logs. Common issues:
- Missing dependencies in `requirements.txt` or `package.json`
- Test failures
- Linting errors

### Issue: Docker Build Fails

**Solution**: 
```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

### Issue: Port Already in Use

**Solution**:
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

## Best Practices

1. **Branch Protection**: Enable branch protection rules for `main`
2. **Code Reviews**: Require pull request reviews before merging
3. **Semantic Versioning**: Use tags for releases (v1.0.0, v1.1.0, etc.)
4. **Changelog**: Maintain a CHANGELOG.md file
5. **Security**: Regularly update dependencies and scan for vulnerabilities

## Useful Commands

```bash
# Check git status
git status

# Create new branch
git checkout -b feature/new-feature

# Push branch to GitHub
git push -u origin feature/new-feature

# Pull latest changes
git pull origin main

# View commit history
git log --oneline --graph

# Tag a release
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

## Support

For issues or questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the main README.md for setup instructions

## License

[Add your license information here]

---

**Made with ❤️ by Bob**