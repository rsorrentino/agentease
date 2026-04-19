export default async function AgentsPage(): Promise<JSX.Element> {
  const response = await fetch('http://localhost:4000/api/agents', { cache: 'no-store' });
  const agents = (await response.json()) as Array<{ id: string; name: string; description: string }>;

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Agents</h1>
      <ul className="space-y-2">
        {agents.map((agent) => (
          <li className="rounded border bg-white p-4" key={agent.id}>
            <p className="font-medium">{agent.name}</p>
            <p className="text-sm text-slate-600">{agent.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
