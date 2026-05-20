import axios from 'axios';
import type {
  ScanRequest,
  ScanResponse,
  RepositoryData,
  RiskScore,
  SprintSurvival,
  RefactorRequest,
  RefactorResponse,
  RefactorResult,
  CodeIssue,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Repository API
export const repositoryApi = {
  /**
   * Scan a local repository
   */
  scanRepository: async (path: string): Promise<ScanResponse> => {
    const response = await apiClient.post<ScanResponse>('/repository/scan', { path });
    return response.data;
  },

  /**
   * Get scan status by ID
   */
  getScanStatus: async (scanId: string): Promise<ScanResponse> => {
    const response = await apiClient.get<ScanResponse>(`/repository/scan/${scanId}`);
    return response.data;
  },

  /**
   * Get repository tree structure
   */
  getRepositoryTree: async (): Promise<RepositoryData> => {
    const response = await apiClient.get<RepositoryData>('/repository/tree');
    return response.data;
  },

  /**
   * Get repository summary
   */
  getRepositorySummary: async (): Promise<RepositoryData> => {
    const response = await apiClient.get<RepositoryData>('/repository/summary');
    return response.data;
  },
};

// Analysis API
export const analysisApi = {
  /**
   * Analyze a specific file
   */
  analyzeFile: async (filePath: string): Promise<{ audit_result: any; risk_score: RiskScore }> => {
    const response = await apiClient.post('/analysis/file', { file_path: filePath });
    return response.data;
  },

  /**
   * Get all risk analysis
   */
  getRisks: async (): Promise<{ high_risk_files: RiskScore[]; sprint_survival: SprintSurvival }> => {
    const response = await apiClient.get('/analysis/risks');
    return response.data;
  },

  /**
   * Get sprint survival probability
   */
  getSprintSurvival: async (): Promise<SprintSurvival> => {
    const response = await apiClient.get<SprintSurvival>('/analysis/sprint-survival');
    return response.data;
  },

  /**
   * Get file risk score
   */
  getFileRisk: async (filePath: string): Promise<RiskScore> => {
    const response = await apiClient.get<RiskScore>(`/analysis/risk/${encodeURIComponent(filePath)}`);
    return response.data;
  },
};

// Refactor API
export const refactorApi = {
  /**
   * Generate refactored code for a file
   */
  generateRefactor: async (filePath: string, issues: CodeIssue[]): Promise<RefactorResponse> => {
    const response = await apiClient.post<RefactorResponse>('/refactor/generate', {
      file_path: filePath,
      issues,
    });
    return response.data;
  },

  /**
   * Get refactor result by ID
   */
  getRefactor: async (refactorId: string): Promise<RefactorResult> => {
    const response = await apiClient.get<RefactorResult>(`/refactor/${refactorId}`);
    return response.data;
  },

  /**
   * Apply refactor to file
   */
  applyRefactor: async (refactorId: string): Promise<{ success: boolean; files_modified: string[] }> => {
    const response = await apiClient.post(`/refactor/apply`, { refactor_id: refactorId });
    return response.data;
  },

  /**
   * Reject refactor
   */
  rejectRefactor: async (refactorId: string): Promise<{ success: boolean }> => {
    const response = await apiClient.post(`/refactor/reject`, { refactor_id: refactorId });
    return response.data;
  },
};

// Health check
export const healthCheck = async (): Promise<{ status: string }> => {
  const response = await apiClient.get('/health');
  return response.data;
};

export default apiClient;

// Made with Bob
