import React, { useState, useEffect, useRef } from 'react';
import { debounce } from 'lodash';

interface Artist {
  mbid: string;
  name: string;
  sortName: string;
  disambiguation?: string;
  source?: 'musicbrainz' | 'setlistfm';
  verified?: boolean;
}

interface ArtistAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (artist: Artist) => void;
  placeholder?: string;
  className?: string;
}

const ArtistAutocomplete: React.FC<ArtistAutocompleteProps> = ({
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
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useRef(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setSuggestions([]);
        setShowDropdown(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/artists/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setSuggestions(data.artists || []);
        setShowDropdown(true);
        setHighlightedIndex(-1);
      } catch (error) {
        console.error('Error searching artists:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300)
  ).current;

  useEffect(() => {
    debouncedSearch(value);
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

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
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
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        autoComplete="off"
      />
      
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        </div>
      )}

      {showDropdown && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((artist, index) => (
            <div
              key={artist.mbid}
              className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${
                index === highlightedIndex ? 'bg-blue-100' : ''
              }`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelectArtist(artist)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{artist.name}</div>
                  {artist.disambiguation && (
                    <div className="text-sm text-gray-500">{artist.disambiguation}</div>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  {artist.verified && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                      Has Setlists
                    </span>
                  )}
                  {artist.source === 'musicbrainz' && (
                    <span className="text-xs text-gray-400">MB</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDropdown && suggestions.length === 0 && !isLoading && value.length >= 2 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="px-4 py-2 text-gray-500">No artists found</div>
        </div>
      )}
    </div>
  );
};

export default ArtistAutocomplete;
