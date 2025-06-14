import React, { useState, useEffect, useRef } from 'react';
import { OptimalArtistSearch, SearchResult } from '../services/OptimalArtistSearch';
import { Artist } from '../services/ClientArtistSearch';

interface MockArtistAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (artist: Artist) => void;
  placeholder?: string;
  className?: string;
}

const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const MockArtistAutocomplete: React.FC<MockArtistAutocompleteProps> = ({
  value,
  onChange,
  onSelect,
  placeholder = "Search for an artist...",
  className = ""
}) => {
  const [suggestions, setSuggestions] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchService = useRef(new OptimalArtistSearch());

  const debouncedSearch = useRef(
    debounce(async (query: string) => {
      try {
        setIsLoading(true);
        
        // Use the optimal search service
        const result = await searchService.current.search(query);
        
        setSuggestions(result.artists);
        setSearchResult(result);
        setShowDropdown(result.artists.length > 0);
        setHighlightedIndex(-1);
      } catch (error) {
        console.error('Search error:', error);
        setSuggestions([]);
        setShowDropdown(false);
      } finally {
        setIsLoading(false);
      }
    }, 300)
  ).current;

  useEffect(() => {
    if (value.length > 0) {
      debouncedSearch(value);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
      setSearchResult(null);
    }
  }, [value, debouncedSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSelectArtist(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelectArtist = (artist: Artist) => {
    onChange(artist.name);
    onSelect(artist);
    setShowDropdown(false);
    setHighlightedIndex(-1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleInputFocus = async () => {
    // Only show dropdown if there are suggestions from typing
    if (value.length > 0 && suggestions.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleInputBlur = (e: React.FocusEvent) => {
    setTimeout(() => {
      if (!dropdownRef.current?.contains(e.relatedTarget as Node)) {
        setShowDropdown(false);
        setHighlightedIndex(-1);
      }
    }, 200);
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        className="w-full p-3 border border-gray-300 rounded-lg outline-none transition-all duration-150 ease-in-out focus:border-teal-600 focus:shadow-sm"
        autoComplete="off"
      />
      
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600"></div>
        </div>
      )}

      {showDropdown && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          
          {/* Artist results */}
          {suggestions.map((artist, index) => (
            <div
              key={artist.mbid}
              className={`px-4 py-3 cursor-pointer transition-colors ${
                index === highlightedIndex 
                  ? 'bg-teal-50 text-teal-800' 
                  : 'hover:bg-gray-50'
              } ${
                index === suggestions.length - 1 ? 'rounded-b-lg' : 'border-b border-gray-100'
              }`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelectArtist(artist)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="font-medium">
                    {artist.name}
                  </div>
                  {artist.disambiguation && (
                    <div className="text-sm text-gray-500 mt-1">
                      {artist.disambiguation}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDropdown && suggestions.length === 0 && !isLoading && value.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="px-4 py-3 text-gray-500">No artists found</div>
        </div>
      )}
    </div>
  );
};

export default MockArtistAutocomplete;