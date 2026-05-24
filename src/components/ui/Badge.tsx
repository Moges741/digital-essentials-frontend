
type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'info';
type BadgeSize    = 'sm' | 'md';

interface BadgeProps {
  children:  React.ReactNode;
  variant?:  BadgeVariant;
  size?:     BadgeSize;
  dot?:      boolean;     // show colored dot before text
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: 'bg-primary-100 text-primary-700 ring-primary-200',
  success: 'bg-green-100 text-green-700 ring-green-200',
  warning: 'bg-amber-100 text-amber-700 ring-amber-200',
  danger:  'bg-red-100 text-red-700 ring-red-200',
  neutral: 'bg-gray-100 text-gray-600 ring-gray-200',
  info:    'bg-blue-100 text-blue-700 ring-blue-200',
};

const dotClasses: Record<BadgeVariant, string> = {
  primary: 'bg-primary-500',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  danger:  'bg-red-500',
  neutral: 'bg-gray-400',
  info:    'bg-blue-500',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
};

const Badge = ({
  children,
  variant  = 'neutral',
  size     = 'md',
  dot      = false,
  className = '',
}: BadgeProps) => {
  return (
    <span className={`
      inline-flex items-center gap-1.5 font-medium rounded-full
      ring-1 ring-inset
      ${variantClasses[variant]}
      ${sizeClasses[size]}
      ${className}
    `}>
      {dot && (
        <span className={`h-1.5 w-1.5 rounded-full ${dotClasses[variant]}`} />
      )}
      {children}
    </span>
  );
};

// ── Preset badges used throughout the app ─────────────────────
export const RoleBadge = ({ role }: { role: string }) => {
  const map: Record<string, { variant: BadgeVariant; label: string }> = {
    learner:       { variant: 'primary', label: 'Learner' },
    instructor:        { variant: 'success', label: 'Instructor' },
    administrator: { variant: 'warning', label: 'Admin' },
  };
  const config = map[role] ?? { variant: 'neutral', label: role };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { variant: BadgeVariant }> = {
    active:    { variant: 'success' },
    completed: { variant: 'primary' },
    dropped:   { variant: 'danger' },
    published: { variant: 'success' },
    draft:     { variant: 'warning' },
  };
  const config = map[status] ?? { variant: 'neutral' };
  return (
    <Badge variant={config.variant} dot>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export default Badge;