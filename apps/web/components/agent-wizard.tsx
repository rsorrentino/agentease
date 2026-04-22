'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAgentWizardStore } from '../store/use-agent-wizard-store';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function AgentWizard(): JSX.Element {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { name, description, promptTemplate, setField, reset } = useAgentWizardStore();

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
