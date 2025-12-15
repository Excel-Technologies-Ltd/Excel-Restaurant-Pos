import React, { useEffect, useRef, useState } from "react";
import { FaCheck } from "react-icons/fa";

interface OptionType {
  label: string;
  value: string;
}

interface SearchSelectProps {
  options: OptionType[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  searchText?: string;
  onSearchTextChange?: (searchText: string) => void;
  isLoading?: boolean;
  error?: string;
}

const SearchSelectExtraLabel: React.FC<SearchSelectProps> = ({
  options,
  value,
  onChange,
  disabled = false,
  placeholder = "Select an option...",
  searchText: externalSearchText,
  onSearchTextChange,
  isLoading = false,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalSearchText, setInternalSearchText] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const searchText =
    externalSearchText !== undefined ? externalSearchText : internalSearchText;

  const setSearchText = (text: string) => {
    if (onSearchTextChange) {
      onSearchTextChange(text);
    } else {
      setInternalSearchText(text);
    }
  };

  // Filter options by label
  const filteredOptions = onSearchTextChange
    ? options
    : options.filter((option) =>
        option.label.toLowerCase().includes(searchText.toLowerCase())
      );

  // Handle dropdown open/close
  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(-1);
      // inputRef.current?.focus();

      if (value) {
        const selectedOption = options.find((o) => o.value === value);
        if (selectedOption) setSearchText(selectedOption.value);
      }
    } else {
      if (!onSearchTextChange) {
        setSearchText("");
      }
    }
  }, [isOpen]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        event.target !== inputRef.current
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Preserve focus during async search
  useEffect(() => {
    if (isOpen && onSearchTextChange) {
      // inputRef.current?.focus();
    }
  }, [options, isOpen, onSearchTextChange]);

  const handleSelect = (option: OptionType) => {
    // Set only the value (customer_name) in parent
    onChange(option.value);

    // Also update search field to show only value, not full label
    setSearchText(option.value);

    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleInputClick = () => {
    if (!disabled) setIsOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchText(newValue);
    if (!isOpen) setIsOpen(true);

    const selectedOption = options.find((o) => o.value === value);
    if (selectedOption && newValue !== selectedOption.label) {
      onChange("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (["Enter", " ", "ArrowDown"].includes(e.key)) {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case "Escape":
        setIsOpen(false);
        break;
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
    }
  };

  const selectedOption = options.find((o) => o.value === value);
  const displayValue = isOpen ? searchText : selectedOption?.label || "";

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg ring-0 focus:outline-none transition-all ${
            disabled
              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
              : "bg-white"
          }`}
          value={displayValue}
          onChange={handleInputChange}
          onClick={handleInputClick}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
        />

        {/* Dropdown Arrow */}
        <button
          type="button"
          className={`absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          } ${
            disabled
              ? "text-gray-400 cursor-not-allowed"
              : "hover:text-gray-700"
          }`}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          disabled={disabled}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="px-3 py-2 text-gray-500 text-center">
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-4 w-4 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Searching...
              </div>
            </div>
          ) : filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <div
                key={option.value}
                className={`px-3 py-2 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 flex justify-between items-center ${
                  index === highlightedIndex
                    ? "bg-blue-50 text-blue-700"
                    : value === option.value
                    ? "bg-blue-50 text-blue-700"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => handleSelect(option)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                {option.label}
                {value === option.value && (
                  <FaCheck className="ml-2 text-blue-500" size={14} />
                )}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-gray-500 italic text-center">
              {onSearchTextChange && searchText
                ? "No results found"
                : "No options available"}
            </div>
          )}
        </div>
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default SearchSelectExtraLabel;
