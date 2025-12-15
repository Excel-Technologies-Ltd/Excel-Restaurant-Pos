import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaCheck } from "react-icons/fa";

interface SearchSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  searchText?: string;
  onSearchTextChange?: (searchText: string) => void;
  isLoading?: boolean;
  label?: string;
  error?: string;
}

const SearchSelect: React.FC<SearchSelectProps> = ({
  options,
  value,
  onChange,
  disabled = false,
  placeholder = "Select an option...",
  searchText: externalSearchText,
  onSearchTextChange,
  isLoading = false,
  label,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalSearchText, setInternalSearchText] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use external search text if provided
  const searchText =
    externalSearchText !== undefined ? externalSearchText : internalSearchText;

  const setSearchText = (text: string) => {
    if (onSearchTextChange) {
      onSearchTextChange(text);
    } else {
      setInternalSearchText(text);
    }
  };

  // Filter options (local search only)
  const filteredOptions = onSearchTextChange
    ? options
    : options.filter((option) =>
        option.toLowerCase().includes(searchText.toLowerCase())
      );

  // Handle dropdown open/close behavior
  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(-1);

      // When opening, set search text to current value for editing
      if (value) {
        setSearchText(value);
      }
    } else {
      // When closing, clear local search text only
      if (!onSearchTextChange) {
        setSearchText("");
      }
    }
  }, [isOpen]);

  // Update dropdown position when open
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen]);

  // Update position on scroll/resize
  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    };

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  // Close dropdown when clicking outside (ignore input)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        event.target !== inputRef.current &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchText(newValue);

    // Open dropdown when typing
    if (!isOpen) setIsOpen(true);

    // Clear selected value if editing
    if (value && newValue !== value) {
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

  // Display value: show search text while open, value otherwise
  const displayValue = isOpen ? searchText : value;

  const dropdownContent = isOpen && (
    <div
      ref={dropdownRef}
      className="absolute z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto"
      style={{
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
        width: `${dropdownPosition.width}px`,
        marginTop: "4px",
      }}
    >
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
            key={option}
            className={`px-3 py-2 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 flex justify-between items-center ${
              index === highlightedIndex
                ? "bg-blue-50 text-blue-700"
                : value === option
                ? "bg-blue-50 text-blue-700"
                : "hover:bg-gray-50"
            }`}
            onClick={() => handleSelect(option)}
            onMouseEnter={() => setHighlightedIndex(index)}
          >
            {label ? label : option}
            {value === option && (
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
  );

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg ring-0 focus:ri focus:outline-none transition-all ${
            disabled
              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
              : "bg-white"
          }`}
          value={displayValue}
          autoFocus
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

      {/* Dropdown Menu - Rendered via Portal */}
      {dropdownContent && createPortal(dropdownContent, document.body)}

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default React.memo(SearchSelect);
