import { Artist, ClientArtistSearch } from './ClientArtistSearch';
import { AppleMusicSearch } from './AppleMusicSearch';
import { MusicBrainzMapping } from './MusicBrainzMapping';

export interface SearchResult {
  artists: Artist[];
  source: 'client' | 'apple' | 'hybrid';
  hasMore?: boolean;
}

export interface SetlistData {
  songs: Array<{
    name: string;
    frequency: number;
    playedIn: string;
    duration?: string;
  }>;
  context: string;
  confidence: string;
}

export class OptimalArtistSearch {
  private clientSearch: ClientArtistSearch;
  private appleMusicSearch: AppleMusicSearch;
  private musicBrainzMapping: MusicBrainzMapping;
  private searchCache = new Map<string, SearchResult>();
  private setlistCache = new Map<string, SetlistData>();

  constructor() {
    this.clientSearch = new ClientArtistSearch();
    this.appleMusicSearch = new AppleMusicSearch();
    this.musicBrainzMapping = new MusicBrainzMapping();
  }

  /**
   * Main search method that intelligently routes queries
   * @param query - Search query from user
   * @returns Promise<SearchResult> - Artists from appropriate source
   */
  async search(query: string): Promise<SearchResult> {
    // Handle empty query - return recently played
    if (!query || query.length === 0) {
      return {
        artists: this.clientSearch.getRecentlyPlayed(),
        source: 'client'
      };
    }

    // Check cache first
    const cacheKey = query.toLowerCase().trim();
    if (this.searchCache.has(cacheKey)) {
      return this.searchCache.get(cacheKey)!;
    }

    let result: SearchResult;

    if (query.length < 3) {
      // Short queries: Use client-side search for instant results
      result = {
        artists: this.clientSearch.search(query),
        source: 'client'
      };
    } else {
      // Longer queries: Try Apple Music API for comprehensive results
      try {
        const appleResults = await this.appleMusicSearch.search(query);
        
        if (appleResults.length > 0) {
          result = {
            artists: appleResults,
            source: 'apple',
            hasMore: appleResults.length >= 8
          };
        } else {
          // Fallback to client search if Apple Music returns nothing
          result = {
            artists: this.clientSearch.search(query),
            source: 'client'
          };
        }
      } catch (error) {
        console.error('Apple Music search failed, falling back to client:', error);
        result = {
          artists: this.clientSearch.search(query),
          source: 'client'
        };
      }
    }

    // Cache successful results
    if (result.artists.length > 0) {
      this.searchCache.set(cacheKey, result);
    }

    return result;
  }

  /**
   * Get setlist data for a selected artist
   * @param artist - Selected artist from search results
   * @returns Promise<SetlistData> - Setlist information
   */
  async getArtistSetlists(artist: Artist): Promise<SetlistData> {
    // Check cache first
    const cacheKey = `setlist_${artist.mbid || artist.name.toLowerCase()}`;
    if (this.setlistCache.has(cacheKey)) {
      return this.setlistCache.get(cacheKey)!;
    }

    try {
      let mbid = artist.mbid;

      // If artist doesn't have a MusicBrainz ID or is from Apple Music, map it
      if (!mbid || mbid.startsWith('apple_') || artist.source === 'apple') {
        const mapping = await this.musicBrainzMapping.findArtistMapping(artist.name);
        mbid = mapping.artist.mbid;
      }

      // Get setlist data (using mock data for now)
      const setlistData = this.getMockSetlistData(artist.name);
      
      // Cache the result
      this.setlistCache.set(cacheKey, setlistData);
      
      return setlistData;
    } catch (error) {
      console.error('Error getting setlist data:', error);
      
      // Fallback to mock data
      const mockData = this.getMockSetlistData(artist.name);
      return mockData;
    }
  }

  /**
   * Enhanced search that merges client and Apple Music results
   * @param query - Search query
   * @returns Promise<SearchResult> - Combined results
   */
  async hybridSearch(query: string): Promise<SearchResult> {
    if (!query || query.length < 3) {
      return this.search(query);
    }

    try {
      // Get results from both sources
      const [clientResults, appleResults] = await Promise.all([
        Promise.resolve(this.clientSearch.search(query)),
        this.appleMusicSearch.search(query).catch(() => [])
      ]);

      // Merge and deduplicate results
      const mergedResults = this.mergeResults(clientResults, appleResults);

      const result: SearchResult = {
        artists: mergedResults,
        source: 'hybrid',
        hasMore: appleResults.length >= 8
      };

      // Cache the result
      this.searchCache.set(query.toLowerCase().trim(), result);

      return result;
    } catch (error) {
      console.error('Hybrid search failed:', error);
      return this.search(query);
    }
  }

  /**
   * Get recently played artists (simulated with real Apple Music artwork)
   */
  async getRecentlyPlayedWithArtwork(): Promise<Artist[]> {
    const popularArtistNames = [
      'Taylor Swift', 'Arctic Monkeys', 'Radiohead', 'The Strokes', 
      'Billie Eilish', 'Tame Impala', 'Glass Animals', 'Phoebe Bridgers'
    ];

    const artistsWithArtwork: Artist[] = [];

    for (const artistName of popularArtistNames) {
      try {
        const result = await this.appleMusicSearch.search(artistName);
        if (result.length > 0) {
          // Get the first result which should be the most relevant
          artistsWithArtwork.push(result[0]);
        }
      } catch (error) {
        console.warn(`Failed to fetch artwork for ${artistName}:`, error);
        // Add fallback from client search
        const clientResults = this.clientSearch.search(artistName);
        if (clientResults.length > 0) {
          artistsWithArtwork.push(clientResults[0]);
        }
      }
    }

    return artistsWithArtwork;
  }

  /**
   * Get recently played artists (fallback method)
   */
  getRecentlyPlayed(): Artist[] {
    return this.clientSearch.getRecentlyPlayed();
  }

  /**
   * Check if an artist exists in the client index
   */
  hasArtistInIndex(artistName: string): boolean {
    return this.clientSearch.hasArtist(artistName);
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.searchCache.clear();
    this.setlistCache.clear();
    this.appleMusicSearch.clearCache();
    this.musicBrainzMapping.clearCache();
  }

  /**
   * Merge results from different sources, prioritizing quality
   */
  private mergeResults(clientResults: Artist[], appleResults: Artist[]): Artist[] {
    const merged = [...clientResults];
    
    // Add Apple Music results that aren't already in client results
    appleResults.forEach(appleArtist => {
      const normalizedAppleName = appleArtist.name.toLowerCase();
      const exists = merged.some(clientArtist => 
        clientArtist.name.toLowerCase() === normalizedAppleName
      );
      
      if (!exists) {
        merged.push(appleArtist);
      }
    });

    // Sort by relevance: exact matches first, then by source preference
    return merged
      .sort((a, b) => {
        // Prioritize verified artists
        if (a.verified !== b.verified) {
          return b.verified ? 1 : -1;
        }
        
        // Prioritize client results (better MusicBrainz mapping)
        if (a.source !== b.source) {
          if (a.source === 'client') return -1;
          if (b.source === 'client') return 1;
        }
        
        return 0;
      })
      .slice(0, 8); // Limit to 8 results
  }

  /**
   * Mock setlist data generator
   */
  private getMockSetlistData(artistName: string): SetlistData {
    // This would be replaced with real setlist.fm API calls
    const mockSetlists: Record<string, SetlistData> = {
      'Taylor Swift': {
        songs: [
          { name: 'Lavender Haze', frequency: 95, playedIn: '19/20 shows', duration: '3:22' },
          { name: 'Anti-Hero', frequency: 92, playedIn: '18/20 shows', duration: '3:20' },
          { name: 'Midnight Rain', frequency: 89, playedIn: '17/20 shows', duration: '2:54' },
          { name: 'Love Story', frequency: 87, playedIn: '17/20 shows', duration: '3:55' },
          { name: 'Shake It Off', frequency: 84, playedIn: '16/20 shows', duration: '3:39' },
          { name: 'Blank Space', frequency: 82, playedIn: '16/20 shows', duration: '3:51' },
          { name: 'We Are Never Getting Back Together', frequency: 79, playedIn: '15/20 shows', duration: '3:13' },
          { name: '22', frequency: 76, playedIn: '15/20 shows', duration: '3:52' },
          { name: 'You Belong With Me', frequency: 73, playedIn: '14/20 shows', duration: '3:51' },
          { name: 'Enchanted', frequency: 68, playedIn: '13/20 shows', duration: '5:52' },
          { name: 'All Too Well (10 Minute Version)', frequency: 65, playedIn: '13/20 shows', duration: '10:13' },
          { name: 'Style', frequency: 61, playedIn: '12/20 shows', duration: '3:51' },
        ],
        context: 'Based on 20 shows from Eras Tour 2024',
        confidence: 'high'
      },
      'Arctic Monkeys': {
        songs: [
          { name: 'Do I Wanna Know?', frequency: 94, playedIn: '17/18 shows', duration: '4:32' },
          { name: 'R U Mine?', frequency: 91, playedIn: '16/18 shows', duration: '3:21' },
          { name: 'I Bet You Look Good on the Dancefloor', frequency: 89, playedIn: '16/18 shows', duration: '2:53' },
          { name: 'Fluorescent Adolescent', frequency: 86, playedIn: '15/18 shows', duration: '2:57' },
          { name: 'When the Sun Goes Down', frequency: 83, playedIn: '15/18 shows', duration: '3:20' },
          { name: 'Knee Socks', frequency: 78, playedIn: '14/18 shows', duration: '4:17' },
          { name: '505', frequency: 75, playedIn: '13/18 shows', duration: '4:13' },
          { name: 'Arabella', frequency: 72, playedIn: '13/18 shows', duration: '3:27' },
          { name: 'The View from the Afternoon', frequency: 67, playedIn: '12/18 shows', duration: '3:38' },
          { name: 'Mardy Bum', frequency: 64, playedIn: '11/18 shows', duration: '2:55' },
        ],
        context: 'Based on 18 shows from 2023 tour',
        confidence: 'high'
      },
      'Radiohead': {
        songs: [
          { name: 'Creep', frequency: 88, playedIn: '15/17 shows', duration: '3:58' },
          { name: 'Paranoid Android', frequency: 85, playedIn: '14/17 shows', duration: '6:23' },
          { name: 'Karma Police', frequency: 82, playedIn: '14/17 shows', duration: '4:21' },
          { name: 'No Surprises', frequency: 79, playedIn: '13/17 shows', duration: '3:48' },
          { name: 'Everything In Its Right Place', frequency: 76, playedIn: '13/17 shows', duration: '4:11' },
          { name: 'Fake Plastic Trees', frequency: 71, playedIn: '12/17 shows', duration: '4:50' },
          { name: 'High and Dry', frequency: 68, playedIn: '11/17 shows', duration: '4:17' },
          { name: '15 Step', frequency: 65, playedIn: '11/17 shows', duration: '3:57' },
          { name: 'Street Spirit (Fade Out)', frequency: 62, playedIn: '10/17 shows', duration: '4:12' },
          { name: 'Lucky', frequency: 59, playedIn: '10/17 shows', duration: '4:19' },
        ],
        context: 'Based on 17 shows from recent tours (2022-2023)',
        confidence: 'medium'
      }
    };

    // Return specific data if available, otherwise generate generic data
    return mockSetlists[artistName] || {
      songs: [
        { name: 'Popular Song 1', frequency: 90, playedIn: '9/10 shows', duration: '3:45' },
        { name: 'Popular Song 2', frequency: 85, playedIn: '8/10 shows', duration: '4:12' },
        { name: 'Popular Song 3', frequency: 80, playedIn: '8/10 shows', duration: '3:28' },
        { name: 'Fan Favorite', frequency: 75, playedIn: '7/10 shows', duration: '4:55' },
        { name: 'Classic Hit', frequency: 70, playedIn: '7/10 shows', duration: '3:33' },
        { name: 'Deep Cut', frequency: 65, playedIn: '6/10 shows', duration: '5:21' },
        { name: 'Encore Song', frequency: 60, playedIn: '6/10 shows', duration: '4:02' },
        { name: 'Recent Single', frequency: 55, playedIn: '5/10 shows', duration: '3:15' },
      ],
      context: `Based on recent ${artistName} shows`,
      confidence: 'medium'
    };
  }
}