'use client';

import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface Agent {
  id: string;
  name: string;
  description: string;
}

interface Message {
  role: 'user' | 'agent';
  text: string;
  timestamp: Date;
}

interface Session {
  id: string;
  agentId: string;
  agentName: string;
  messages: Message[];
  startedAt: Date;
}

interface SalesforceContext {
  userId?: string;
  userName?: string;
  userEmail?: string;
  recordId?: string;
  recordType?: string;
  caseNumber?: string;
  accountName?: string;
}

const SUGGESTED_PROMPTS = [
  "What's the status of my order #12345?",
  'I need help resetting my password.',
  'Can you explain the refund policy?',
  "I'd like to report a billing issue.",
  'How do I escalate a case to a manager?',
  'What are your support hours?',
];

export default function PlaygroundPage(): JSX.Element {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showContext, setShowContext] = useState(false);
  const [salesforceContext, setSalesforceContext] = useState<SalesforceContext>({
    userId: 'user_12345',
    userName: 'John Doe',
    userEmail: 'john.doe@example.com',
    recordId: 'rec_67890',
    recordType: 'Case',
    caseNumber: 'CASE-00123',
    accountName: 'Acme Corp',
  });

  // Load agents on mount
  useEffect(() => {
    void fetch(`${API}/api/agents`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        setAgents(data as Agent[]);
        if (data.length > 0) {
          setSelectedAgentId((data[0] as Agent).id);
        }
      })
      .catch(() => null);
  }, []);

  // Initialize conversation when agent is selected
  useEffect(() => {
    if (selectedAgentId) {
      const agent = agents.find((a) => a.id === selectedAgentId);
      if (agent) {
        const welcomeMessage: Message = {
          role: 'agent',
          text: `Hi! I'm ${agent.name}. ${agent.description} How can I help you today?`,
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
      }
    }
  }, [selectedAgentId, agents]);

  const sendMessage = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || !selectedAgentId) return;

    const userMessage: Message = {
      role: 'user',
      text: msg,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call the preview endpoint with the user message and context
      const res = await fetch(`${API}/api/agents/${selectedAgentId}/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          context: salesforceContext,
        }),
      });

      const result = await res.json();

      // Extract response from CLI logs or use a simulated response
      let agentResponse = `Simulated response for: "${msg}"`;
      if (result.success && result.logs && result.logs.length > 0) {
        agentResponse = result.logs.join('\n');
      } else if (result.errors && result.errors.length > 0) {
        agentResponse = `Error: ${result.errors.join('\n')}`;
      }

      const agentMessage: Message = {
        role: 'agent',
        text: agentResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, agentMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: 'agent',
        text: `Error: ${(error as Error).message}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  const saveSession = () => {
    if (messages.length <= 1 || !selectedAgentId) return;

    const agent = agents.find((a) => a.id === selectedAgentId);
    if (!agent) return;

    const newSession: Session = {
      id: `session_${Date.now()}`,
      agentId: selectedAgentId,
      agentName: agent.name,
      messages: [...messages],
      startedAt: new Date(),
    };

    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  };

  const loadSession = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      setSelectedAgentId(session.agentId);
      setMessages(session.messages);
      setCurrentSessionId(sessionId);
    }
  };

  const clearConversation = () => {
    const agent = agents.find((a) => a.id === selectedAgentId);
    if (agent) {
      const welcomeMessage: Message = {
        role: 'agent',
        text: `Hi! I'm ${agent.name}. ${agent.description} How can I help you today?`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
      setCurrentSessionId(null);
    }
  };

  return (
    <div className="animate-slide-up">
      <div className="mb-6">
        <h1 className="page-title">Playground</h1>
        <p className="mt-1 text-sm text-slate-500">
          Test your agents with simulated conversations and Salesforce context.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Chat Area - 2 columns */}
        <div className="lg:col-span-2 space-y-4">
          {/* Agent Selection */}
          <div className="card p-4">
            <label className="label" htmlFor="agent-select">
              Select Agent
            </label>
            <select
              id="agent-select"
              className="input"
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              disabled={agents.length === 0}
            >
              {agents.length === 0 ? (
                <option value="">No agents available</option>
              ) : (
                agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))
              )}
            </select>
            {agents.length === 0 && (
              <p className="mt-2 text-xs text-slate-400">
                Create an agent first via <strong>Agents → New Agent</strong>
              </p>
            )}
          </div>

          {/* Chat Interface */}
          <div className="card flex flex-col" style={{ height: '600px' }}>
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
                <svg
                  className="h-4 w-4 text-violet-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Conversation</p>
                <p className="text-xs text-slate-500">
                  {isLoading ? 'Agent is typing...' : 'Ready to test'}
                </p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                {messages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={saveSession}
                      className="btn-ghost px-2 py-1 text-xs"
                      title="Save session"
                    >
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={clearConversation}
                      className="btn-ghost px-2 py-1 text-xs"
                      title="Clear conversation"
                    >
                      Clear
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 px-5 py-4">
              {/* Suggested prompts */}
              {messages.length === 1 && (
                <div className="mb-2">
                  <p className="mb-2 text-xs font-medium text-slate-500">
                    💬 Try a suggested prompt:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => void sendMessage(prompt)}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-left text-xs text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {msg.role === 'user' ? 'U' : 'A'}
                  </div>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'rounded-tr-sm bg-indigo-600 text-white'
                        : 'rounded-tl-sm border border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                    A
                  </div>
                  <div className="rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-4 py-2.5">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '0ms' }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '150ms' }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-slate-100 px-4 py-3">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                <input
                  className="flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a test prompt and press Enter…"
                  disabled={isLoading || !selectedAgentId}
                />
                <button
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors"
                  disabled={!input.trim() || isLoading || !selectedAgentId}
                  onClick={() => void sendMessage()}
                  type="button"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M5 12h14M12 5l7 7-7 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
              <p className="mt-1.5 text-center text-[10px] text-slate-400">
                Press Enter to send · Shift+Enter for new line
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-4">
          {/* Salesforce Context Panel */}
          <div className="card">
            <button
              type="button"
              onClick={() => setShowContext(!showContext)}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <div className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-sm font-semibold text-slate-900">
                  Salesforce Context
                </span>
              </div>
              <svg
                className={`h-4 w-4 text-slate-400 transition-transform ${showContext ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {showContext && (
              <div className="border-t border-slate-100 px-4 py-3 space-y-3">
                <p className="text-xs text-slate-500">
                  Mock Salesforce context injected into agent prompts
                </p>

                <div>
                  <label className="label text-xs" htmlFor="ctx-user-id">
                    User ID
                  </label>
                  <input
                    id="ctx-user-id"
                    className="input text-xs"
                    value={salesforceContext.userId ?? ''}
                    onChange={(e) =>
                      setSalesforceContext((prev) => ({ ...prev, userId: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="label text-xs" htmlFor="ctx-user-name">
                    User Name
                  </label>
                  <input
                    id="ctx-user-name"
                    className="input text-xs"
                    value={salesforceContext.userName ?? ''}
                    onChange={(e) =>
                      setSalesforceContext((prev) => ({ ...prev, userName: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="label text-xs" htmlFor="ctx-user-email">
                    User Email
                  </label>
                  <input
                    id="ctx-user-email"
                    className="input text-xs"
                    value={salesforceContext.userEmail ?? ''}
                    onChange={(e) =>
                      setSalesforceContext((prev) => ({ ...prev, userEmail: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="label text-xs" htmlFor="ctx-record-id">
                    Record ID
                  </label>
                  <input
                    id="ctx-record-id"
                    className="input text-xs"
                    value={salesforceContext.recordId ?? ''}
                    onChange={(e) =>
                      setSalesforceContext((prev) => ({ ...prev, recordId: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="label text-xs" htmlFor="ctx-record-type">
                    Record Type
                  </label>
                  <input
                    id="ctx-record-type"
                    className="input text-xs"
                    value={salesforceContext.recordType ?? ''}
                    onChange={(e) =>
                      setSalesforceContext((prev) => ({ ...prev, recordType: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="label text-xs" htmlFor="ctx-case-number">
                    Case Number
                  </label>
                  <input
                    id="ctx-case-number"
                    className="input text-xs"
                    value={salesforceContext.caseNumber ?? ''}
                    onChange={(e) =>
                      setSalesforceContext((prev) => ({ ...prev, caseNumber: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="label text-xs" htmlFor="ctx-account-name">
                    Account Name
                  </label>
                  <input
                    id="ctx-account-name"
                    className="input text-xs"
                    value={salesforceContext.accountName ?? ''}
                    onChange={(e) =>
                      setSalesforceContext((prev) => ({ ...prev, accountName: e.target.value }))
                    }
                  />
                </div>
              </div>
            )}
          </div>

          {/* Session History */}
          <div className="card">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
              <svg
                className="h-4 w-4 text-indigo-600"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-sm font-semibold text-slate-900">Session History</span>
            </div>

            <div className="px-4 py-3">
              {sessions.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">
                  No saved sessions yet. Click "Save" to store a conversation.
                </p>
              ) : (
                <div className="space-y-2">
                  {sessions.map((session) => (
                    <button
                      key={session.id}
                      type="button"
                      onClick={() => loadSession(session.id)}
                      className={`w-full rounded-lg border p-3 text-left transition-colors ${
                        currentSessionId === session.id
                          ? 'border-indigo-300 bg-indigo-50'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <p className="text-xs font-semibold text-slate-900">
                        {session.agentName}
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-500">
                        {session.messages.length} messages ·{' '}
                        {new Date(session.startedAt).toLocaleString()}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
