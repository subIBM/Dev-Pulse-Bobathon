import React from 'react';
import { AlertTriangle, GitBranch, Activity, Calendar, Sparkles } from 'lucide-react';
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
      <div className="glass-panel-strong p-6">
        <div className="text-center py-12">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/8">
            <AlertTriangle className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">No File Selected</h3>
          <p className="mt-2 text-sm text-slate-400">
            Select a segment from the architecture map to unlock file-level risk intelligence.
          </p>
        </div>
      </div>
    );
  }

  const riskPercentage = (riskScore.risk_score * 100).toFixed(0);
  const conflictProbability = (riskScore.merge_conflict_probability * 100).toFixed(0);

  return (
    <div className="glass-panel-strong space-y-6 p-6">
      <div className="border-b border-white/10 pb-5">
        <div className="mb-2 section-label">Risk Intelligence</div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white">Risk Analysis</h3>
            <p className="code-pill mt-3 break-all">{riskScore.file}</p>
          </div>
          <span className={getRiskBadgeClass(riskScore.risk_level)}>{riskScore.risk_level}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="metric-tile bg-cyan-400/8">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-300">
            <Activity className="h-4 w-4 text-cyan-300" />
            Risk Score
          </div>
          <div className="text-3xl font-semibold text-white">{riskPercentage}%</div>
        </div>

        <div className="metric-tile bg-violet-400/8">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-300">
            <GitBranch className="h-4 w-4 text-violet-300" />
            Conflict Probability
          </div>
          <div className="text-3xl font-semibold text-white">{conflictProbability}%</div>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-300" />
          <div>
            <h4 className="font-semibold text-amber-100">Sprint Impact</h4>
            <p className="mt-1 text-sm leading-6 text-amber-50/90">{riskScore.sprint_impact}</p>
          </div>
        </div>
      </div>

      {riskScore.predicted_conflict_date && (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-rose-300" />
            <div>
              <span className="text-sm font-medium text-rose-100">Predicted Conflict Date</span>
              <div className="mt-1 text-sm text-rose-50/90">{riskScore.predicted_conflict_date}</div>
            </div>
          </div>
        </div>
      )}

      <div>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
          Risk Factors
        </h4>
        <ul className="space-y-3">
          {riskScore.reasons.map((reason, index) => (
            <li
              key={index}
              className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-slate-200 backdrop-blur-xl"
            >
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-rose-300 shadow-[0_0_12px_rgba(253,164,175,0.9)]" />
                <span>{reason}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-white/10 pt-4">
        <button onClick={onRefactorClick} disabled={isRefactoring} className="btn-primary w-full gap-2">
          {isRefactoring ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-slate-950" />
              <span>Bob AI Analyzing...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Generate Neon Refactor</span>
            </>
          )}
        </button>
        <p className="mt-3 text-center text-xs text-slate-400">
          AI will generate a safer structure to reduce complexity and refactor risk.
        </p>
      </div>
    </div>
  );
};

export default RiskPanel;

// Made with Bob
