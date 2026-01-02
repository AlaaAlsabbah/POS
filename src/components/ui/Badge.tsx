import { clsx } from 'clsx';
import { SaleStatus } from '../../types';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        {
          'bg-surface-200 text-surface-700': variant === 'default',
          'bg-accent-100 text-accent-700': variant === 'success',
          'bg-warning-100 text-warning-700': variant === 'warning',
          'bg-danger-100 text-danger-700': variant === 'danger',
          'bg-blue-100 text-blue-700': variant === 'info',
        },
        className
      )}
    >
      {children}
    </span>
  );
}

// Status-specific badge
export function StatusBadge({ status }: { status: SaleStatus }) {
  const config: Record<SaleStatus, { label: string; variant: BadgeProps['variant'] }> = {
    draft: { label: 'Draft', variant: 'default' },
    parked: { label: 'Parked', variant: 'info' },
    completed: { label: 'Completed', variant: 'success' },
    voided: { label: 'Voided', variant: 'danger' },
    refunded: { label: 'Refunded', variant: 'warning' },
  };

  const { label, variant } = config[status];
  return <Badge variant={variant}>{label}</Badge>;
}

