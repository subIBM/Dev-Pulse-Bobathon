import React, { useState } from 'react';
import { Check, X, Download, Copy } from 'lucide-react';
import type { RefactorResult } from '../types';

interface RefactorViewerProps {
  refactorResult: RefactorResult;
  onApply: () => void;
  onReject: () => void;
  isApplying: boolean;
}

export const RefactorViewer: React.FC<RefactorViewerProps> = ({
  refactorResult,
  onApply,
  onReject,
  isApplying,
}) => {
  const [activeTab, setActiveTab] = useState<'diff' | 'changes' | 'migration'>('diff');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(refactorResult.refactored_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const improvement = refactorResult.complexity_improvement;
  const reductionPercentage = improvement.reduction_percentage;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">🤖 Bob AI Refactor Complete</h2>
              <p className="text-primary-100 text-sm font-mono">{refactorResult.file_path}</p>
            </div>
            <button
              onClick={onReject}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Complexity Improvement Badge */}
          <div className="mt-4 inline-flex items-center gap-3 bg-white bg-opacity-20 rounded-lg px-4 py-2">
            <div className="text-center">
              <div className="text-2xl font-bold">{improvement.before}</div>
              <div className="text-xs text-primary-100">Before</div>
            </div>
            <div className="text-2xl">→</div>
            <div className="text-center">
              <div className="text-2xl font-bold">{improvement.after}</div>
              <div className="text-xs text-primary-100">After</div>
            </div>
            <div className="ml-2 text-center">
              <div className="text-2xl font-bold text-green-300">-{reductionPercentage}%</div>
              <div className="text-xs text-primary-100">Complexity</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b bg-gray-50">
          <div className="flex gap-1 px-6">
            <button
              onClick={() => setActiveTab('diff')}
              className={`px-4 py-3 font-medium text-sm transition-colors ${
                activeTab === 'diff'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Code Diff
            </button>
            <button
              onClick={() => setActiveTab('changes')}
              className={`px-4 py-3 font-medium text-sm transition-colors ${
                activeTab === 'changes'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Changes ({refactorResult.changes.length})
            </button>
            <button
              onClick={() => setActiveTab('migration')}
              className={`px-4 py-3 font-medium text-sm transition-colors ${
                activeTab === 'migration'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Migration Steps
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'diff' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Side-by-Side Comparison</h3>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy Refactored Code'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Original Code */}
                <div>
                  <div className="bg-red-50 border border-red-200 rounded-t-lg px-4 py-2">
                    <span className="text-sm font-semibold text-red-800">Original Code</span>
                  </div>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-b-lg overflow-x-auto text-sm font-mono max-h-96 overflow-y-auto">
                    {refactorResult.original_code}
                  </pre>
                </div>

                {/* Refactored Code */}
                <div>
                  <div className="bg-green-50 border border-green-200 rounded-t-lg px-4 py-2">
                    <span className="text-sm font-semibold text-green-800">Refactored Code</span>
                  </div>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-b-lg overflow-x-auto text-sm font-mono max-h-96 overflow-y-auto">
                    {refactorResult.refactored_code}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'changes' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 mb-4">Changes Made</h3>
              {refactorResult.changes.map((change, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                          {change.type.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{change.description}</p>
                      {change.files_created && change.files_created.length > 0 && (
                        <div className="mt-2">
                          <span className="text-sm font-medium text-gray-600">Files Created:</span>
                          <ul className="mt-1 space-y-1">
                            {change.files_created.map((file, idx) => (
                              <li key={idx} className="text-sm text-gray-600 font-mono">
                                + {file}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'migration' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 mb-4">Migration Steps</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  Follow these steps to safely apply the refactoring to your codebase.
                </p>
              </div>
              <ol className="space-y-3">
                {refactorResult.migration_steps.map((step, index) => (
                  <li key={index} className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-gray-700">{step}</p>
                    </div>
                  </li>
                ))}
              </ol>

              {refactorResult.test_code && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold text-gray-800 mb-3">Generated Tests</h4>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono max-h-64 overflow-y-auto">
                    {refactorResult.test_code}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t bg-gray-50 p-6 flex items-center justify-between">
          <button
            onClick={onReject}
            className="btn-secondary flex items-center gap-2"
            disabled={isApplying}
          >
            <X className="w-4 h-4" />
            Cancel
          </button>

          <button
            onClick={onApply}
            disabled={isApplying}
            className={`btn-primary flex items-center gap-2 ${
              isApplying ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isApplying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Applying...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Apply Refactor</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RefactorViewer;

// Made with Bob
