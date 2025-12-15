import React, { useEffect, useRef, useState } from 'react';

interface SearchableSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean
  required?: boolean
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  error,
  disabled,
  required
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const filtered = options.filter(option =>
      option.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [searchTerm, options]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <button
        type="button"
        className={`w-full border rounded p-2 cursor-pointer text-start ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
      >
        {value || 'Select an option'}
      </button>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded shadow-lg">
          <input
            type="text"
            required={required}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-2 py-1 border-b focus:outline-none placeholder:text-sm"
            placeholder="Search..."
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()} 
          />
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.map((option, index) => (
              <div
                key={index}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {handleSelect(option)}}
              >
                {option}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
};

export default SearchableSelect;