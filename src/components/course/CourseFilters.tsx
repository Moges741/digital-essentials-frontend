
import { useState, useEffect } from 'react';
import { Search, X }           from 'lucide-react';
import Input                   from '../ui/Input';
// import Button                  from '../ui/Button';

interface CourseFiltersProps {
  search:     string;
  onSearch:   (search: string) => void;
  isLoading:  boolean;
}

const CourseFilters = ({ search, onSearch, isLoading }: CourseFiltersProps) => {
  const [value, setValue] = useState(search);

  // Sync local value with prop
  useEffect(() => {
    setValue(search);
  }, [search]);

  // Debounce search — wait 300ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (value !== search) {
        onSearch(value.trim());
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value, search, onSearch]);

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