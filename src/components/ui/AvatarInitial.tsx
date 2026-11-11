import React from 'react';
import { cn } from '../../lib/utils';

interface AvatarInitialProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const COLOR_PALETTES = [
  'bg-blue-100 text-blue-800 border-blue-200',
  'bg-indigo-100 text-indigo-800 border-indigo-200',
  'bg-emerald-100 text-emerald-800 border-emerald-200',
  'bg-amber-100 text-amber-800 border-amber-200',
  'bg-purple-100 text-purple-800 border-purple-200',
  'bg-teal-100 text-teal-800 border-teal-200',
  'bg-slate-100 text-slate-800 border-slate-200',
];

export const AvatarInitial: React.FC<AvatarInitialProps> = ({
  name,
  size = 'md',
  className = '',
}) => {
  const hash = (name || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorScheme = COLOR_PALETTES[hash % COLOR_PALETTES.length];

  const cleanName = (name || '')
    .replace(/^(Dr\.|Prof\.|Assoc\.\s*Prof\.|Mr\.|Mrs\.|Ms\.)\s+/i, '')
    .trim();
  const parts = cleanName.split(/\s+/).filter(Boolean);
  let initials = '';
  if (parts.length >= 2) {
    initials = `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  } else if (parts.length === 1 && parts[0].length > 0) {
    initials = parts[0].substring(0, 2).toUpperCase();
  } else {
    initials = 'FA';
  }

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs font-semibold',
    md: 'w-11 h-11 text-sm font-bold',
    lg: 'w-14 h-14 text-base font-bold',
    xl: 'w-20 h-20 text-2xl font-bold',
  };

  return (
    <div
      className={cn(
        'rounded-full border flex items-center justify-center select-none shrink-0 shadow-xs font-sans',
        colorScheme,
        sizeClasses[size],
        className
      )}
    >
      {initials}
    </div>
  );
};
