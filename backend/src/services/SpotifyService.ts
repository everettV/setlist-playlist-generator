import axios from 'axios';

class SpotifyService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private accessToken: string = '';

  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID || '95e68bd6da33466c960d4a0a76323837';
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET || '792689bec07f49f3ae926747338442d4';
    this.redirectUri = process.env.SPOTIFY_REDIRECT_URI || 'http://127.0.0.1:3000/callback';
    
    console.log('🔍 Initializing Spotify Service:');
    console.log('Client ID:', this.clientId);
    console.log('Redirect URI:', this.redirectUri);
  }

  getAuthURL(): string {
    const scopes = [
      'playlist-modify-public',
      'playlist-modify-private', 
      'user-read-private'
    ].join(' ');
    
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      scope: scopes,
      state: 'state'
    });
    
    const authURL = `https://accounts.spotify.com/authorize?${params.toString()}`;
    console.log('🔗 Generated Auth URL:', authURL);
    return authURL;
  }

  async getAccessToken(code: string): Promise<any> {
    try {
      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: this.redirectUri,
      });

      const response = await axios.post('https://accounts.spotify.com/api/token', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
        }
      });

      this.accessToken = response.data.access_token;
      return response.data;
    } catch (error: any) {
      console.error('Error getting access token:', error.response?.data || error.message);
      throw error;
    }
  }

  async getUserProfile(): Promise<any> {
    try {
      const response = await axios.get('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
      return { body: response.data };
    } catch (error: any) {
      console.error('Error getting user profile:', error.response?.data || error.message);
      throw error;
    }
  }

  async searchTracks(query: string, limit: number = 1): Promise<any> {
    try {
      const params = new URLSearchParams({
        q: query,
        type: 'track',
        limit: limit.toString()
      });

      const response = await axios.get(`https://api.spotify.com/v1/search?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
      
      return { body: response.data };
    } catch (error: any) {
      console.error('Error searching tracks:', error.response?.data || error.message);
      throw error;
    }
  }

  async createPlaylist(userId: string, name: string, description: string): Promise<any> {
    try {
      const response = await axios.post(`https://api.spotify.com/v1/users/${userId}/playlists`, {
        name: name,
        description: description,
        public: false
      }, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      return { body: response.data };
    } catch (error: any) {
      console.error('Error creating playlist:', error.response?.data || error.message);
      throw error;
    }
  }

  async addTracksToPlaylist(playlistId: string, trackUris: string[]): Promise<any> {
    try {
      // Spotify API has a limit of 100 tracks per request
      const chunks = [];
      for (let i = 0; i < trackUris.length; i += 100) {
        chunks.push(trackUris.slice(i, i + 100));
      }

      for (const chunk of chunks) {
        await axios.post(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
          uris: chunk
        }, {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error: any) {
      console.error('Error adding tracks to playlist:', error.response?.data || error.message);
      throw error;
    }
  }

  setAccessToken(token: string): void {
    this.accessToken = token;
  }
}

export default new SpotifyService();