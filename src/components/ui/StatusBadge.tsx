import React from 'react';
import { LecturerStatus } from '../../types/database';
import { cn } from '../../lib/utils';

interface StatusBadgeProps {
  status: LecturerStatus;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1.5 font-semibold',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-bold',
  };

  const statusConfig = {
    Available: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dot: 'bg-emerald-500 animate-pulse',
      label: 'Available',
    },
    Busy: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      dot: 'bg-amber-500',
      label: 'Busy',
    },
    'Not Available': {
      bg: 'bg-rose-50 text-rose-800 border-rose-200',
      dot: 'bg-rose-500',
      label: 'Not Available',
    },
  };

  const config = statusConfig[status] || statusConfig.Available;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border transition-all duration-150 shrink-0 font-sans',
        sizeClasses[size],
        config.bg,
        className
      )}
    >
      <span className={cn('w-2 h-2 rounded-full shrink-0', config.dot)} />
      <span>{config.label}</span>
    </span>
  );
};
