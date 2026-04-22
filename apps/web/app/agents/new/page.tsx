import Link from 'next/link';
import { AgentWizard } from '../../../components/agent-wizard';

export default function NewAgentPage(): JSX.Element {
  return (
    <div className="animate-slide-up">
      <div className="mb-6">
        <Link className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 transition-colors" href="/agents">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Agents
        </Link>
        <h1 className="page-title mt-2">Create New Agent</h1>
        <p className="mt-1 text-sm text-slate-500">Follow the steps below to configure your AI agent.</p>
      </div>
      <div className="mx-auto max-w-xl">
        <AgentWizard />
      </div>
    </div>
  );
}
