import { useState } from 'react';
import { Loader2, FolderOpen, AlertCircle } from 'lucide-react';
import CodebaseMap from './components/CodebaseMap';
import RiskPanel from './components/RiskPanel';
import SprintSurvivalScore from './components/SprintSurvivalScore';
import RefactorViewer from './components/RefactorViewer';
import { repositoryApi, analysisApi, refactorApi } from './services/api';
import type {
  FileNode,
  RepositoryData,
  RiskScore,
  SprintSurvival,
  RefactorResult,
  FileInfo,
} from './types';

function App() {
  const [isScanning, setIsScanning] = useState(false);
  const [repositoryPath, setRepositoryPath] = useState('');
  const [repository, setRepository] = useState<RepositoryData | null>(null);
  const [sunburstData, setSunburstData] = useState<FileNode | null>(null);
  const [, setSelectedFile] = useState<FileInfo | null>(null);
  const [riskScore, setRiskScore] = useState<RiskScore | null>(null);
  const [sprintSurvival, setSprintSurvival] = useState<SprintSurvival | null>(null);
  const [refactorResult, setRefactorResult] = useState<RefactorResult | null>(null);
  const [isRefactoring, setIsRefactoring] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convert repository data to sunburst format
  const convertToSunburst = (repo: RepositoryData): FileNode => {
    const root: FileNode = {
      name: repo.name,
      children: [],
    };

    // Group files by directory
    const dirMap = new Map<string, FileNode>();

    repo.files.forEach((file) => {
      const parts = file.path.split('/');
      let currentPath = '';
      let currentNode = root;

      // Build directory structure
      for (let i = 0; i < parts.length - 1; i++) {
        currentPath += (currentPath ? '/' : '') + parts[i];
        
        if (!dirMap.has(currentPath)) {
          const newNode: FileNode = {
            name: parts[i],
            children: [],
          };
          dirMap.set(currentPath, newNode);
          currentNode.children = currentNode.children || [];
          currentNode.children.push(newNode);
          currentNode = newNode;
        } else {
          currentNode = dirMap.get(currentPath)!;
        }
      }

      // Add file node
      const fileNode: FileNode = {
        name: parts[parts.length - 1],
        path: file.path,
        value: file.loc,
        complexity: file.complexity,
        risk: file.risk_score,
        riskLevel: file.risk_level,
      };
      currentNode.children = currentNode.children || [];
      currentNode.children.push(fileNode);
    });

    return root;
  };

  const handleScan = async () => {
    if (!repositoryPath.trim()) {
      setError('Please enter a repository path');
      return;
    }

    setIsScanning(true);
    setError(null);

    try {
      const response = await repositoryApi.scanRepository(repositoryPath);
      
      if (response.status === 'complete' && response.data) {
        setRepository(response.data);
        setSunburstData(convertToSunburst(response.data));
        
        // Get sprint survival data
        const risks = await analysisApi.getRisks();
        setSprintSurvival(risks.sprint_survival);
      } else {
        // Poll for completion
        const pollInterval = setInterval(async () => {
          const status = await repositoryApi.getScanStatus(response.scan_id);
          if (status.status === 'complete' && status.data) {
            clearInterval(pollInterval);
            setRepository(status.data);
            setSunburstData(convertToSunburst(status.data));
            
            const risks = await analysisApi.getRisks();
            setSprintSurvival(risks.sprint_survival);
            setIsScanning(false);
          } else if (status.status === 'failed') {
            clearInterval(pollInterval);
            setError('Scan failed: ' + (status.message || 'Unknown error'));
            setIsScanning(false);
          }
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to scan repository');
      setIsScanning(false);
    }
  };

  const handleFileClick = async (file: FileNode) => {
    if (!file.path) return;

    try {
      // Find full file info
      const fileInfo = repository?.files.find(f => f.path === file.path);
      if (fileInfo) {
        setSelectedFile(fileInfo);
        
        // Get detailed risk analysis
        const analysis = await analysisApi.analyzeFile(file.path);
        setRiskScore(analysis.risk_score);
      }
    } catch (err: any) {
      console.error('Error analyzing file:', err);
      setError('Failed to analyze file');
    }
  };

  const handleRefactorClick = async () => {
    if (!riskScore) return;

    setIsRefactoring(true);
    setError(null);

    try {
      const response = await refactorApi.generateRefactor(
        riskScore.file,
        [] // Issues would come from the audit result
      );

      // Poll for refactor completion
      const pollInterval = setInterval(async () => {
        const result = await refactorApi.getRefactor(response.refactor_id);
        if (result.status === 'complete') {
          clearInterval(pollInterval);
          setRefactorResult(result);
          setIsRefactoring(false);
        } else if (result.status === 'rejected') {
          clearInterval(pollInterval);
          setError('Refactor generation failed');
          setIsRefactoring(false);
        }
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to generate refactor');
      setIsRefactoring(false);
    }
  };

  const handleApplyRefactor = async () => {
    if (!refactorResult) return;

    setIsApplying(true);
    setError(null);

    try {
      await refactorApi.applyRefactor(refactorResult.refactor_id);
      
      // Refresh data
      if (repository) {
        const updatedRepo = await repositoryApi.getRepositorySummary();
        setRepository(updatedRepo);
        setSunburstData(convertToSunburst(updatedRepo));
        
        const risks = await analysisApi.getRisks();
        setSprintSurvival(risks.sprint_survival);
      }
      
      setRefactorResult(null);
      setRiskScore(null);
      setSelectedFile(null);
      setIsApplying(false);
    } catch (err: any) {
      setError(err.message || 'Failed to apply refactor');
      setIsApplying(false);
    }
  };

  const handleRejectRefactor = () => {
    setRefactorResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold">D</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">DevPulse</h1>
                <p className="text-sm text-gray-600">AI-Powered Sprint Orchestrator</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>System Operational</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Repository Scanner */}
        {!repository && (
          <div className="card max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <FolderOpen className="w-16 h-16 text-primary-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Scan Your Repository
              </h2>
              <p className="text-gray-600">
                Point DevPulse to your local repository to analyze architecture health
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Repository Path
                </label>
                <input
                  type="text"
                  value={repositoryPath}
                  onChange={(e) => setRepositoryPath(e.target.value)}
                  placeholder="C:\projects\my-react-app"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={isScanning}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <button
                onClick={handleScan}
                disabled={isScanning}
                className={`w-full btn-primary flex items-center justify-center gap-2 ${
                  isScanning ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Scanning Repository...</span>
                  </>
                ) : (
                  <>
                    <FolderOpen className="w-5 h-5" />
                    <span>Start Scan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Dashboard */}
        {repository && sunburstData && (
          <div className="space-y-6">
            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="card">
                <div className="text-sm text-gray-600 mb-1">Total Files</div>
                <div className="text-3xl font-bold text-gray-900">{repository.total_files}</div>
              </div>
              <div className="card">
                <div className="text-sm text-gray-600 mb-1">Lines of Code</div>
                <div className="text-3xl font-bold text-gray-900">
                  {repository.total_loc.toLocaleString()}
                </div>
              </div>
              <div className="card">
                <div className="text-sm text-gray-600 mb-1">High Risk Files</div>
                <div className="text-3xl font-bold text-red-600">
                  {repository.files.filter(f => f.risk_level === 'high' || f.risk_level === 'critical').length}
                </div>
              </div>
              <div className="card">
                <div className="text-sm text-gray-600 mb-1">Repository</div>
                <div className="text-lg font-semibold text-gray-900 truncate">{repository.name}</div>
              </div>
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Visualization */}
              <div className="lg:col-span-2">
                <CodebaseMap
                  data={sunburstData}
                  onFileClick={handleFileClick}
                />
              </div>

              {/* Right Column - Analysis */}
              <div className="space-y-6">
                <SprintSurvivalScore sprintSurvival={sprintSurvival} />
                <RiskPanel
                  riskScore={riskScore}
                  onRefactorClick={handleRefactorClick}
                  isRefactoring={isRefactoring}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Refactor Viewer Modal */}
      {refactorResult && (
        <RefactorViewer
          refactorResult={refactorResult}
          onApply={handleApplyRefactor}
          onReject={handleRejectRefactor}
          isApplying={isApplying}
        />
      )}
    </div>
  );
}

export default App;

// Made with Bob
