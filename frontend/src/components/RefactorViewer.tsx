import React, { useState } from 'react';
import { Check, X, Copy, Sparkles } from 'lucide-react';
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

  const tabClass = (tab: 'diff' | 'changes' | 'migration') =>
    `rounded-full px-4 py-2 text-sm font-medium transition ${
      activeTab === tab
        ? 'bg-cyan-400/15 text-cyan-200 border border-cyan-300/20'
        : 'text-slate-400 hover:bg-white/8 hover:text-slate-200'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md">
      <div className="glass-panel-strong flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden">
        <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-r from-cyan-400/12 via-violet-500/12 to-fuchsia-500/12 p-6">
          <div className="glow-orb right-8 top-4 h-32 w-32 bg-cyan-400/15" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <div className="section-label mb-2">AI Refactor Output</div>
              <h2 className="mb-2 text-2xl font-semibold text-white">Bob AI Refactor Complete</h2>
              <p className="code-pill">{refactorResult.file_path}</p>
            </div>
            <button
              onClick={onReject}
              className="rounded-full border border-white/10 bg-white/8 p-2 text-slate-200 transition hover:bg-white/12"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="relative mt-5 inline-flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/8 px-5 py-3 backdrop-blur-xl">
            <Sparkles className="h-5 w-5 text-cyan-300" />
            <div className="text-center">
              <div className="text-2xl font-semibold text-white">{improvement.before}</div>
              <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Before</div>
            </div>
            <div className="text-xl text-slate-500">→</div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-white">{improvement.after}</div>
              <div className="text-xs uppercase tracking-[0.16em] text-slate-400">After</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-emerald-300">-{reductionPercentage}%</div>
              <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Complexity</div>
            </div>
          </div>
        </div>

        <div className="border-b border-white/10 bg-slate-950/50 px-6 py-4">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setActiveTab('diff')} className={tabClass('diff')}>
              Code Diff
            </button>
            <button onClick={() => setActiveTab('changes')} className={tabClass('changes')}>
              Changes ({refactorResult.changes.length})
            </button>
            <button onClick={() => setActiveTab('migration')} className={tabClass('migration')}>
              Migration Steps
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 text-slate-200">
          {activeTab === 'diff' && (
            <div className="space-y-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Side-by-Side Comparison</h3>
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200 transition hover:bg-cyan-400/15"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied!' : 'Copy Refactored Code'}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <div>
                  <div className="rounded-t-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3">
                    <span className="text-sm font-semibold text-rose-100">Original Code</span>
                  </div>
                  <pre className="max-h-96 overflow-auto rounded-b-2xl border border-t-0 border-white/10 bg-slate-950/90 p-4 text-sm text-slate-100">
                    {refactorResult.original_code}
                  </pre>
                </div>

                <div>
                  <div className="rounded-t-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3">
                    <span className="text-sm font-semibold text-emerald-100">Refactored Code</span>
                  </div>
                  <pre className="max-h-96 overflow-auto rounded-b-2xl border border-t-0 border-white/10 bg-slate-950/90 p-4 text-sm text-slate-100">
                    {refactorResult.refactored_code}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'changes' && (
            <div className="space-y-4">
              <h3 className="mb-4 text-lg font-semibold text-white">Changes Made</h3>
              {refactorResult.changes.map((change, index) => (
                <div key={index} className="rounded-2xl border border-white/10 bg-white/6 p-4 backdrop-blur-xl">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-400/10 font-semibold text-cyan-200">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="rounded-full border border-violet-300/20 bg-violet-400/10 px-3 py-1 text-xs font-semibold text-violet-200">
                          {change.type.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-slate-200">{change.description}</p>
                      {change.files_created && change.files_created.length > 0 && (
                        <div className="mt-3">
                          <span className="text-sm font-medium text-slate-300">Files Created</span>
                          <ul className="mt-2 space-y-1">
                            {change.files_created.map((file, idx) => (
                              <li key={idx} className="font-mono text-sm text-cyan-200">
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
              <h3 className="mb-4 text-lg font-semibold text-white">Migration Steps</h3>
              <div className="rounded-2xl border border-cyan-300/15 bg-cyan-400/8 p-4">
                <p className="text-sm text-cyan-100">
                  Follow these steps to safely apply the refactoring to your codebase.
                </p>
              </div>
              <ol className="space-y-3">
                {refactorResult.migration_steps.map((step, index) => (
                  <li key={index} className="flex gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 font-semibold text-slate-950">
                      {index + 1}
                    </div>
                    <div className="flex-1 rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
                      <p className="text-slate-200">{step}</p>
                    </div>
                  </li>
                ))}
              </ol>

              {refactorResult.test_code && (
                <div className="mt-6 border-t border-white/10 pt-6">
                  <h4 className="mb-3 text-base font-semibold text-white">Generated Tests</h4>
                  <pre className="max-h-64 overflow-auto rounded-2xl border border-white/10 bg-slate-950/90 p-4 text-sm text-slate-100">
                    {refactorResult.test_code}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-white/10 bg-slate-950/50 p-6">
          <button onClick={onReject} className="btn-secondary gap-2" disabled={isApplying}>
            <X className="h-4 w-4" />
            Cancel
          </button>

          <button onClick={onApply} disabled={isApplying} className="btn-primary gap-2">
            {isApplying ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-slate-950" />
                <span>Applying...</span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
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
