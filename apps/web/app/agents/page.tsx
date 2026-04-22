import Link from 'next/link';

export default async function AgentsPage(): Promise<JSX.Element> {
  let agents: Array<{ id: string; name: string; description: string }> = [];
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/api/agents`,
      { cache: 'no-store' }
    );
    if (response.ok) {
      agents = (await response.json()) as typeof agents;
    }
  } catch {
    // API unavailable — render empty list
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Agents</h1>
        <Link className="rounded bg-slate-900 px-4 py-2 text-sm text-white" href="/agents/new">
          + New Agent
        </Link>
      </div>
      {agents.length === 0 ? (
        <p className="text-slate-500">No agents yet. Create your first one.</p>
      ) : (
        <ul className="space-y-2">
          {agents.map((agent) => (
            <li key={agent.id}>
              <Link className="block rounded border bg-white p-4 hover:bg-slate-50" href={`/agents/${agent.id}`}>
                <p className="font-medium">{agent.name}</p>
                <p className="text-sm text-slate-600">{agent.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
