import { searchArtistsFuzzy, searchArtistsExact, MusicBrainzArtist } from './musicBrainzService';
import { searchArtists as searchSetlistFmArtists } from './artistService';

export interface HybridArtist {
  mbid: string;
  name: string;
  sortName: string;
  disambiguation?: string;
  source: 'musicbrainz' | 'setlistfm';
  score?: number;
  verified: boolean; // true if we confirmed this artist has setlists
}

export const searchArtistsHybrid = async (query: string): Promise<HybridArtist[]> => {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    // Search both APIs in parallel
    const [musicBrainzResults, setlistFmResults] = await Promise.all([
      searchArtistsFuzzy(query),
      searchSetlistFmArtists(query)
    ]);

    // Convert MusicBrainz results
    const mbResults: HybridArtist[] = musicBrainzResults.map(artist => ({
      mbid: artist.id,
      name: artist.name,
      sortName: artist['sort-name'],
      disambiguation: artist.disambiguation,
      source: 'musicbrainz' as const,
      score: artist.score,
      verified: false
    }));

    // Convert Setlist.fm results (these are verified to have setlists)
    const setlistResults: HybridArtist[] = setlistFmResults.map(artist => ({
      mbid: artist.mbid,
      name: artist.name,
      sortName: artist.sortName,
      disambiguation: artist.disambiguation,
      source: 'setlistfm' as const,
      verified: true
    }));

    // Merge and deduplicate by MBID
    const allResults = [...setlistResults, ...mbResults];
    const uniqueResults = new Map<string, HybridArtist>();

    for (const artist of allResults) {
      const existing = uniqueResults.get(artist.mbid);
      if (!existing) {
        uniqueResults.set(artist.mbid, artist);
      } else if (artist.verified && !existing.verified) {
        // Prefer verified (setlist.fm) results
        uniqueResults.set(artist.mbid, { ...artist, verified: true });
      }
    }

    // Sort by relevance: verified first, then by score
    return Array.from(uniqueResults.values())
      .sort((a, b) => {
        if (a.verified && !b.verified) return -1;
        if (!a.verified && b.verified) return 1;
        return (b.score || 0) - (a.score || 0);
      })
      .slice(0, 10);

  } catch (error) {
    console.error('Error in hybrid artist search:', error);
    return [];
  }
};
