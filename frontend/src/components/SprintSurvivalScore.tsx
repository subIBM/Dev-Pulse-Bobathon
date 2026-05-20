import React from 'react';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import type { SprintSurvival } from '../types';

interface SprintSurvivalScoreProps {
  sprintSurvival: SprintSurvival | null;
}

export const SprintSurvivalScore: React.FC<SprintSurvivalScoreProps> = ({ sprintSurvival }) => {
  if (!sprintSurvival) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No sprint data available</p>
        </div>
      </div>
    );
  }

  const probability = sprintSurvival.probability * 100;
  const isHealthy = probability >= 80;
  const isWarning = probability >= 60 && probability < 80;
  const isCritical = probability < 60;

  const getColorClass = () => {
    if (isHealthy) return 'text-green-600';
    if (isWarning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBgClass = () => {
    if (isHealthy) return 'bg-green-50 border-green-200';
    if (isWarning) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getIcon = () => {
    if (isHealthy) return <TrendingUp className="w-8 h-8" />;
    if (isWarning) return <AlertCircle className="w-8 h-8" />;
    return <TrendingDown className="w-8 h-8" />;
  };

  const getStatusText = () => {
    if (isHealthy) return 'Healthy';
    if (isWarning) return 'At Risk';
    return 'Critical';
  };

  return (
    <div className={`card border-2 ${getBgClass()}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">Sprint Survival Probability</h3>
        <div className={getColorClass()}>{getIcon()}</div>
      </div>

      {/* Probability Gauge */}
      <div className="mb-6">
        <div className="flex items-end justify-center gap-2 mb-2">
          <span className={`text-6xl font-bold ${getColorClass()}`}>
            {probability.toFixed(0)}
          </span>
          <span className={`text-3xl font-semibold ${getColorClass()} mb-2`}>%</span>
        </div>
        <div className="text-center">
          <span className={`inline-block px-4 py-1 rounded-full text-sm font-semibold ${getBgClass()} ${getColorClass()}`}>
            {getStatusText()}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              isHealthy ? 'bg-green-500' : isWarning ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${probability}%` }}
          ></div>
        </div>
      </div>

      {/* Risk Summary */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">High Risk Files:</span>
          <span className="font-semibold text-gray-800">
            {sprintSurvival.high_risk_files.length}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total Risks:</span>
          <span className="font-semibold text-gray-800">{sprintSurvival.total_risks}</span>
        </div>
      </div>

      {/* Recommendation */}
      {sprintSurvival.recommendation && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Recommendation:</h4>
          <p className="text-sm text-gray-600">{sprintSurvival.recommendation}</p>
        </div>
      )}

      {/* High Risk Files List */}
      {sprintSurvival.high_risk_files.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">High Risk Files:</h4>
          <ul className="space-y-1">
            {sprintSurvival.high_risk_files.slice(0, 5).map((file, index) => (
              <li key={index} className="text-xs text-gray-600 font-mono truncate">
                • {file}
              </li>
            ))}
            {sprintSurvival.high_risk_files.length > 5 && (
              <li className="text-xs text-gray-500 italic">
                +{sprintSurvival.high_risk_files.length - 5} more files
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SprintSurvivalScore;

// Made with Bob
