import React from 'react';
import {
  Plus,
  ArrowRight,
  Calendar,
  FileText,
  Mail,
  FileCheck,
  CalendarCheck,
  CheckCircle,
  Circle,
  Clock
} from 'lucide-react';

export interface TimelineEvent {
  id: number;
  event_type: string;
  title: string;
  description: string | null;
  icon: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
  creator: {
    name: string;
  } | null;
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Plus,
  ArrowRight,
  Calendar,
  FileText,
  Mail,
  FileCheck,
  CalendarCheck,
  CheckCircle,
  Circle,
  Clock,
};

export function Timeline({ events, className = '' }: TimelineProps) {
  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || Circle;
    return IconComponent;
  };

  const getIconColor = (eventType: string) => {
    switch (eventType) {
      case 'project_created':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400';
      case 'status_changed':
        return 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400';
      case 'appointment_scheduled':
        return 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400';
      case 'document_uploaded':
        return 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400';
      case 'quote_sent':
        return 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900 dark:text-cyan-400';
      case 'contract_signed':
        return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400';
      case 'installation_scheduled':
      case 'installation_completed':
        return 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  if (events.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-500 dark:text-gray-400">
          Noch keine Timeline-Ereignisse vorhanden
        </p>
      </div>
    );
  }

  return (
    <div className={`flow-root ${className}`}>
      <ul className="-mb-8">
        {events.map((event, eventIdx) => {
          const IconComponent = getIcon(event.icon);

          return (
            <li key={event.id}>
              <div className="relative pb-8">
                {eventIdx !== events.length - 1 ? (
                  <span
                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span
                      className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-900 ${getIconColor(
                        event.event_type
                      )}`}
                    >
                      <IconComponent className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {event.title}
                      </p>
                      {event.description && (
                        <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
                          {event.description}
                        </p>
                      )}
                      {event.creator && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                          von {event.creator.name}
                        </p>
                      )}
                    </div>
                    <div className="whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-500">
                      <time dateTime={event.created_at}>{event.created_at}</time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
