import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default async function AgentsPage(): Promise<JSX.Element> {
  let agents: Array<{ id: string; name: string; description: string; createdAt: string }> = [];
  try {
    const response = await fetch(`${API}/api/agents`, { cache: 'no-store' });
    if (response.ok) agents = (await response.json()) as typeof agents;
  } catch {
    // API unavailable
  }

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="page-title">Agents</h1>
          <p className="mt-1 text-sm text-slate-500">{agents.length} agent{agents.length !== 1 ? 's' : ''} configured</p>
        </div>
        <Link className="btn-primary" href="/agents/new">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          New Agent
        </Link>
      </div>

      {agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <svg className="h-7 w-7 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-base font-semibold text-slate-700">No agents yet</p>
          <p className="mt-1 text-sm text-slate-500">Create your first agent to get started.</p>
          <Link className="btn-primary mt-6" href="/agents/new">Create your first agent</Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <Link
              key={agent.id}
              href={`/agents/${agent.id}`}
              className="card shadow-card flex flex-col gap-3 p-5 transition-shadow hover:shadow-card-hover group"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">
                    {agent.name}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{agent.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-xs text-slate-400">
                  {new Date(agent.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="text-xs font-medium text-indigo-600 group-hover:underline">View →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

