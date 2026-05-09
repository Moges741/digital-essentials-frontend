
import { useState, useEffect } from 'react';
import { Search, X }           from 'lucide-react';
import Input                   from '../ui/Input';
// import Button                  from '../ui/Button';

interface CourseFiltersProps {
  onSearch:  (search: string) => void;
  isLoading: boolean;
}

const CourseFilters = ({ onSearch, isLoading }: CourseFiltersProps) => {
  const [value, setValue] = useState('');

  // Debounce search — wait 400ms after user stops typing
  // Prevents API call on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(value.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [value, onSearch]);

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1 max-w-md">
        <Input
          placeholder="Search courses..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          leftIcon={<Search size={16} />}
          rightIcon={
            value ? (
              <button
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            ) : undefined
          }
        />
      </div>
      {isLoading && (
        <span className="text-xs text-gray-400">Searching...</span>
      )}
    </div>
  );
};

export default CourseFilters;