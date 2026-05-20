# DevPulse Frontend

React + TypeScript + D3.js frontend for DevPulse AI-Powered Sprint Orchestrator.

## Features

- 🗺️ **Interactive D3.js Sunburst Visualization** - Explore your codebase architecture
- 📊 **Real-time Risk Analysis** - See risk scores and predictions
- 🤖 **AI-Powered Refactoring** - View and apply Bob AI suggestions
- 📈 **Sprint Survival Score** - Track your sprint health
- 🎨 **Beautiful UI** - Built with TailwindCSS

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **D3.js v7** - Data visualization
- **TailwindCSS** - Styling
- **Axios** - HTTP client
- **Lucide React** - Icons

## Prerequisites

- Node.js 18+ 
- npm or yarn
- DevPulse backend running on `http://localhost:8000`

## Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## Environment Variables

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_DEV_MODE=true
```

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── CodebaseMap.tsx          # D3.js sunburst visualization
│   │   ├── RiskPanel.tsx            # Risk analysis display
│   │   ├── SprintSurvivalScore.tsx  # Sprint health gauge
│   │   └── RefactorViewer.tsx       # Code diff viewer
│   ├── services/        # API clients
│   │   └── api.ts       # Backend API integration
│   ├── types/           # TypeScript types
│   │   └── index.ts     # Shared type definitions
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles + Tailwind
├── index.html           # HTML template
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
├── vite.config.ts       # Vite config
└── tailwind.config.js   # Tailwind config
```

## Available Scripts

```bash
# Development
npm run dev          # Start dev server with hot reload

# Build
npm run build        # Build for production
npm run preview      # Preview production build

# Linting
npm run lint         # Run ESLint
```

## Key Components

### CodebaseMap

Interactive D3.js sunburst chart that visualizes the entire codebase:
- Color-coded by risk level (green/yellow/red)
- Click to select files
- Hover for details
- Automatic layout and sizing

### RiskPanel

Displays detailed risk analysis for selected files:
- Risk score and level
- Merge conflict probability
- Sprint impact assessment
- Risk factors list
- "Apply Bob AI Refactor" button

### SprintSurvivalScore

Shows overall sprint health:
- Probability gauge (0-100%)
- Status indicator (Healthy/At Risk/Critical)
- High-risk file count
- Recommendations

### RefactorViewer

Modal for viewing and applying AI-generated refactors:
- Side-by-side code diff
- List of changes made
- Migration steps
- Complexity improvement metrics
- Apply/Reject actions

## API Integration

The frontend communicates with the FastAPI backend via REST:

```typescript
// Scan repository
await repositoryApi.scanRepository('/path/to/repo');

// Analyze file
await analysisApi.analyzeFile('src/App.tsx');

// Generate refactor
await refactorApi.generateRefactor('src/App.tsx', issues);

// Apply refactor
await refactorApi.applyRefactor(refactorId);
```

## Styling

Uses TailwindCSS with custom theme:

```javascript
// Custom colors
colors: {
  risk: {
    low: '#4ade80',      // Green
    medium: '#fbbf24',   // Yellow
    high: '#ef4444',     // Red
    critical: '#dc2626'  // Dark red
  }
}
```

## Development Tips

### Hot Reload

Vite provides instant hot module replacement (HMR). Changes to components will reflect immediately without full page reload.

### TypeScript

All components are fully typed. Use the types from `src/types/index.ts`:

```typescript
import type { FileNode, RiskScore, RefactorResult } from './types';
```

### D3.js Integration

The CodebaseMap component uses D3.js v7 with React refs:

```typescript
const svgRef = useRef<SVGSVGElement>(null);

useEffect(() => {
  const svg = d3.select(svgRef.current);
  // D3 code here
}, [data]);
```

### API Error Handling

All API calls include error handling:

```typescript
try {
  const result = await api.someCall();
} catch (err: any) {
  setError(err.message || 'Operation failed');
}
```

## Troubleshooting

### Port Already in Use

If port 5173 is busy:

```bash
# Use different port
npm run dev -- --port 3000
```

### API Connection Failed

1. Verify backend is running: `http://localhost:8000/health`
2. Check CORS settings in backend
3. Verify `VITE_API_BASE_URL` in `.env`

### TypeScript Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

```bash
# Clean build
rm -rf dist
npm run build
```

## Performance Optimization

### Code Splitting

Vite automatically splits code by route. Large components are lazy-loaded:

```typescript
const CodebaseMap = lazy(() => import('./components/CodebaseMap'));
```

### D3.js Performance

For large codebases (1000+ files):
- Limit sunburst depth to 3 levels
- Use `useMemo` for data transformations
- Debounce interactions

### API Caching

Use React Query for automatic caching:

```typescript
const { data } = useQuery('repository', () => 
  repositoryApi.getRepositoryTree()
);
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Create feature branch
2. Make changes
3. Run linter: `npm run lint`
4. Test thoroughly
5. Submit PR

## License

Copyright © 2026 IBM Corporation. All rights reserved.

## Support

For issues or questions:
- GitHub Issues: [devpulse/issues](https://github.com/ibm-consulting/devpulse/issues)
- Email: devpulse-support@ibm.com