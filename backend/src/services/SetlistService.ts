import axios from 'axios';

interface SetlistResponse {
  setlist: Array<{
    id: string;
    eventDate: string;
    venue: {
      name: string;
      city: {
        name: string;
        country: {
          name: string;
        };
      };
    };
    sets: {
      set: Array<{
        song: Array<{
          name: string;
          cover?: {
            name: string;
          };
        }>;
      }>;
    };
  }>;
}

class SetlistService {
  private apiKey: string;
  private baseURL = 'https://api.setlist.fm/rest/1.0';

  constructor() {
    this.apiKey = process.env.SETLISTFM_API_KEY!;
  }

  async getArtistSetlists(artistName: string, limit: number = 10) {
    try {
      const response = await axios.get(
        `${this.baseURL}/search/setlists`,
        {
          params: {
            artistName,
            p: 1,
          },
          headers: {
            'x-api-key': this.apiKey,
            'Accept': 'application/json',
          },
        }
      );
      
      return response.data.setlist.slice(0, limit);
    } catch (error) {
      throw new Error(`Failed to fetch setlists: ${error}`);
    }
  }
}

export default new SetlistService();