
interface ProgressBarProps {
  value:      number;      // 0 to 100
  size?:      'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?:     string;
  color?:     'primary' | 'success' | 'warning';
  animated?:  boolean;
}

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

const colorClasses = {
  primary: 'bg-primary-600',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
};

const getColor = (value: number): 'warning' | 'primary' | 'success' => {
  if (value < 30)  return 'warning';
  if (value < 100) return 'primary';
  return 'success';
};

const ProgressBar = ({
  value,
  size      = 'md',
  showLabel = false,
  label,
  color,
  animated  = false,
}: ProgressBarProps) => {
  const clampedValue  = Math.min(100, Math.max(0, value));
  const resolvedColor = color ?? getColor(clampedValue);

  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-gray-500">{label ?? 'Progress'}</span>
          <span className="text-xs font-semibold text-gray-700">
            {clampedValue}%
          </span>
        </div>
      )}

      <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`
            h-full rounded-full transition-all duration-500 ease-out
            ${colorClasses[resolvedColor]}
            ${animated && clampedValue < 100 ? 'animate-pulse' : ''}
          `}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;