import React from 'react';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import type { SprintSurvival } from '../types';

interface SprintSurvivalScoreProps {
  sprintSurvival: SprintSurvival | null;
}

export const SprintSurvivalScore: React.FC<SprintSurvivalScoreProps> = ({ sprintSurvival }) => {
  if (!sprintSurvival) {
    return (
      <div className="glass-panel-strong p-6">
        <div className="text-center py-8">
          <AlertCircle className="mx-auto mb-3 h-12 w-12 text-slate-400" />
          <p className="text-sm text-slate-400">No sprint data available</p>
        </div>
      </div>
    );
  }

  const probability = sprintSurvival.probability * 100;
  const isHealthy = probability >= 80;
  const isWarning = probability >= 60 && probability < 80;

  const getColorClass = () => {
    if (isHealthy) return 'text-emerald-300';
    if (isWarning) return 'text-amber-300';
    return 'text-rose-300';
  };

  const getTrackClass = () => {
    if (isHealthy) return 'from-emerald-400 via-cyan-400 to-cyan-300';
    if (isWarning) return 'from-amber-300 via-orange-400 to-amber-500';
    return 'from-rose-400 via-pink-500 to-red-500';
  };

  const getStatusClass = () => {
    if (isHealthy) return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100';
    if (isWarning) return 'border-amber-400/20 bg-amber-400/10 text-amber-100';
    return 'border-rose-400/20 bg-rose-400/10 text-rose-100';
  };

  const getIcon = () => {
    if (isHealthy) return <TrendingUp className="h-8 w-8" />;
    if (isWarning) return <AlertCircle className="h-8 w-8" />;
    return <TrendingDown className="h-8 w-8" />;
  };

  const getStatusText = () => {
    if (isHealthy) return 'Healthy';
    if (isWarning) return 'At Risk';
    return 'Critical';
  };

  return (
    <div className="glass-panel-strong overflow-hidden p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="section-label mb-2">Sprint Health</div>
          <h3 className="text-xl font-semibold text-white">Sprint Survival Probability</h3>
        </div>
        <div className={getColorClass()}>{getIcon()}</div>
      </div>

      <div className="mb-6 rounded-3xl border border-white/10 bg-white/6 p-6 text-center backdrop-blur-xl">
        <div className="flex items-end justify-center gap-2">
          <span className={`text-6xl font-semibold ${getColorClass()}`}>{probability.toFixed(0)}</span>
          <span className={`mb-2 text-3xl font-semibold ${getColorClass()}`}>%</span>
        </div>
        <div className="mt-3">
          <span className={`inline-flex rounded-full border px-4 py-1 text-sm font-semibold ${getStatusClass()}`}>
            {getStatusText()}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-900/80">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${getTrackClass()} shadow-[0_0_18px_rgba(56,189,248,0.4)] transition-all duration-500`}
            style={{ width: `${probability}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="metric-tile">
          <div className="text-xs uppercase tracking-[0.18em] text-slate-400">High Risk Files</div>
          <div className="mt-2 text-2xl font-semibold text-white">
            {sprintSurvival.high_risk_files.length}
          </div>
        </div>
        <div className="metric-tile">
          <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Total Risks</div>
          <div className="mt-2 text-2xl font-semibold text-white">{sprintSurvival.total_risks}</div>
        </div>
      </div>

      {sprintSurvival.recommendation && (
        <div className="mt-5 rounded-2xl border border-cyan-400/15 bg-cyan-400/8 p-4 backdrop-blur-xl">
          <h4 className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">
            Recommendation
          </h4>
          <p className="text-sm leading-6 text-slate-200">{sprintSurvival.recommendation}</p>
        </div>
      )}

      {sprintSurvival.high_risk_files.length > 0 && (
        <div className="mt-5 border-t border-white/10 pt-5">
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
            High Risk Files
          </h4>
          <div className="flex flex-wrap gap-2">
            {sprintSurvival.high_risk_files.slice(0, 5).map((file, index) => (
              <span
                key={index}
                className="inline-flex max-w-full rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs text-slate-200"
                title={file}
              >
                <span className="truncate font-mono">{file}</span>
              </span>
            ))}
            {sprintSurvival.high_risk_files.length > 5 && (
              <span className="inline-flex rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs text-slate-400">
                +{sprintSurvival.high_risk_files.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SprintSurvivalScore;

// Made with Bob
