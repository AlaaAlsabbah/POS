import { clsx } from 'clsx';

interface KbdProps {
  children: React.ReactNode;
  className?: string;
}

export function Kbd({ children, className }: KbdProps) {
  return (
    <kbd className={clsx('kbd', className)}>
      {children}
    </kbd>
  );
}

