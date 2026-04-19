import { ChatPlayground } from '../../components/chat-playground';
import { DeploymentPanel } from '../../components/deployment-panel';

export default function PlaygroundPage(): JSX.Element {
  return (
    <section className="grid gap-6 md:grid-cols-2">
      <ChatPlayground />
      <DeploymentPanel />
    </section>
  );
}
