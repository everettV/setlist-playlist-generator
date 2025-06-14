// Client-side artist search for instant results
export interface Artist {
  mbid: string;
  name: string;
  sortName: string;
  disambiguation?: string;
  verified?: boolean;
  source?: 'client' | 'apple' | 'musicbrainz';
  artwork?: {
    url: string;
    width?: number;
    height?: number;
  };
}

// Pre-loaded artist index for fast client-side search
const POPULAR_ARTISTS: Artist[] = [
  // Top global artists for instant search
  { mbid: '20244d07-534f-4eff-b4d4-930878889970', name: 'Taylor Swift', sortName: 'Swift, Taylor', verified: true, source: 'client', artwork: { url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=face', width: 300, height: 300 } },
  { mbid: '6f70bfca-f3b3-4985-8074-d3a67aad0e8a', name: 'Drake', sortName: 'Drake', verified: true, source: 'client', artwork: { url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=face', width: 300, height: 300 } },
  { mbid: 'e17c5b5e-f7e2-4b7e-8c3e-b0d0b5e0b0b0', name: 'Bad Bunny', sortName: 'Bad Bunny', verified: true, source: 'client', artwork: { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face', width: 300, height: 300 } },
  { mbid: 'c14b4180-dc87-481e-b17a-64e4150f90f6', name: 'The Weeknd', sortName: 'Weeknd, The', verified: true, source: 'client', artwork: { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face&facepad=2', width: 300, height: 300 } },
  { mbid: 'f4fdbb4c-e4b7-47a0-b83b-d91bbfcfa387', name: 'Ariana Grande', sortName: 'Grande, Ariana', verified: true, source: 'client', artwork: { url: 'https://images.unsplash.com/photo-1494790108755-2616c9a0d5a3?w=300&h=300&fit=crop&crop=face', width: 300, height: 300 } },
  { mbid: 'e0140a67-e4d1-4f13-8a01-364355bee46e', name: 'Billie Eilish', sortName: 'Eilish, Billie', verified: true, source: 'client', artwork: { url: 'https://images.unsplash.com/photo-1540558741000-0b958e08b2bb?w=300&h=300&fit=crop&auto=format', width: 300, height: 300 } },
  { mbid: 'e3619e8c-6f8e-4c40-8e3f-1f6c5f5b9b9b', name: 'Justin Bieber', sortName: 'Bieber, Justin', verified: true, source: 'client', artwork: { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face&facepad=3', width: 300, height: 300 } },
  { mbid: 'a74b1b7f-71a5-4011-9441-d0b5e4122711', name: 'Radiohead', sortName: 'Radiohead', verified: true, source: 'client', artwork: { url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=face&facepad=3', width: 300, height: 300 } },
  { mbid: '2f9ecbed-27be-40e6-abca-6de49d50299e', name: 'Arctic Monkeys', sortName: 'Arctic Monkeys', verified: true, source: 'client', artwork: { url: 'https://images.unsplash.com/photo-1540558741000-0b958e08b2bb?w=300&h=300&fit=crop', width: 300, height: 300 } },
  { mbid: 'cc2c9c3c-b7bc-4b8b-84d8-ddd3b66c1d1d', name: 'Coldplay', sortName: 'Coldplay', verified: true, source: 'client', artwork: { url: 'https://images.unsplash.com/photo-1574170611101-e86a5f8ed5b8?w=300&h=300&fit=crop', width: 300, height: 300 } },
  { mbid: 'b7ffd2af-418d-4c50-b136-24359e2068e7', name: 'Ed Sheeran', sortName: 'Sheeran, Ed', verified: true, source: 'client', artwork: { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face&facepad=2', width: 300, height: 300 } },
  { mbid: 'ba550d0e-adac-4864-b88b-407cab5e76af', name: 'Queen', sortName: 'Queen', verified: true, source: 'client', artwork: { url: 'https://images.unsplash.com/photo-1515924141598-8a71b37df3de?w=300&h=300&fit=crop', width: 300, height: 300 } },
  { mbid: '83d91898-7763-47d7-b03b-b92132375c47', name: 'Pink Floyd', sortName: 'Pink Floyd', verified: true, source: 'client', artwork: { url: 'https://images.unsplash.com/photo-1515924141598-8a71b37df3de?w=300&h=300&fit=crop&auto=format', width: 300, height: 300 } },
  { mbid: 'b071f9fa-14b0-4217-8e97-eb41da73f598', name: 'The Rolling Stones', sortName: 'Rolling Stones, The', verified: true, source: 'client', artwork: { url: 'https://images.unsplash.com/photo-1515924141598-8a71b37df3de?w=300&h=300&fit=crop&auto=format&colorize=gray', width: 300, height: 300 } },
  { mbid: '678d88b2-87b0-403b-b63d-5da7465aecc3', name: 'Led Zeppelin', sortName: 'Led Zeppelin', verified: true, source: 'client', artwork: { url: 'https://images.unsplash.com/photo-1515924141598-8a71b37df3de?w=300&h=300&fit=crop&auto=format&colorize=gold', width: 300, height: 300 } },
  { mbid: '164f0d73-1234-4e2c-8743-d77bf2191051', name: 'The Beatles', sortName: 'Beatles, The', verified: true, source: 'client', artwork: { url: 'https://images.unsplash.com/photo-1540558741000-0b958e08b2bb?w=300&h=300&fit=crop&auto=format&colorize=silver', width: 300, height: 300 } },
  { mbid: '69b39eab-6577-46a4-a9f5-817839092033', name: 'BTS', sortName: 'BTS', verified: true, source: 'client', artwork: { url: 'https://images.unsplash.com/photo-1574170611101-e86a5f8ed5b8?w=300&h=300&fit=crop&auto=format&colorize=purple', width: 300, height: 300 } },
  { mbid: 'd0b1fc72-1234-4567-8901-23456789abcd', name: 'Olivia Rodrigo', sortName: 'Rodrigo, Olivia', verified: true, source: 'client', artwork: { url: 'https://images.unsplash.com/photo-1494790108755-2616c9a0d5a3?w=300&h=300&fit=crop&crop=face&facepad=2', width: 300, height: 300 } },
  { mbid: 'e1f1e33e-2e2e-4a4a-8f8f-1c1c1c1c1c1c', name: 'Dua Lipa', sortName: 'Lipa, Dua', verified: true, source: 'client', artwork: { url: 'https://images.unsplash.com/photo-1494790108755-2616c9a0d5a3?w=300&h=300&fit=crop&crop=face&facepad=3', width: 300, height: 300 } },
  { mbid: 'f2f2f2f2-3f3f-4f4f-5f5f-6f6f6f6f6f6f', name: 'Harry Styles', sortName: 'Styles, Harry', verified: true, source: 'client', artwork: { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face&facepad=4', width: 300, height: 300 } },
  // Alternative/Indie favorites
  { mbid: 'b1e26560-60e5-4236-bbdb-9aa5a8d5ee19', name: 'Tame Impala', sortName: 'Tame Impala', verified: true, source: 'client', artwork: { url: 'https://images.unsplash.com/photo-1540558741000-0b958e08b2bb?w=300&h=300&fit=crop&auto=format&colorize=purple', width: 300, height: 300 } },
  { mbid: 'd5be5333-4171-427e-8e12-732087c6b78e', name: 'Glass Animals', sortName: 'Glass Animals', verified: true, source: 'client', artwork: { url: 'https://images.unsplash.com/photo-1540558741000-0b958e08b2bb?w=300&h=300&fit=crop&auto=format&colorize=blue', width: 300, height: 300 } },
  { mbid: 'a5a5a5a5-b5b5-c5c5-d5d5-e5e5e5e5e5e5', name: 'Phoebe Bridgers', sortName: 'Bridgers, Phoebe', verified: true, source: 'client', artwork: { url: 'https://images.unsplash.com/photo-1494790108755-2616c9a0d5a3?w=300&h=300&fit=crop&crop=face&facepad=6', width: 300, height: 300 } },
  { mbid: 'af37c51c-0790-4a29-b995-456f98a6b8c9', name: 'Vampire Weekend', sortName: 'Vampire Weekend', verified: true, source: 'client', artwork: { url: 'https://images.unsplash.com/photo-1574170611101-e86a5f8ed5b8?w=300&h=300&fit=crop&auto=format&colorize=orange', width: 300, height: 300 } },
  { mbid: 'b6b6b6b6-c6c6-d6d6-e6e6-f6f6f6f6f6f6', name: 'The Strokes', sortName: 'Strokes, The', verified: true, source: 'client', artwork: { url: 'https://images.unsplash.com/photo-1515924141598-8a71b37df3de?w=300&h=300&fit=crop&auto=format&colorize=gray', width: 300, height: 300 } },
  { mbid: 'c7c7c7c7-d7d7-e7e7-f7f7-1a1a1a1a1a1a', name: 'Mac Miller', sortName: 'Miller, Mac', verified: true, source: 'client', artwork: { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face&facepad=3', width: 300, height: 300 } },
  // Hip-hop/R&B
  { mbid: 'd8d8d8d8-e8e8-f8f8-1b1b-2b2b2b2b2b2b', name: 'Kendrick Lamar', sortName: 'Lamar, Kendrick', verified: true, source: 'client', artwork: { url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=face&facepad=2', width: 300, height: 300 } },
  { mbid: 'e9e9e9e9-f9f9-1c1c-2c2c-3c3c3c3c3c3c', name: 'SZA', sortName: 'SZA', verified: true, source: 'client', artwork: { url: 'https://images.unsplash.com/photo-1494790108755-2616c9a0d5a3?w=300&h=300&fit=crop&crop=face&facepad=4', width: 300, height: 300 } },
  { mbid: 'f0f0f0f0-1d1d-2d2d-3d3d-4d4d4d4d4d4d', name: 'Frank Ocean', sortName: 'Ocean, Frank', verified: true, source: 'client', artwork: { url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=face&facepad=3', width: 300, height: 300 } },
  { mbid: '1e1e1e1e-2e2e-3e3e-4e4e-5e5e5e5e5e5e', name: 'Tyler, The Creator', sortName: 'Tyler, The Creator', verified: true, source: 'client', artwork: { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face&facepad=8', width: 300, height: 300 } },
];

// Recently played artists (simulated from user's Apple Music)
const RECENTLY_PLAYED: Artist[] = [
  { mbid: '20244d07-534f-4eff-b4d4-930878889970', name: 'Taylor Swift', sortName: 'Swift, Taylor', verified: true, source: 'client', artwork: { url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=face', width: 300, height: 300 } },
  { mbid: '2f9ecbed-27be-40e6-abca-6de49d50299e', name: 'Arctic Monkeys', sortName: 'Arctic Monkeys', verified: true, source: 'client', artwork: { url: 'https://images.unsplash.com/photo-1540558741000-0b958e08b2bb?w=300&h=300&fit=crop', width: 300, height: 300 } },
  { mbid: 'a74b1b7f-71a5-4011-9441-d0b5e4122711', name: 'Radiohead', sortName: 'Radiohead', verified: true, source: 'client', artwork: { url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=face&facepad=3', width: 300, height: 300 } },
  { mbid: 'b6b6b6b6-c6c6-d6d6-e6e6-f6f6f6f6f6f6', name: 'The Strokes', sortName: 'Strokes, The', verified: true, source: 'client', artwork: { url: 'https://images.unsplash.com/photo-1515924141598-8a71b37df3de?w=300&h=300&fit=crop&auto=format&colorize=gray', width: 300, height: 300 } },
  { mbid: 'e0140a67-e4d1-4f13-8a01-364355bee46e', name: 'Billie Eilish', sortName: 'Eilish, Billie', verified: true, source: 'client', artwork: { url: 'https://images.unsplash.com/photo-1540558741000-0b958e08b2bb?w=300&h=300&fit=crop&auto=format', width: 300, height: 300 } },
  { mbid: 'b1e26560-60e5-4236-bbdb-9aa5a8d5ee19', name: 'Tame Impala', sortName: 'Tame Impala', verified: true, source: 'client', artwork: { url: 'https://images.unsplash.com/photo-1540558741000-0b958e08b2bb?w=300&h=300&fit=crop&auto=format&colorize=purple', width: 300, height: 300 } },
  { mbid: 'd5be5333-4171-427e-8e12-732087c6b78e', name: 'Glass Animals', sortName: 'Glass Animals', verified: true, source: 'client', artwork: { url: 'https://images.unsplash.com/photo-1540558741000-0b958e08b2bb?w=300&h=300&fit=crop&auto=format&colorize=blue', width: 300, height: 300 } },
  { mbid: 'a5a5a5a5-b5b5-c5c5-d5d5-e5e5e5e5e5e5', name: 'Phoebe Bridgers', sortName: 'Bridgers, Phoebe', verified: true, source: 'client', artwork: { url: 'https://images.unsplash.com/photo-1494790108755-2616c9a0d5a3?w=300&h=300&fit=crop&crop=face&facepad=6', width: 300, height: 300 } },
];

// Simple fuzzy search implementation
class FuzzySearch {
  private artists: Artist[];

  constructor(artists: Artist[]) {
    this.artists = artists;
  }

  search(query: string, limit: number = 8): Artist[] {
    if (!query || query.length === 0) {
      return [];
    }

    const normalizedQuery = this.normalize(query);
    const results: { artist: Artist; score: number }[] = [];

    for (const artist of this.artists) {
      const score = this.calculateScore(normalizedQuery, artist);
      if (score > 0.3) {
        results.push({ artist, score });
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(result => result.artist);
  }

  private normalize(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove special chars
      .replace(/\s+/g, ' ')     // Normalize whitespace
      .replace(/^the\s+/i, '')  // Remove "The" prefix
      .trim();
  }

  private calculateScore(query: string, artist: Artist): number {
    const normalizedName = this.normalize(artist.name);
    
    // Exact match
    if (normalizedName === query) return 1.0;
    
    // Starts with query
    if (normalizedName.startsWith(query)) return 0.9;
    
    // Contains query
    if (normalizedName.includes(query)) return 0.7;
    
    // Word boundaries
    const words = normalizedName.split(' ');
    for (const word of words) {
      if (word.startsWith(query)) return 0.6;
      if (word.includes(query)) return 0.4;
    }
    
    return 0;
  }
}

export class ClientArtistSearch {
  private fuzzySearch: FuzzySearch;

  constructor() {
    this.fuzzySearch = new FuzzySearch(POPULAR_ARTISTS);
  }

  search(query: string): Artist[] {
    if (!query || query.length === 0) {
      return this.getRecentlyPlayed();
    }

    if (query.length < 2) {
      // For very short queries, filter recently played
      const filtered = RECENTLY_PLAYED.filter(artist =>
        artist.name.toLowerCase().startsWith(query.toLowerCase())
      );
      return filtered.length > 0 ? filtered : this.getRecentlyPlayed();
    }

    return this.fuzzySearch.search(query);
  }

  getRecentlyPlayed(): Artist[] {
    return [...RECENTLY_PLAYED];
  }

  // Check if artist exists in client index
  hasArtist(artistName: string): boolean {
    const normalized = artistName.toLowerCase();
    return POPULAR_ARTISTS.some(artist => 
      artist.name.toLowerCase() === normalized
    );
  }
}