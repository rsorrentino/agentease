import Link from 'next/link';
import { notFound } from 'next/navigation';

interface AgentDetailsPageProps {
  params: Promise<{ id: string }>;
}

interface AgentDetail {
  id: string;
  name: string;
  description: string;
  promptTemplate: string;
  createdAt: string;
}

interface Deployment {
  id: string;
  status: string;
  logs: string[];
  createdAt?: string;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

function StatusBadge({ status }: { status: string }) {
  const isOk = status === 'SUCCEEDED';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${
        isOk ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-red-50 text-red-700 ring-red-200'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isOk ? 'bg-emerald-500' : 'bg-red-500'}`} />
      {status}
    </span>
  );
}

export default async function AgentDetailsPage({ params }: AgentDetailsPageProps): Promise<JSX.Element> {
  const { id } = await params;
  const [agentRes, deploymentsRes] = await Promise.all([
    fetch(`${API}/api/agents/${id}`, { cache: 'no-store' }),
    fetch(`${API}/api/deployments?agentId=${id}`, { cache: 'no-store' })
  ]);

  if (!agentRes.ok) notFound();

  const agent = (await agentRes.json()) as AgentDetail;
  const deployments: Deployment[] = deploymentsRes.ok ? ((await deploymentsRes.json()) as Deployment[]) : [];

  return (
    <div className="animate-slide-up space-y-6">
      {/* Breadcrumb + title */}
      <div>
        <Link className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 transition-colors" href="/agents">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Agents
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h1 className="page-title">{agent.name}</h1>
            <p className="text-xs text-slate-400">
              Created {new Date(agent.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: details */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card shadow-card p-6 space-y-4">
            <h2 className="section-title">Agent Details</h2>
            <div>
              <p className="label">Description</p>
              <p className="text-sm text-slate-700">{agent.description}</p>
            </div>
            <div>
              <p className="label">Prompt Template</p>
              <pre className="mt-1 whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 leading-relaxed">
                {agent.promptTemplate}
              </pre>
            </div>
          </div>
        </div>

        {/* Right: actions + quick deploy link */}
        <div className="space-y-4">
          <div className="card shadow-card p-5 space-y-3">
            <h2 className="section-title">Actions</h2>
            <Link
              href={`/playground?agentId=${agent.id}`}
              className="btn-secondary w-full justify-center"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M8 9l3 3-3 3m5 0h3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Test in Playground
            </Link>
            <Link
              href={`/playground?agentId=${agent.id}&deploy=1`}
              className="btn-primary w-full justify-center"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Deploy
            </Link>
          </div>

          <div className="card shadow-card p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Agent ID</p>
            <p className="mt-1 break-all font-mono text-xs text-slate-600">{agent.id}</p>
          </div>
        </div>
      </div>

      {/* Deployment history */}
      <div className="card shadow-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="section-title">Deployment History</h2>
          <span className="badge-neutral">{deployments.length} total</span>
        </div>

        {deployments.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <svg className="mb-3 h-8 w-8 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-sm text-slate-500">No deployments yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {deployments.map((d) => (
              <details key={d.id} className="group rounded-lg border border-slate-200 bg-slate-50">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <StatusBadge status={d.status} />
                    <span className="font-mono text-xs text-slate-500">{d.id.slice(0, 12)}…</span>
                  </div>
                  <svg
                    className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </summary>
                {d.logs.length > 0 && (
                  <pre className="border-t border-slate-200 px-4 py-3 text-xs leading-5 text-slate-600 overflow-x-auto">
                    {d.logs.join('\n')}
                  </pre>
                )}
              </details>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

  const [agentRes, deploymentsRes] = await Promise.all([
    fetch(`${API}/api/agents/${id}`, { cache: 'no-store' }),
    fetch(`${API}/api/deployments?agentId=${id}`, { cache: 'no-store' })
  ]);

  if (!agentRes.ok) notFound();

  const agent = (await agentRes.json()) as AgentDetail;
  const deployments: Deployment[] = deploymentsRes.ok ? ((await deploymentsRes.json()) as Deployment[]) : [];

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-4">
        <Link className="text-sm text-slate-500 hover:underline" href="/agents">
          ← Agents
        </Link>
        <h1 className="text-2xl font-semibold">{agent.name}</h1>
      </div>

      <div className="rounded-lg border bg-white p-6 space-y-3">
        <p className="text-slate-600">{agent.description}</p>
        <div>
          <p className="text-xs font-medium uppercase text-slate-400 mb-1">Prompt Template</p>
          <pre className="whitespace-pre-wrap rounded bg-slate-50 border p-3 text-sm">{agent.promptTemplate}</pre>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Deployment History</h2>
        {deployments.length === 0 ? (
          <p className="text-slate-500 text-sm">No deployments yet.</p>
        ) : (
          <ul className="space-y-2">
            {deployments.map((d) => (
              <li className="rounded border bg-white p-4 space-y-2" key={d.id}>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${
                      d.status === 'SUCCEEDED'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {d.status}
                  </span>
                </div>
                {d.logs.length > 0 && (
                  <pre className="max-h-40 overflow-y-auto rounded bg-slate-950 p-2 text-xs text-emerald-300">
                    {d.logs.join('\n')}
                  </pre>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
