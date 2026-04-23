'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAgentWizardStore } from '../store/use-agent-wizard-store';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const STEPS = [
  { number: 1, label: 'Name' },
  { number: 2, label: 'Description' },
  { number: 3, label: 'Prompt' }
];

const NAME_SUGGESTIONS = [
  'Case Deflector',
  'Lead Qualifier',
  'Order Status Bot',
  'Knowledge Assistant',
  'Service Desk Helper',
  'Opportunity Coach',
];

const PROMPT_TEMPLATES = [
  {
    label: 'Case Deflection',
    icon: '🛡️',
    description: 'Answers common support questions before a case is created.',
    value:
      `You are a helpful Salesforce Service Cloud assistant. Your goal is to resolve customer issues without creating a case whenever possible.\n\nWhen a customer describes a problem:\n1. Search your knowledge base for relevant articles.\n2. Provide clear, step-by-step guidance.\n3. If you cannot resolve the issue, politely collect the details needed to open a case.\n\nAlways be empathetic, concise, and professional.`,
  },
  {
    label: 'Lead Qualification',
    icon: '🎯',
    description: 'Qualifies inbound leads using BANT criteria.',
    value:
      `You are a Salesforce Sales Cloud assistant that qualifies inbound leads using the BANT framework (Budget, Authority, Need, Timeline).\n\nAsk natural, conversational questions to assess:\n- Budget: Does the prospect have funds available?\n- Authority: Are they the decision-maker?\n- Need: What business problem are they solving?\n- Timeline: When do they plan to purchase?\n\nSummarise your findings and recommend whether to advance or disqualify the lead.`,
  },
  {
    label: 'Order Status',
    icon: '📦',
    description: 'Helps customers check order and shipment status.',
    value:
      `You are an order support assistant for a Salesforce Commerce Cloud store.\n\nWhen a customer asks about an order:\n1. Ask for their order number or email address.\n2. Look up the order status in the system.\n3. Provide a clear summary: order date, items, shipping status, and estimated delivery.\n4. If there is a delay or issue, apologise and escalate to a human agent.\n\nKeep responses brief and friendly.`,
  },
  {
    label: 'Knowledge Search',
    icon: '🔍',
    description: 'Surfaces relevant knowledge articles for any question.',
    value:
      `You are a knowledge base assistant powered by Salesforce Knowledge.\n\nFor every question:\n1. Identify the key topic or product area.\n2. Search for the top 3 most relevant knowledge articles.\n3. Summarise each article in 1-2 sentences with a link.\n4. If no articles match, suggest the user contact support.\n\nAlways cite the article title and URL so users can read more.`,
  },
  {
    label: 'IT Helpdesk',
    icon: '💻',
    description: 'Handles common IT requests and password resets.',
    value:
      `You are an IT helpdesk assistant integrated with Salesforce Service Cloud.\n\nYou can help with:\n- Password resets and account unlocks\n- VPN and network connectivity issues\n- Software installation requests\n- Hardware troubleshooting\n\nFor each request, collect the employee's name, department, and a brief description of the issue. Create a ticket if you cannot resolve it immediately. Always confirm ticket numbers with the user.`,
  },
];

export function AgentWizard(): JSX.Element {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { name, description, promptTemplate, setField, reset } = useAgentWizardStore();

  const canNext =
    (step === 1 && name.trim().length > 0) ||
    (step === 2 && description.trim().length > 0) ||
    step === 3;

  const submit = async () => {
    if (!promptTemplate.trim()) {
      setError('Prompt template is required. Choose one of the templates above or write your own.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch(`${API}/api/agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, promptTemplate, tools: [], dataSources: [] })
      });
      if (!response.ok) {
        const json = (await response.json()) as { message?: string };
        throw new Error(json.message ?? 'Failed to create agent');
      }
      reset();
      setStep(1);
      router.push('/agents');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card shadow-card overflow-hidden">
      {/* Step indicator */}
      <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
        <ol className="flex items-center gap-0">
          {STEPS.map((s, i) => (
            <li key={s.number} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                    step > s.number
                      ? 'bg-indigo-600 text-white'
                      : step === s.number
                      ? 'border-2 border-indigo-600 text-indigo-600'
                      : 'border border-slate-300 text-slate-400'
                  }`}
                >
                  {step > s.number ? (
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    s.number
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${
                    step === s.number ? 'text-indigo-700' : step > s.number ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`mx-3 h-px w-8 ${step > s.number ? 'bg-indigo-400' : 'bg-slate-200'}`} />
              )}
            </li>
          ))}
        </ol>
      </div>

      {/* Form body */}
      <div className="p-6 space-y-5">

        {/* ── Step 1: Name ── */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3">
              <p className="text-xs font-semibold text-indigo-700 mb-0.5">💡 Tip — pick an action-oriented name</p>
              <p className="text-xs text-indigo-600">
                Good agent names describe what the agent <em>does</em>, e.g. <strong>"Case Deflector"</strong> or <strong>"Lead Qualifier"</strong>. Avoid generic names like "My Agent".
              </p>
            </div>
            <div>
              <label className="label" htmlFor="agent-name">Agent Name <span className="text-red-400">*</span></label>
              <input
                id="agent-name"
                className="input"
                placeholder="e.g. Case Deflector, Lead Qualifier…"
                value={name}
                onChange={(e) => setField('name', e.target.value)}
                autoFocus
                maxLength={60}
              />
              <div className="mt-1.5 flex items-center justify-between">
                <p className="text-xs text-slate-500">Use a clear name your team will recognise.</p>
                <span className="text-xs text-slate-400">{name.length}/60</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-2">Suggestions — click to use:</p>
              <div className="flex flex-wrap gap-2">
                {NAME_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setField('name', s)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      name === s
                        ? 'border-indigo-500 bg-indigo-600 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-700'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Description ── */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3">
              <p className="text-xs font-semibold text-indigo-700 mb-0.5">💡 Tip — describe the business outcome</p>
              <p className="text-xs text-indigo-600">
                Explain <em>what problem the agent solves</em> and <em>who it helps</em>. This helps your team quickly understand the agent's purpose.
                Example: <strong>"Handles common password reset requests so the IT helpdesk can focus on complex issues."</strong>
              </p>
            </div>
            <div>
              <label className="label" htmlFor="agent-description">Description <span className="text-red-400">*</span></label>
              <textarea
                id="agent-description"
                className="input min-h-[100px] resize-y"
                placeholder="Describe what this agent does and who it helps…"
                value={description}
                onChange={(e) => setField('description', e.target.value)}
                autoFocus
                maxLength={300}
              />
              <div className="mt-1.5 flex items-center justify-between">
                <p className="text-xs text-slate-500">Shown in the agents list to help your team.</p>
                <span className="text-xs text-slate-400">{description.length}/300</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Prompt ── */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3">
              <p className="text-xs font-semibold text-indigo-700 mb-0.5">💡 Tip — start with a template</p>
              <p className="text-xs text-indigo-600">
                Choose a pre-built template below and customise it, or write your own. A good prompt clearly tells the agent its <strong>role</strong>, what it should <strong>do</strong>, and how it should <strong>respond</strong>.
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-600 mb-2">Start from a template <span className="text-slate-400">(optional)</span>:</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {PROMPT_TEMPLATES.map((t) => (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => setField('promptTemplate', t.value)}
                    className={`rounded-lg border p-3 text-left transition-all ${
                      promptTemplate === t.value
                        ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-400'
                        : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50'
                    }`}
                  >
                    <p className="text-sm">{t.icon} <span className="font-semibold text-slate-800">{t.label}</span></p>
                    <p className="mt-0.5 text-xs text-slate-500">{t.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label" htmlFor="agent-prompt">
                Prompt Template <span className="text-red-400">*</span>
              </label>
              <textarea
                id="agent-prompt"
                className="input min-h-[180px] resize-y font-mono text-xs"
                placeholder="You are a helpful Salesforce assistant…"
                value={promptTemplate}
                onChange={(e) => setField('promptTemplate', e.target.value)}
              />
              <p className="mt-1.5 text-xs text-slate-500">
                This is the core instruction that shapes your agent's behaviour. You can always edit it later.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
        <button
          className="btn-ghost"
          disabled={step === 1}
          onClick={() => { setError(null); setStep((s) => Math.max(1, s - 1)); }}
          type="button"
        >
          Back
        </button>

        {step < 3 ? (
          <button
            className="btn-primary"
            disabled={!canNext}
            onClick={() => setStep(step + 1)}
            type="button"
          >
            Continue
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : (
          <button
            className="btn-success"
            disabled={submitting}
            onClick={submit}
            type="button"
          >
            {submitting ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Creating…
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Create Agent
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
