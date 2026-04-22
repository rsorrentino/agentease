import { PropsWithChildren, ReactNode } from 'react';

// ─── Card ──────────────────────────────────────────────────────────────────

export function Card({ children, className = '' }: PropsWithChildren<{ className?: string }>): JSX.Element {
  return (
    <div className={`card shadow-card ${className}`}>
      {children}
    </div>
  );
}

// ─── PageHeader ────────────────────────────────────────────────────────────

export function PageHeader({
  title,
  description,
  action
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}): JSX.Element {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="page-title">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// ─── StatCard ──────────────────────────────────────────────────────────────

export function StatCard({
  label,
  value,
  icon,
  trend
}: {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: { direction: 'up' | 'down' | 'neutral'; label: string };
}): JSX.Element {
  return (
    <div className="card shadow-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
        </div>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <p
          className={`mt-3 text-xs font-medium ${
            trend.direction === 'up'
              ? 'text-emerald-600'
              : trend.direction === 'down'
              ? 'text-red-500'
              : 'text-slate-500'
          }`}
        >
          {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '·'} {trend.label}
        </p>
      )}
    </div>
  );
}

// ─── EmptyState ────────────────────────────────────────────────────────────

export function EmptyState({
  icon,
  title,
  description,
  action
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center">
      {icon && <div className="mb-4 text-slate-300">{icon}</div>}
      <p className="text-base font-semibold text-slate-700">{title}</p>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

// ─── Badge ─────────────────────────────────────────────────────────────────

export function Badge({
  children,
  variant = 'neutral'
}: PropsWithChildren<{ variant?: 'success' | 'error' | 'pending' | 'neutral' }>): JSX.Element {
  const cls =
    variant === 'success'
      ? 'badge-success'
      : variant === 'error'
      ? 'badge-error'
      : variant === 'pending'
      ? 'badge-pending'
      : 'badge-neutral';
  return <span className={cls}>{children}</span>;
}

// ─── PageTitle (backwards compat) ──────────────────────────────────────────

export function PageTitle({ children }: PropsWithChildren): JSX.Element {
  return <h1 className="page-title">{children}</h1>;
}
