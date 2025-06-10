import jwt from 'jsonwebtoken';
import fs from 'fs';
import fetch from 'node-fetch';

export class AppleMusicService {
  private privateKey: string;
  private keyId: string;
  private teamId: string;

  constructor() {
    this.keyId = process.env.APPLE_MUSIC_KEY_ID!;
    this.teamId = process.env.APPLE_MUSIC_TEAM_ID!;
    
    if (!this.keyId || !this.teamId) {
      throw new Error('Apple Music credentials missing. Check APPLE_MUSIC_KEY_ID and APPLE_MUSIC_TEAM_ID environment variables.');
    }

    try {
      this.privateKey = fs.readFileSync(process.env.APPLE_MUSIC_PRIVATE_KEY_PATH!, 'utf8');
    } catch (error) {
      throw new Error('Failed to read Apple Music private key: ' + error);
    }
  }

  generateDeveloperToken(): string {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: this.teamId,
      iat: now,
      exp: now + 15778800, // 6 months
    };

    try {
      return jwt.sign(payload, this.privateKey, {
        algorithm: 'ES256',
        keyid: this.keyId,
      });
    } catch (error) {
      throw new Error('Failed to generate Apple Music developer token: ' + error);
    }
  }

  async searchTrack(songName: string, artistName: string, userToken: string): Promise<any> {
    const developerToken = this.generateDeveloperToken();
    const query = songName + ' ' + artistName;
    
    try {
      const searchUrl = 'https://api.music.apple.com/v1/catalog/us/search?term=' + 
                       encodeURIComponent(query) + '&types=songs&limit=5';
      
      const response = await fetch(searchUrl, {
        headers: {
          'Authorization': 'Bearer ' + developerToken,
          'Music-User-Token': userToken,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error('Apple Music search API error: ' + response.status + ' - ' + errorText);
      }

      return response.json();
    } catch (error) {
      console.error('Failed to search for track "' + songName + '" by "' + artistName + '":', error);
      throw error;
    }
  }

  async createPlaylist(userToken: string, name: string, description: string, trackIds: string[]): Promise<any> {
    const developerToken = this.generateDeveloperToken();
    
    if (trackIds.length === 0) {
      throw new Error('No tracks to add to playlist');
    }

    try {
      const response = await fetch('https://api.music.apple.com/v1/me/library/playlists', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + developerToken,
          'Music-User-Token': userToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attributes: {
            name: name,
            description: description,
          },
          relationships: {
            tracks: {
              data: trackIds.map(function(id) {
                return {
                  id: id,
                  type: 'songs',
                };
              }),
            },
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error('Failed to create Apple Music playlist: ' + response.status + ' - ' + errorText);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Failed to create Apple Music playlist:', error);
      throw error;
    }
  }
}
