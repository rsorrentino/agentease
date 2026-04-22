'use client';

import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface AgentOption { id: string; name: string }
interface OrgOption { id: string; name: string }
type DeployStatus = 'idle' | 'deploying' | 'success' | 'error';

export function DeploymentPanel(): JSX.Element {
  const [agents, setAgents] = useState<AgentOption[]>([]);
  const [orgs, setOrgs] = useState<OrgOption[]>([]);
  const [agentId, setAgentId] = useState('');
  const [orgId, setOrgId] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<DeployStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch(`${API}/api/agents`, { cache: 'no-store' })
      .then((r) => r.json()).then((d) => setAgents(d as AgentOption[])).catch(() => null);
    void fetch(`${API}/api/orgs`, { cache: 'no-store' })
      .then((r) => r.json()).then((d) => setOrgs(d as OrgOption[])).catch(() => null);
  }, []);

  const deploy = async () => {
    if (!agentId || !orgId) { setError('Select an agent and an org first.'); return; }
    setError(null);
    setLogs([]);
    setStatus('deploying');
    try {
      const res = await fetch(`${API}/api/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, orgId })
      });
      const json = (await res.json()) as { logs?: string[]; message?: string };
      if (!res.ok) throw new Error(json.message ?? 'Deployment failed');
      setLogs(json.logs ?? ['Deployment complete.']);
      setStatus('success');
    } catch (err) {
      setError((err as Error).message);
      setStatus('error');
    }
  };

  return (
    <div className="card shadow-card flex flex-col" style={{ height: '520px' }}>
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
          <svg className="h-4 w-4 text-indigo-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Deploy to Salesforce</p>
          <p className="text-xs text-slate-500">Push your agent via Agentforce CLI</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        <div>
          <label className="label" htmlFor="deploy-agent">Agent</label>
          <select
            id="deploy-agent"
            className="input"
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
          >
            <option value="">— select agent —</option>
            {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="deploy-org">Salesforce Org</label>
          <select
            id="deploy-org"
            className="input"
            value={orgId}
            onChange={(e) => setOrgId(e.target.value)}
          >
            <option value="">— select org —</option>
            {orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
          {orgs.length === 0 && (
            <p className="mt-1 text-xs text-slate-400">
              No orgs connected yet — connect one via <strong>Auth → Connect Org</strong>.
            </p>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
            <svg className="h-4 w-4 shrink-0 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-sm font-medium text-emerald-700">Deployment successful!</p>
          </div>
        )}

        {logs.length > 0 && (
          <div>
            <p className="label mb-2">Deployment Logs</p>
            <pre className="max-h-40 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs leading-5 text-emerald-300">
              {logs.join('\n')}
            </pre>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 px-5 py-4">
        <button
          className="btn-primary w-full justify-center"
          disabled={status === 'deploying'}
          onClick={deploy}
          type="button"
        >
          {status === 'deploying' ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
              </svg>
              Deploying…
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Deploy to Salesforce
            </>
          )}
        </button>
      </div>
    </div>
  );
}


  useEffect(() => {
    void fetch(`${API}/api/agents`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => setAgents(data as AgentOption[]))
      .catch(() => null);
    void fetch(`${API}/api/orgs`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => setOrgs(data as OrgOption[]))
      .catch(() => null);
  }, []);

  const deploy = async () => {
    if (!agentId || !orgId) {
      setError('Select an agent and a Salesforce org first.');
      return;
    }
    setError(null);
    setDeploying(true);
    setLogs([]);
    try {
      const response = await fetch(`${API}/api/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, orgId })
      });
      const json = (await response.json()) as { logs?: string[]; message?: string };
      if (!response.ok) throw new Error(json.message ?? 'Deployment failed');
      setLogs(json.logs ?? ['Deployment complete.']);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDeploying(false);
    }
  };

  return (
    <section className="space-y-4 rounded-lg border bg-white p-6">
      <h2 className="font-semibold">Deploy to Salesforce</h2>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Agent
          <select
            className="mt-1 w-full rounded border p-2 text-sm"
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
          >
            <option value="">— select agent —</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Salesforce Org
          <select
            className="mt-1 w-full rounded border p-2 text-sm"
            value={orgId}
            onChange={(e) => setOrgId(e.target.value)}
          >
            <option value="">— select org —</option>
            {orgs.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </label>
      </div>

      {orgs.length === 0 && (
        <p className="text-xs text-slate-500">
          No orgs connected yet. Connect one via <span className="font-medium">Settings → Connect Org</span>.
        </p>
      )}

      {error && <p className="rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">{error}</p>}

      <button
        className="rounded bg-indigo-600 px-4 py-2 text-white disabled:opacity-50"
        disabled={deploying}
        onClick={deploy}
        type="button"
      >
        {deploying ? 'Deploying…' : 'Deploy'}
      </button>

      {logs.length > 0 && (
        <pre className="max-h-80 overflow-y-auto rounded bg-slate-950 p-3 text-xs text-emerald-300">
          {logs.join('\n')}
        </pre>
      )}
    </section>
  );
}
