'use client';

import { useState } from 'react';

export function DeploymentPanel(): JSX.Element {
  const [logs, setLogs] = useState<string[]>([]);

  const deploy = async () => {
    const response = await fetch('http://localhost:4000/api/deploy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId: 'replace-agent-id', orgId: 'replace-org-id' })
    });
    const json = (await response.json()) as { logs?: string[]; message?: string };
    setLogs(json.logs ?? [json.message ?? 'No logs returned']);
  };

  return (
    <section className="space-y-4 rounded-lg border bg-white p-6">
      <button className="rounded bg-indigo-600 px-4 py-2 text-white" onClick={deploy} type="button">
        Deploy to Salesforce
      </button>
      <pre className="max-h-80 overflow-y-auto rounded bg-slate-950 p-3 text-xs text-emerald-300">{logs.join('\n')}</pre>
    </section>
  );
}
