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
