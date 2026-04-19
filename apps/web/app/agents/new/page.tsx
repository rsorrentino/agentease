import { AgentWizard } from '../../../components/agent-wizard';

export default function NewAgentPage(): JSX.Element {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">New Agent</h1>
      <AgentWizard />
    </section>
  );
}
