import React from 'react';
import { AlertTriangle, GitBranch, Activity, Calendar } from 'lucide-react';
import type { RiskScore } from '../types';

interface RiskPanelProps {
  riskScore: RiskScore | null;
  onRefactorClick: () => void;
  isRefactoring: boolean;
}

const getRiskBadgeClass = (level: string): string => {
  switch (level) {
    case 'low':
      return 'risk-badge-low';
    case 'medium':
      return 'risk-badge-medium';
    case 'high':
      return 'risk-badge-high';
    case 'critical':
      return 'risk-badge-critical';
    default:
      return 'risk-badge-medium';
  }
};


export const RiskPanel: React.FC<RiskPanelProps> = ({
  riskScore,
  onRefactorClick,
  isRefactoring,
}) => {
  if (!riskScore) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600">No File Selected</h3>
          <p className="text-sm text-gray-500 mt-2">
            Click on a file in the codebase map to view risk analysis
          </p>
        </div>
      </div>
    );
  }

  const riskPercentage = (riskScore.risk_score * 100).toFixed(0);
  const conflictProbability = (riskScore.merge_conflict_probability * 100).toFixed(0);

  return (
    <div className="card space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Risk Analysis</h3>
            <p className="text-sm text-gray-600 font-mono break-all">{riskScore.file}</p>
          </div>
          <span className={getRiskBadgeClass(riskScore.risk_level)}>
            {riskScore.risk_level.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Risk Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-600">Risk Score</span>
          </div>
          <div className="text-3xl font-bold text-gray-800">{riskPercentage}%</div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <GitBranch className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-600">Conflict Probability</span>
          </div>
          <div className="text-3xl font-bold text-orange-600">{conflictProbability}%</div>
        </div>
      </div>

      {/* Sprint Impact */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-yellow-900 mb-1">Sprint Impact</h4>
            <p className="text-sm text-yellow-800">{riskScore.sprint_impact}</p>
          </div>
        </div>
      </div>

      {/* Predicted Conflict Date */}
      {riskScore.predicted_conflict_date && (
        <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <Calendar className="w-5 h-5 text-red-600" />
          <div>
            <span className="text-sm font-medium text-red-900">Predicted Conflict Date:</span>
            <span className="text-sm text-red-700 ml-2">{riskScore.predicted_conflict_date}</span>
          </div>
        </div>
      )}

      {/* Risk Reasons */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-3">Risk Factors</h4>
        <ul className="space-y-2">
          {riskScore.reasons.map((reason, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-red-500 mt-1">•</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Button */}
      <div className="pt-4 border-t">
        <button
          onClick={onRefactorClick}
          disabled={isRefactoring}
          className={`w-full btn-primary flex items-center justify-center gap-2 ${
            isRefactoring ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isRefactoring ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Bob AI Analyzing...</span>
            </>
          ) : (
            <>
              <span>🤖</span>
              <span>Apply Bob AI Refactor</span>
            </>
          )}
        </button>
        <p className="text-xs text-gray-500 text-center mt-2">
          AI will generate refactored code to fix these issues
        </p>
      </div>
    </div>
  );
};

export default RiskPanel;

// Made with Bob
