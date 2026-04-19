'use client';

import { useState } from 'react';

export function ChatPlayground(): JSX.Element {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<string[]>(['Agent: Hi! Ask me anything about your Salesforce process.']);

  const send = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, `You: ${input}`, `Agent: Simulated response for "${input}"`]);
    setInput('');
  };

  return (
    <div className="rounded-lg border bg-white p-6">
      <div className="mb-4 h-64 space-y-2 overflow-y-auto rounded border p-3">
        {messages.map((message, i) => (
          <p className="text-sm" key={`${message}-${i}`}>
            {message}
          </p>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 rounded border p-2"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Type a test prompt"
        />
        <button className="rounded bg-slate-900 px-4 py-2 text-white" onClick={send} type="button">
          Send
        </button>
      </div>
    </div>
  );
}
