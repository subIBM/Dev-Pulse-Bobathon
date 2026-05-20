// Core data types for DevPulse

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface FileNode {
  name: string;
  path?: string;
  value?: number; // LOC
  complexity?: number;
  risk?: number; // 0-1
  riskLevel?: RiskLevel;
  children?: FileNode[];
}

export interface FileInfo {
  path: string;
  loc: number;
  complexity?: number;
  risk_score?: number;
  risk_level?: RiskLevel;
  last_modified?: string;
  active_branches?: string[];
  contributors?: number;
}

export interface BranchInfo {
  name: string;
  files_touched: number;
  last_commit: string;
}

export interface RepositoryData {
  name: string;
  path: string;
  total_files: number;
  total_loc: number;
  files: FileInfo[];
  branches?: BranchInfo[];
  scan_date?: string;
}

export interface ScanRequest {
  path: string;
}

export interface ScanResponse {
  scan_id: string;
  status: 'processing' | 'complete' | 'failed';
  message?: string;
  data?: RepositoryData;
}

export interface CodeIssue {
  type: 'circular_dependency' | 'high_complexity' | 'code_smell' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  line?: number;
  suggestion?: string;
}

export interface AuditResult {
  file: string;
  issues: CodeIssue[];
  overall_score: number;
  complexity_score?: number;
}

export interface RiskScore {
  file: string;
  risk_score: number;
  risk_level: RiskLevel;
  merge_conflict_probability: number;
  sprint_impact: string;
  reasons: string[];
  predicted_conflict_date?: string;
}

export interface SprintSurvival {
  probability: number;
  high_risk_files: string[];
  total_risks: number;
  recommendation: string;
}

export interface RefactorChange {
  type: 'extract_component' | 'remove_dependency' | 'simplify_logic';
  description: string;
  files_created?: string[];
}

export interface ComplexityImprovement {
  before: number;
  after: number;
  reduction_percentage: number;
}

export interface RefactorResult {
  refactor_id: string;
  file_path: string;
  original_code: string;
  refactored_code: string;
  changes: RefactorChange[];
  complexity_improvement: ComplexityImprovement;
  migration_steps: string[];
  test_code?: string;
  status: 'pending' | 'complete' | 'applied' | 'rejected';
}

export interface RefactorRequest {
  file_path: string;
  issues: CodeIssue[];
}

export interface RefactorResponse {
  refactor_id: string;
  status: string;
  message?: string;
}

export interface AnalysisState {
  isScanning: boolean;
  scanProgress: number;
  repository: RepositoryData | null;
  selectedFile: FileInfo | null;
  riskAnalysis: RiskScore | null;
  sprintSurvival: SprintSurvival | null;
  refactorResult: RefactorResult | null;
  error: string | null;
}

// Made with Bob
