interface Artist {
  mbid: string;
  name: string;
  sortName: string;
  disambiguation?: string;
}

interface SetlistFmResponse {
  artist: Artist[];
  total: number;
  page: number;
  itemsPerPage: number;
}

export class SetlistService {
  private static baseUrl = 'https://api.setlist.fm/rest/1.0';
  private static apiKey = process.env.SETLISTFM_API_KEY;

  static async searchArtists(query: string): Promise<Artist[]> {
    if (!this.apiKey) {
      throw new Error('Setlist.fm API key not configured');
    }

    if (query.length < 2) {
      return [];
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/search/artists?artistName=${encodeURIComponent(query)}&p=1&sort=relevance`,
        {
          headers: {
            'x-api-key': this.apiKey,
            'Accept': 'application/json',
            'User-Agent': 'SetlistPlaylistGenerator/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Setlist.fm API error: ${response.status}`);
      }

      const data: SetlistFmResponse = await response.json();
      return data.artist || [];
    } catch (error) {
      console.error('Error searching artists:', error);
      throw error;
    }
  }
}
