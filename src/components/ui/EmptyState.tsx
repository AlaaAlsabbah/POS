import { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={clsx('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-surface-100 to-surface-200 flex items-center justify-center mb-5 shadow-inner">
        <Icon size={36} className="text-surface-400" />
      </div>
      <h3 className="text-xl font-semibold text-surface-800 mb-2">{title}</h3>
      {description && (
        <p className="text-surface-500 max-w-xs">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
