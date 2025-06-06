
declare module 'spotify-web-api-node' {
  export default class SpotifyWebApi {
    constructor(options?: {
      clientId?: string;
      clientSecret?: string;
      redirectUri?: string;
    });
    
    setAccessToken(accessToken: string): void;
    setRefreshToken(refreshToken: string): void;
    createAuthorizeURL(scopes: string[], state: string): string;
    authorizationCodeGrant(code: string): Promise<{
      body: {
        access_token: string;
        refresh_token: string;
        expires_in: number;
      };
    }>;
    getMe(): Promise<{
      body: {
        id: string;
        display_name: string;
      };
    }>;
    searchTracks(query: string, options?: { limit?: number }): Promise<{
      body: {
        tracks: {
          items: Array<{
            uri: string;
            name: string;
            artists: Array<{ name: string }>;
          }>;
        };
      };
    }>;
    createPlaylist(userId: string, name: string, options?: { 
      description?: string; 
      public?: boolean; 
    }): Promise<{
      body: {
        id: string;
        name: string;
        external_urls: {
          spotify: string;
        };
      };
    }>;
    addTracksToPlaylist(playlistId: string, trackUris: string[]): Promise<any>;
  }
}