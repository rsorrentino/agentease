'use client';

import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface PreviewResult {
  success: boolean;
  logs: string[];
  errors: string[];
}

export function PreviewAgentButton({ agentId }: { agentId: string }): JSX.Element {
  const [status, setStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [result, setResult] = useState<PreviewResult | null>(null);

  const run = async () => {
    setStatus('running');
    setResult(null);
    try {
      const res = await fetch(`${API}/api/agents/${agentId}/preview`, { method: 'POST' });
      const json = (await res.json()) as PreviewResult & { message?: string };
      if (!res.ok) throw new Error(json.message ?? 'Preview failed');
      setResult(json);
      setStatus('done');
    } catch (err) {
      setResult({ success: false, logs: [], errors: [(err as Error).message] });
      setStatus('error');
    }
  };

  return (
    <div className="space-y-3">
      <button
        className="btn-secondary w-full justify-center"
        disabled={status === 'running'}
        onClick={run}
        type="button"
      >
        {status === 'running' ? (
          <>
            <svg className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
            </svg>
            Previewing…
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Preview via CLI
          </>
        )}
      </button>

      {result && (
        <div className={`rounded-lg border p-3 text-xs ${result.success ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
          <p className={`mb-1.5 font-semibold ${result.success ? 'text-emerald-700' : 'text-red-700'}`}>
            {result.success ? '✓ Preview succeeded' : '✗ Preview failed'}
          </p>
          {result.errors.length > 0 && (
            <pre className="mb-1.5 whitespace-pre-wrap text-red-600">{result.errors.join('\n')}</pre>
          )}
          {result.logs.length > 0 && (
            <pre className="max-h-40 overflow-y-auto rounded border border-slate-800 bg-slate-950 p-2 leading-5 text-emerald-300">
              {result.logs.join('\n')}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
