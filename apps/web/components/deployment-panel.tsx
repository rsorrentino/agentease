'use client';

import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface AgentOption {
  id: string;
  name: string;
}

interface OrgOption {
  id: string;
  name: string;
}

export function DeploymentPanel(): JSX.Element {
  const [agents, setAgents] = useState<AgentOption[]>([]);
  const [orgs, setOrgs] = useState<OrgOption[]>([]);
  const [agentId, setAgentId] = useState('');
  const [orgId, setOrgId] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [deploying, setDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
