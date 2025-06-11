import axios from 'axios';

const MUSICBRAINZ_BASE_URL = 'https://musicbrainz.org/ws/2';

export interface MusicBrainzArtist {
  id: string; // MBID
  name: string;
  'sort-name': string;
  disambiguation?: string;
  'type'?: string;
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
    // Use fuzzy search with ~ operator and alias searching
    const fuzzyQuery = `${query}~ OR alias:${query}~ OR artist:${query}*`;
    
    const response = await axios.get(`${MUSICBRAINZ_BASE_URL}/artist`, {
      params: {
        query: fuzzyQuery,
        fmt: 'json',
        limit: 10
      },
      headers: {
        'User-Agent': 'SetlistPlaylistGenerator/1.0 (https://yourapp.com)'
      }
    });

    return response.data.artists || [];
  } catch (error) {
    console.error('Error searching MusicBrainz artists:', error);
    return [];
  }
};

export const searchArtistsExact = async (query: string): Promise<MusicBrainzArtist[]> => {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    const response = await axios.get(`${MUSICBRAINZ_BASE_URL}/artist`, {
      params: {
        query: `artist:"${query}"`,
        fmt: 'json',
        limit: 5
      },
      headers: {
        'User-Agent': 'SetlistPlaylistGenerator/1.0 (https://yourapp.com)'
      }
    });

    return response.data.artists || [];
  } catch (error) {
    console.error('Error searching MusicBrainz artists exact:', error);
    return [];
  }
};
