interface AgentDetailsPageProps {
  params: { id: string };
}

export default function AgentDetailsPage({ params }: AgentDetailsPageProps): JSX.Element {
  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-semibold">Agent Details</h1>
      <p className="text-slate-600">Selected Agent ID: {params.id}</p>
    </section>
  );
}
