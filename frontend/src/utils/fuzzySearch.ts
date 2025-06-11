interface Artist {
  id: string;
  name: string;
  disambiguation?: string;
  sortName?: string;
}

interface FuzzyResult extends Artist {
  score: number;
  matchType: 'exact' | 'starts' | 'contains' | 'fuzzy';
}

export function fuzzySearchArtists(query: string, artists: Artist[]): FuzzyResult[] {
  if (!query || query.length < 2) return [];
  
  const normalizedQuery = query.toLowerCase().trim();
  const results: FuzzyResult[] = [];
  
  for (const artist of artists) {
    const normalizedName = artist.name.toLowerCase();
    let score = 0;
    let matchType: FuzzyResult['matchType'] = 'fuzzy';
    
    // Exact match (highest priority)
    if (normalizedName === normalizedQuery) {
      score = 100;
      matchType = 'exact';
    }
    // Starts with query
    else if (normalizedName.startsWith(normalizedQuery)) {
      score = 90;
      matchType = 'starts';
    }
    // Contains query
    else if (normalizedName.includes(normalizedQuery)) {
      score = 80;
      matchType = 'contains';
    }
    // Fuzzy match - check for character sequence
    else {
      const fuzzyScore = calculateFuzzyScore(normalizedQuery, normalizedName);
      if (fuzzyScore > 0.3) { // Threshold for relevance
        score = Math.floor(fuzzyScore * 70); // Max 70 for fuzzy matches
        matchType = 'fuzzy';
      }
    }
    
    if (score > 0) {
      results.push({
        ...artist,
        score,
        matchType
      });
    }
  }
  
  // Sort by score (highest first), then by name length (shorter first)
  return results
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.name.length - b.name.length;
    })
    .slice(0, 8); // Limit to top 8 results
}

function calculateFuzzyScore(query: string, target: string): number {
  // Simple fuzzy matching algorithm
  let queryIndex = 0;
  let matchedChars = 0;
  
  for (let i = 0; i < target.length && queryIndex < query.length; i++) {
    if (target[i] === query[queryIndex]) {
      matchedChars++;
      queryIndex++;
    }
  }
  
  // Calculate score based on matched characters and positions
  const completeness = matchedChars / query.length;
  const density = matchedChars / target.length;
  
  return completeness * 0.8 + density * 0.2;
}

// Enhanced search that tries multiple approaches
export async function enhancedArtistSearch(query: string): Promise<FuzzyResult[]> {
  const searches = [];
  
  // Original query
  searches.push(fetchArtists(query));
  
  // If query is partial, try some variations
  if (query.length >= 3) {
    // Try with first few characters
    const shortQuery = query.substring(0, Math.max(3, Math.floor(query.length * 0.7)));
    if (shortQuery !== query) {
      searches.push(fetchArtists(shortQuery));
    }
  }
  
  try {
    const results = await Promise.all(searches);
    const allArtists = results.flat();
    
    // Remove duplicates
    const uniqueArtists = allArtists.filter((artist, index, self) => 
      index === self.findIndex(a => a.id === artist.id)
    );
    
    return fuzzySearchArtists(query, uniqueArtists);
  } catch (error) {
    console.error('Enhanced search error:', error);
    return [];
  }
}

async function fetchArtists(query: string): Promise<Artist[]> {
  const backendUrl = process.env.NODE_ENV === 'production' 
    ? 'https://setlist-playlist-generator.onrender.com'
    : 'http://localhost:3001';
    
  const response = await fetch(`${backendUrl}/api/artist/search?q=${encodeURIComponent(query)}`);
  
  if (response.ok) {
    return await response.json();
  }
  
  return [];
}
