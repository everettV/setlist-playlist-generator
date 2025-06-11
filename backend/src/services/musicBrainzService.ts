import axios from 'axios';

const MUSICBRAINZ_BASE_URL = 'https://musicbrainz.org/ws/2';

export interface MusicBrainzArtist {
  id: string;
  name: string;
  'sort-name': string;
  disambiguation?: string;
  type?: string;
  'type-id'?: string;
  score: number;
  aliases?: Array<{
    name: string;
    'sort-name': string;
    type?: string;
  }>;
}

export interface MusicBrainzSearchResponse {
  created: string;
  count: number;
  offset: number;
  artists: MusicBrainzArtist[];
}

export const searchArtistsFuzzy = async (query: string): Promise<MusicBrainzArtist[]> => {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    const cleanQuery = query.replace(/[^a-zA-Z0-9\s]/g, '');
    const fuzzyQuery = `${cleanQuery}~`;
    
    const response = await axios.get(`${MUSICBRAINZ_BASE_URL}/artist`, {
      params: {
        query: fuzzyQuery,
        fmt: 'json',
        limit: 10
      },
      headers: {
        'User-Agent': 'SetlistPlaylistGenerator/1.0 (contact@example.com)',
        'Accept': 'application/json'
      },
      timeout: 5000
    });

    if (response.data && response.data.artists) {
      return response.data.artists.slice(0, 8);
    }
    
    return [];
  } catch (error) {
    console.error('MusicBrainz search error:', error);
    return [];
  }
};
