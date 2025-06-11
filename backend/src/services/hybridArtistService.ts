import { searchArtistsFuzzy, MusicBrainzArtist } from './musicBrainzService';

export interface HybridArtist {
  mbid: string;
  name: string;
  sortName: string;
  disambiguation?: string;
  source: 'musicbrainz' | 'setlistfm';
  score?: number;
  verified: boolean;
}

export const searchArtistsHybrid = async (query: string): Promise<HybridArtist[]> => {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    const musicBrainzResults = await searchArtistsFuzzy(query);

    const hybridResults: HybridArtist[] = musicBrainzResults.map(artist => ({
      mbid: artist.id,
      name: artist.name,
      sortName: artist['sort-name'],
      disambiguation: artist.disambiguation,
      source: 'musicbrainz' as const,
      score: artist.score || 100,
      verified: false
    }));

    return hybridResults.slice(0, 8);

  } catch (error) {
    console.error('Hybrid search error:', error);
    return [];
  }
};
