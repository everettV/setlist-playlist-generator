import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Artist {
  id: string;
  name: string;
  disambiguation?: string;
  sortName?: string;
}

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (artist: Artist) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  value,
  onChange,
  onSelect,
  placeholder = "Artist Name",
  disabled = false,
  className = ""
}) => {
  const [suggestions, setSuggestions] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);

  const searchArtists = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      const backendUrl = process.env.NODE_ENV === 'production' 
        ? 'https://setlist-playlist-generator.onrender.com'
        : 'http://localhost:3001';
        
      const response = await fetch(`${backendUrl}/api/artist/search?q=${encodeURIComponent(query)}&limit=6`);
      
      if (response.ok) {
        const artists = await response.json();
        setSuggestions(artists);
        setShowSuggestions(artists.length > 0);
        setSelectedIndex(-1);
      } else {
        console.error('Failed to search artists:', response.status);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Artist search error:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    const timer = setTimeout(() => {
      searchArtists(newValue);
    }, 300);
    
    setDebounceTimer(timer);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelectArtist(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSelectArtist = (artist: Artist) => {
    onChange(artist.name);
    onSelect?.(artist);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    setSuggestions([]);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 150);
  };

  const handleFocus = () => {
    if (suggestions.length > 0 && value.length >= 2) {
      setShowSuggestions(true);
    }
  };

  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className="w-full p-3 border border-gray-300 rounded-lg outline-none transition-all duration-150 ease-in-out focus:border-teal-600 focus:shadow-sm"
        />
        
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600"></div>
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {suggestions.map((artist, index) => (
            <li
              key={artist.id || index}
              className={`px-4 py-3 cursor-pointer transition-colors ${
                index === selectedIndex 
                  ? 'bg-teal-50 text-teal-800' 
                  : 'hover:bg-gray-50'
              } ${index === 0 ? 'rounded-t-lg' : ''} ${
                index === suggestions.length - 1 ? 'rounded-b-lg' : 'border-b border-gray-100'
              }`}
              onClick={() => handleSelectArtist(artist)}
            >
              <div className="font-medium">{artist.name}</div>
              {artist.disambiguation && (
                <div className="text-sm text-gray-500 mt-1">
                  {artist.disambiguation}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutocompleteInput;
