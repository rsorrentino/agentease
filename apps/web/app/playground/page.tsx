import { ChatPlayground } from '../../components/chat-playground';
import { DeploymentPanel } from '../../components/deployment-panel';

export default function PlaygroundPage(): JSX.Element {
  return (
    <div className="animate-slide-up">
      <div className="mb-6">
        <h1 className="page-title">Playground</h1>
        <p className="mt-1 text-sm text-slate-500">
          Simulate agent conversations and deploy to Salesforce when ready.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <ChatPlayground />
        <DeploymentPanel />
      </div>
    </div>
  );
}
