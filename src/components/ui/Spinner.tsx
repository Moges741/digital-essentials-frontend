
type SpinnerSize  = 'sm' | 'md' | 'lg' | 'xl';
type SpinnerColor = 'white' | 'dark' | 'primary';

interface SpinnerProps {
  size?:  SpinnerSize;
  color?: SpinnerColor;
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'h-3.5 w-3.5 border-2',
  md: 'h-5 w-5 border-2',
  lg: 'h-8 w-8 border-2',
  xl: 'h-12 w-12 border-4',
};

const colorClasses: Record<SpinnerColor, string> = {
  white:   'border-white/30 border-t-white',
  dark:    'border-gray-300 border-t-gray-700',
  primary: 'border-primary-200 border-t-primary-600',
};

const Spinner = ({ size = 'md', color = 'primary' }: SpinnerProps) => {
  return (
    <div
      className={`
        animate-spin rounded-full
        ${sizeClasses[size]}
        ${colorClasses[color]}
      `}
    />
  );
};

// Full page loading screen
export const PageSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center gap-4">
      <Spinner size="xl" color="primary" />
      <p className="text-gray-500 text-sm">Loading...</p>
    </div>
  </div>
);

export default Spinner;