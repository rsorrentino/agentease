import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function getStats() {
  try {
    const [agentsRes, deploymentsRes] = await Promise.all([
      fetch(`${API}/api/agents`, { cache: 'no-store' }),
      fetch(`${API}/api/deployments`, { cache: 'no-store' })
    ]);
    const agents = agentsRes.ok ? ((await agentsRes.json()) as unknown[]) : [];
    const deployments = deploymentsRes.ok ? ((await deploymentsRes.json()) as Array<{ status: string }>) : [];
    return {
      agents: agents.length,
      deployments: deployments.length,
      successful: deployments.filter((d) => d.status === 'SUCCEEDED').length
    };
  } catch {
    return { agents: 0, deployments: 0, successful: 0 };
  }
}

export default async function DashboardPage(): Promise<JSX.Element> {
  const stats = await getStats();

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Hero */}
      <div>
        <h1 className="page-title">Welcome back 👋</h1>
        <p className="mt-1 text-sm text-slate-500">
          Build, test, and deploy Salesforce AI agents — no code required.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card shadow-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Agents</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">{stats.agents}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
              <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card shadow-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Deployments</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">{stats.deployments}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50">
              <svg className="h-5 w-5 text-violet-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card shadow-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Successful</p>
              <p className="mt-1 text-3xl font-bold text-emerald-600">{stats.successful}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
              <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="section-title mb-4">Quick actions</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link
            href="/agents/new"
            className="card shadow-card flex items-center gap-4 p-5 transition-shadow hover:shadow-card-hover group"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600 group-hover:bg-indigo-700 transition-colors">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Create Agent</p>
              <p className="text-xs text-slate-500">Build a new AI agent in minutes</p>
            </div>
          </Link>

          <Link
            href="/playground"
            className="card shadow-card flex items-center gap-4 p-5 transition-shadow hover:shadow-card-hover group"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-600 group-hover:bg-violet-700 transition-colors">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Test in Playground</p>
              <p className="text-xs text-slate-500">Simulate agent interactions safely</p>
            </div>
          </Link>

          <Link
            href="/agents"
            className="card shadow-card flex items-center gap-4 p-5 transition-shadow hover:shadow-card-hover group"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 group-hover:bg-emerald-700 transition-colors">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M4 6h16M4 10h16M4 14h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">View All Agents</p>
              <p className="text-xs text-slate-500">Manage and deploy your agents</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
