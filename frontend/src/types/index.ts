export interface Setlist {
  id: string;
  eventDate: string;
  artist: {
    name: string;
    mbid: string;
  };
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
}

export interface PlaylistResponse {
  playlist: {
    id: string;
    name: string;
    external_urls: {
      spotify: string;
    };
  };
  tracksAdded: number;
  totalSongs: number;
  notFoundSongs: string[];
}

export interface SpotifyTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}
