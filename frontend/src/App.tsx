import { useState } from 'react';
import { Loader2, FolderOpen, AlertCircle, Activity, ShieldAlert, Sparkles, Database } from 'lucide-react';
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

const UNSUPPORTED_REFACTOR_EXTENSIONS = new Set([
  '.xlsx', '.xls', '.xlsm', '.xlsb', '.ods',
  '.doc', '.docx', '.ppt', '.pptx', '.pdf',
  '.zip', '.rar', '.7z', '.tar', '.gz', '.bz2', '.xz',
  '.exe', '.dll', '.so', '.dylib', '.bin',
  '.db', '.sqlite', '.sqlite3', '.jar', '.war'
]);

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

  const convertToSunburst = (repo: RepositoryData): FileNode => {
    const root: FileNode = {
      name: repo.name,
      children: [],
    };

    const dirMap = new Map<string, FileNode>();
    const topLevelFilesBucket: FileNode = {
      name: 'Root Files',
      path: '__root_files__',
      children: [],
    };

    repo.files.forEach((file) => {
      const normalizedPath = file.path.replace(/\\/g, '/');
      const parts = normalizedPath.split('/').filter(Boolean);

      const fileNode: FileNode = {
        name: parts[parts.length - 1] || normalizedPath,
        path: normalizedPath,
        value: file.loc,
        complexity: file.complexity,
        risk: file.risk_score,
        riskLevel: file.risk_level,
      };

      if (parts.length === 1) {
        topLevelFilesBucket.children = topLevelFilesBucket.children || [];
        topLevelFilesBucket.children.push(fileNode);
        return;
      }

      let currentPath = '';
      let currentNode = root;

      for (let i = 0; i < parts.length - 1; i++) {
        currentPath += (currentPath ? '/' : '') + parts[i];

        if (!dirMap.has(currentPath)) {
          const newNode: FileNode = {
            name: parts[i],
            path: currentPath,
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

      currentNode.children = currentNode.children || [];
      currentNode.children.push(fileNode);
    });

    if (topLevelFilesBucket.children?.length) {
      root.children?.unshift(topLevelFilesBucket);
    }

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

        const risks = await analysisApi.getRisks();
        setSprintSurvival(risks.sprint_survival);
        setIsScanning(false);
      } else {
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

    setError(null);
    setRefactorResult(null);
    setRiskScore(null);

    try {
      const normalizedTargetPath = file.path.replace(/\\/g, '/');
      const fileInfo = repository?.files.find(
        (f) =>
          f.path === file.path ||
          f.path.replace(/\\/g, '/') === normalizedTargetPath ||
          normalizedTargetPath.endsWith(f.path.replace(/\\/g, '/'))
      );

      if (!fileInfo) {
        throw new Error(`Could not resolve selected file in repository: ${file.path}`);
      }

      setSelectedFile(fileInfo);
      const analysis = await analysisApi.analyzeFile(fileInfo.path);
      setRiskScore(analysis.risk_score);
    } catch (err: any) {
      console.error('Error analyzing file:', err);
      setSelectedFile(null);
      setRiskScore(null);
      setError('Failed to analyze file for the selected chart segment');
    }
  };

  const handleRefactorClick = async () => {
    if (!riskScore) return;

    const normalizedFile = riskScore.file.toLowerCase().replace(/\\/g, '/');
    const extensionMatch = normalizedFile.match(/\.[^./]+$/);
    const extension = extensionMatch ? extensionMatch[0] : '';

    if (UNSUPPORTED_REFACTOR_EXTENSIONS.has(extension)) {
      setError(`ICA Agent refactor is only available for text/code files. "${riskScore.file}" is not supported.`);
      return;
    }

    setIsRefactoring(true);
    setError(null);

    try {
      const response = await refactorApi.generateRefactor(riskScore.file, []);

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

  const highRiskFiles = repository?.files.filter(
    (f) => f.risk_level === 'high' || f.risk_level === 'critical'
  ).length ?? 0;

  const statCards = repository
    ? [
        {
          label: 'Total Files',
          value: repository.total_files.toLocaleString(),
          icon: Database,
          accent: 'from-cyan-400/20 to-cyan-500/5',
          iconColor: 'text-cyan-300',
        },
        {
          label: 'Lines of Code',
          value: repository.total_loc.toLocaleString(),
          icon: Activity,
          accent: 'from-violet-400/20 to-violet-500/5',
          iconColor: 'text-violet-300',
        },
        {
          label: 'High Risk Files',
          value: highRiskFiles.toLocaleString(),
          icon: ShieldAlert,
          accent: 'from-rose-400/20 to-rose-500/5',
          iconColor: 'text-rose-300',
        },
        {
          label: 'Repository',
          value: repository.name,
          icon: Sparkles,
          accent: 'from-fuchsia-400/20 to-fuchsia-500/5',
          iconColor: 'text-fuchsia-300',
          isRepo: true,
        },
      ]
    : [];

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-100">
      <div className="glow-orb left-[-8rem] top-16 h-72 w-72 bg-cyan-400/20" />
      <div className="glow-orb right-[-6rem] top-40 h-80 w-80 bg-violet-500/20" />
      <div className="glow-orb bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 bg-fuchsia-500/10" />

      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/45 backdrop-blur-2xl">
        <div className="mx-auto flex w-full max-w-[1680px] items-center justify-between px-5 py-4 sm:px-8 2xl:max-w-[1820px] 2xl:px-10">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/30 bg-gradient-to-br from-cyan-300 via-sky-400 to-violet-500 shadow-[0_0_30px_rgba(56,189,248,0.25)]">
              <span className="text-xl font-black text-slate-950">D</span>
            </div>
            <div>
              <div className="section-label mb-1">DevPulse Control Layer</div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">DevPulse</h1>
            </div>
          </div>

          <div className="status-pill border-emerald-400/20 bg-emerald-400/10 text-emerald-100">
            <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.95)]" />
            System Operational
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-[1680px] flex-col gap-8 px-5 py-8 sm:px-8 lg:py-10 2xl:max-w-[1820px] 2xl:px-10">
        <section className="glass-panel-strong relative overflow-hidden p-8 sm:p-10 xl:p-12">
          <div className="glow-orb -right-8 top-0 h-44 w-44 bg-cyan-400/15" />
          <div className="glow-orb left-16 top-10 h-36 w-36 bg-violet-500/15" />
          <div className="relative max-w-5xl">
            <div className="section-label mb-3">AI-Powered Sprint Intelligence</div>
            <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl xl:max-w-4xl xl:text-6xl">
              Sleek repository intelligence for architecture risk, sprint survival, and safe refactors.
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg xl:text-[1.1rem]">
              Analyze local repositories, surface hotspots, and generate guided AI refactors inside a premium command-center experience.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="status-pill">
                <Sparkles className="h-4 w-4 text-cyan-300" />
                Neon analytics UI
              </div>
              <div className="status-pill">
                <ShieldAlert className="h-4 w-4 text-rose-300" />
                Risk-aware insights
              </div>
              <div className="status-pill">
                <Activity className="h-4 w-4 text-violet-300" />
                Live architecture telemetry
              </div>
            </div>
          </div>
        </section>

        {!repository && (
          <section className="glass-panel-strong mx-auto w-full max-w-3xl overflow-hidden p-8 sm:p-10">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-300/25 bg-cyan-400/10 shadow-[0_0_40px_rgba(34,211,238,0.2)]">
                <FolderOpen className="h-10 w-10 text-cyan-300" />
              </div>
              <div className="section-label mb-2">Repository Onboarding</div>
              <h3 className="text-3xl font-semibold text-white">Scan Your Repository</h3>
              <p className="mx-auto mt-3 max-w-xl text-slate-300">
                Point DevPulse to your local codebase to generate a premium architecture health and risk intelligence dashboard.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Repository Path</label>
                <input
                  type="text"
                  value={repositoryPath}
                  onChange={(e) => setRepositoryPath(e.target.value)}
                  placeholder="C:\projects\my-react-app"
                  className="input-dark"
                  disabled={isScanning}
                />
              </div>

              {error && (
                <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-rose-100 backdrop-blur-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-300" />
                    <p className="text-sm leading-6">{error}</p>
                  </div>
                </div>
              )}

              <button onClick={handleScan} disabled={isScanning} className="btn-primary w-full gap-2">
                {isScanning ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Scanning Repository...</span>
                  </>
                ) : (
                  <>
                    <FolderOpen className="h-5 w-5" />
                    <span>Launch Deep Scan</span>
                  </>
                )}
              </button>
            </div>
          </section>
        )}

        {repository && sunburstData && (
          <section className="space-y-6">
            {error && (
              <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-rose-100 backdrop-blur-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-300" />
                  <p className="text-sm leading-6">{error}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-4">
              {statCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className="glass-panel relative overflow-hidden p-6 xl:p-7">
                    <div className={`absolute inset-0 bg-gradient-to-br ${card.accent}`} />
                    <div className="relative flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="section-label">{card.label}</div>
                        <div
                          className={`font-semibold text-white ${
                            card.isRepo ? 'truncate text-2xl xl:text-[1.75rem]' : 'text-4xl xl:text-5xl'
                          }`}
                        >
                          {card.value}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                        <Icon className={`h-5 w-5 ${card.iconColor}`} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-6">
              <CodebaseMap data={sunburstData} onFileClick={handleFileClick} />

              <div className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
                <SprintSurvivalScore sprintSurvival={sprintSurvival} />
                <RiskPanel
                  riskScore={riskScore}
                  onRefactorClick={handleRefactorClick}
                  isRefactoring={isRefactoring}
                  error={error}
                />
              </div>
            </div>
          </section>
        )}
      </main>

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
