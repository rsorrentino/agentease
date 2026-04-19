import { PropsWithChildren } from 'react';

export function Card({ children }: PropsWithChildren): JSX.Element {
  return <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">{children}</div>;
}

export function PageTitle({ children }: PropsWithChildren): JSX.Element {
  return <h1 className="text-2xl font-semibold text-slate-900">{children}</h1>;
}
