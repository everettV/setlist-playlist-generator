// backend/src/services/SetlistService.ts
import axios from 'axios';

interface SetlistFMResponse {
  setlist: any[];
}

export class SetlistService {
  private apiKey: string;
  private baseURL: string;

  constructor() {
    this.apiKey = process.env.SETLISTFM_API_KEY || '';
    this.baseURL = 'https://api.setlist.fm/rest/1.0';
  }

  async getArtistSetlists(artistName: string, limit: number = 10): Promise<any[]> {
    try {
      const response = await axios.get<SetlistFMResponse>(`${this.baseURL}/search/setlists`, {
        params: {
          artistName,
          p: 1,
        },
        headers: {
          'x-api-key': this.apiKey,
          'Accept': 'application/json',
        },
      });
      
      return response.data.setlist.slice(0, limit);
    } catch (error: any) {
      throw new Error(`Failed to fetch setlists: ${error.message}`);
    }
  }
}