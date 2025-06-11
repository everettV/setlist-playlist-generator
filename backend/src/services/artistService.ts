import axios from 'axios';

const SETLISTFM_API_KEY = process.env.SETLISTFM_API_KEY;
const BASE_URL = 'https://api.setlist.fm/rest/1.0';

export interface Artist {
  mbid: string;
  name: string;
  sortName: string;
  disambiguation?: string;
  url: string;
}

export interface ArtistSearchResponse {
  artist: Artist[];
  total: number;
  page: number;
  itemsPerPage: number;
}

export const searchArtists = async (query: string): Promise<Artist[]> => {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    const response = await axios.get(`${BASE_URL}/search/artists`, {
      params: {
        artistName: query,
        p: 1,
        sort: 'relevance'
      },
      headers: {
        'x-api-key': SETLISTFM_API_KEY,
        'Accept': 'application/json',
        'User-Agent': 'SetlistPlaylistGenerator/1.0'
      }
    });

    return response.data.artist || [];
  } catch (error) {
    console.error('Error searching artists:', error);
    return [];
  }
};
