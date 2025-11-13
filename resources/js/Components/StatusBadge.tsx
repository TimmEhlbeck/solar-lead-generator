import React from 'react';

export type ProjectStatus =
  | 'draft'
  | 'planning'
  | 'quote_requested'
  | 'quote_sent'
  | 'contract_signed'
  | 'installation_scheduled'
  | 'in_installation'
  | 'completed'
  | 'cancelled';

interface StatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

const statusConfig: Record<
  ProjectStatus,
  { label: string; color: string }
> = {
  draft: {
    label: 'Entwurf',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  },
  planning: {
    label: 'In Planung',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  },
  quote_requested: {
    label: 'Angebot angefordert',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  },
  quote_sent: {
    label: 'Angebot versendet',
    color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
  },
  contract_signed: {
    label: 'Vertrag unterzeichnet',
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  },
  installation_scheduled: {
    label: 'Installation geplant',
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
  },
  in_installation: {
    label: 'In Installation',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  },
  completed: {
    label: 'Abgeschlossen',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  },
  cancelled: {
    label: 'Abgebrochen',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  },
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.draft;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color} ${className}`}
    >
      {config.label}
    </span>
  );
}

export function getStatusLabel(status: ProjectStatus): string {
  return statusConfig[status]?.label || status;
}

export function getStatusOptions(): Array<{ value: ProjectStatus; label: string }> {
  return Object.entries(statusConfig).map(([value, config]) => ({
    value: value as ProjectStatus,
    label: config.label,
  }));
}
