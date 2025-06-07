// backend/src/services/SpotifyService.ts
import axios from 'axios';

export interface SpotifyTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

export class SpotifyService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private accessToken: string;
  
  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID || '';
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET || '';
    this.redirectUri = process.env.SPOTIFY_REDIRECT_URI || 'https://setlist-playlist-generator-site.onrender.com/callback';
    this.accessToken = '';
    
    console.log('🔍 Initializing Spotify Service:');
    console.log('Client ID:', this.clientId ? 'Present' : 'Missing');
    console.log('Client Secret:', this.clientSecret ? 'Present' : 'Missing');
    console.log('Redirect URI:', this.redirectUri);
  }

  getAuthURL(): string {
    const scopes = [
      'playlist-modify-public',
      'playlist-modify-private',
      'user-read-private'
    ];
    
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      scope: scopes.join(' '),
      state: 'state'
    });
    
    const authURL = `https://accounts.spotify.com/authorize?${params.toString()}`;
    console.log('🔗 Generated Auth URL:', authURL);
    return authURL;
  }

  async getAccessToken(code: string): Promise<SpotifyTokenResponse> {
    try {
      console.log('🔄 Exchanging code for token...');
      console.log('Using redirect URI:', this.redirectUri);
      
      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: this.redirectUri,
      });

      const authHeader = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

      const response = await axios.post<SpotifyTokenResponse>('https://accounts.spotify.com/api/token', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${authHeader}`
        }
      });

      console.log('✅ Token exchange successful');
      this.accessToken = response.data.access_token;
      return response.data;
    } catch (error: any) {
      console.error('❌ Token exchange failed:', error.response?.data || error.message);
      
      const errorMessage = error.response?.data?.error_description || 
                          error.response?.data?.error || 
                          error.message;
      
      throw new Error(errorMessage);
    }
  }

  async getUserProfile(): Promise<any> {
    try {
      const response = await axios.get('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
      return response.data;
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
      
      return response.data;
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
      
      return response.data;
    } catch (error: any) {
      console.error('Error creating playlist:', error.response?.data || error.message);
      throw error;
    }
  }

  async addTracksToPlaylist(playlistId: string, trackUris: string[]): Promise<void> {
    try {
      // Spotify API has a limit of 100 tracks per request
      const chunks: string[][] = [];
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