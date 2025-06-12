import React, { useState, useEffect, useRef } from 'react';

interface Artist {
  mbid: string;
  name: string;
  sortName: string;
  disambiguation?: string;
  source?: 'musicbrainz' | 'setlistfm';
  verified?: boolean;
}

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
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mock data for testing
  const mockArtists: Artist[] = [
    { mbid: '1', name: 'Taylor Swift', sortName: 'Swift, Taylor', verified: true },
    { mbid: '2', name: 'Ed Sheeran', sortName: 'Sheeran, Ed', verified: true },
    { mbid: '3', name: 'Coldplay', sortName: 'Coldplay', verified: true },
    { mbid: '4', name: 'Radiohead', sortName: 'Radiohead', verified: true },
    { mbid: '5', name: 'Arctic Monkeys', sortName: 'Arctic Monkeys', verified: true },
    { mbid: '6', name: 'The Beatles', sortName: 'Beatles, The', verified: true },
    { mbid: '7', name: 'Queen', sortName: 'Queen', verified: true },
    { mbid: '8', name: 'Pink Floyd', sortName: 'Pink Floyd', verified: true },
    { mbid: '9', name: 'The Rolling Stones', sortName: 'Rolling Stones, The', verified: true },
    { mbid: '10', name: 'Led Zeppelin', sortName: 'Led Zeppelin', verified: true },
    { mbid: '11', name: 'Billie Eilish', sortName: 'Eilish, Billie', verified: true },
    { mbid: '12', name: 'Harry Styles', sortName: 'Styles, Harry', verified: true },
    { mbid: '13', name: 'Dua Lipa', sortName: 'Lipa, Dua', verified: true },
    { mbid: '14', name: 'The Weeknd', sortName: 'Weeknd, The', verified: true },
    { mbid: '15', name: 'Olivia Rodrigo', sortName: 'Rodrigo, Olivia', verified: true }
  ];

  const debouncedSearch = useRef(
    debounce((query: string) => {
      if (query.length < 2) {
        setSuggestions([]);
        setShowDropdown(false);
        return;
      }

      setIsLoading(true);
      
      // Filter mock artists based on query
      const filteredArtists = mockArtists.filter(artist => 
        artist.name.toLowerCase().includes(query.toLowerCase())
      );

      // Simulate API delay
      setTimeout(() => {
        setSuggestions(filteredArtists);
        setShowDropdown(filteredArtists.length > 0);
        setHighlightedIndex(-1);
        setIsLoading(false);
      }, 300);
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
          {suggestions.map((artist, index) => (
            <div
              key={artist.mbid}
              className={`px-4 py-3 cursor-pointer transition-colors ${
                index === highlightedIndex 
                  ? 'bg-teal-50 text-teal-800' 
                  : 'hover:bg-gray-50'
              } ${index === 0 ? 'rounded-t-lg' : ''} ${
                index === suggestions.length - 1 ? 'rounded-b-lg' : 'border-b border-gray-100'
              }`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelectArtist(artist)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{artist.name}</div>
                  {artist.disambiguation && (
                    <div className="text-sm text-gray-500 mt-1">
                      {artist.disambiguation}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  {artist.verified && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                      Has Setlists
                    </span>
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