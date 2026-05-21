
import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children:  ReactNode;
  padding?:  'none' | 'sm' | 'md' | 'lg';
  hover?:    boolean;
  border?:   boolean;
}

const paddingClasses = {
  none: '',
  sm:   'p-3',
  md:   'p-5',
  lg:   'p-7',
};

const Card = ({
  children,
  padding  = 'md',
  hover    = false,
  border   = true,
  className = '',
  ...props
}: CardProps) => {
  return (
    <div
      className={`
        bg-white rounded-xl shadow-sm
        ${border  ? 'border border-gray-200' : ''}
        ${hover   ? 'hover:shadow-md hover:border-primary-200 transition-all duration-200 cursor-pointer' : ''}
        ${paddingClasses[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

// Card sub-components for consistent structure
export const CardHeader = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`flex items-center justify-between mb-4 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <h3 className={`text-base font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

export const CardFooter = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`mt-4 pt-4 border-t border-gray-100 flex items-center justify-between ${className}`}>
    {children}
  </div>
);
export const CardContent = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`p-4 ${className}`}>
    {children}
  </div>
);
export default Card;