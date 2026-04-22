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
      setError('Prompt template is required.');
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
      <div className="p-6 space-y-4">
        {step === 1 && (
          <div>
            <label className="label" htmlFor="agent-name">Agent Name</label>
            <input
              id="agent-name"
              className="input"
              placeholder="e.g. Sales Assistant, Case Deflector…"
              value={name}
              onChange={(e) => setField('name', e.target.value)}
              autoFocus
            />
            <p className="mt-1.5 text-xs text-slate-500">Give your agent a clear, descriptive name.</p>
          </div>
        )}

        {step === 2 && (
          <div>
            <label className="label" htmlFor="agent-description">Description</label>
            <textarea
              id="agent-description"
              className="input min-h-[100px] resize-y"
              placeholder="Describe what this agent does and who it helps…"
              value={description}
              onChange={(e) => setField('description', e.target.value)}
              autoFocus
            />
            <p className="mt-1.5 text-xs text-slate-500">Shown in the agents list and helps your team understand the agent's purpose.</p>
          </div>
        )}

        {step === 3 && (
          <div>
            <label className="label" htmlFor="agent-prompt">Prompt Template</label>
            <textarea
              id="agent-prompt"
              className="input min-h-[160px] resize-y font-mono text-xs"
              placeholder="You are a helpful Salesforce assistant. Answer questions about {topic} clearly and concisely…"
              value={promptTemplate}
              onChange={(e) => setField('promptTemplate', e.target.value)}
              autoFocus
            />
            <p className="mt-1.5 text-xs text-slate-500">The core instruction that shapes your agent's behaviour in Salesforce.</p>
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


  const submit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch(`${API}/api/agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          promptTemplate,
          tools: [],
          dataSources: []
        })
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
    <div className="space-y-4 rounded-lg border bg-white p-6">
      <p className="text-sm text-slate-500">Step {step} of 3</p>
      {step === 1 && (
        <input
          className="w-full rounded border p-2"
          placeholder="Agent name"
          value={name}
          onChange={(event) => setField('name', event.target.value)}
        />
      )}
      {step === 2 && (
        <textarea
          className="w-full rounded border p-2"
          placeholder="Describe what this agent does"
          value={description}
          onChange={(event) => setField('description', event.target.value)}
        />
      )}
      {step === 3 && (
        <textarea
          className="w-full rounded border p-2"
          placeholder="Prompt template"
          value={promptTemplate}
          onChange={(event) => setField('promptTemplate', event.target.value)}
        />
      )}

      {error && <p className="rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          className="rounded border px-4 py-2"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          type="button"
        >
          Back
        </button>
        {step < 3 ? (
          <button className="rounded bg-slate-900 px-4 py-2 text-white" onClick={() => setStep(step + 1)} type="button">
            Next
          </button>
        ) : (
          <button
            className="rounded bg-emerald-600 px-4 py-2 text-white disabled:opacity-50"
            disabled={submitting}
            onClick={submit}
            type="button"
          >
            {submitting ? 'Creating…' : 'Create Agent'}
          </button>
        )}
      </div>
    </div>
  );
}
