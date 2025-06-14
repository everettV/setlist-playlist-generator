import { sign } from 'jsonwebtoken';
import { readFileSync, existsSync } from 'fs';

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
      if (process.env.APPLE_MUSIC_PRIVATE_KEY_PATH && existsSync(process.env.APPLE_MUSIC_PRIVATE_KEY_PATH)) {
        this.privateKey = readFileSync(process.env.APPLE_MUSIC_PRIVATE_KEY_PATH, 'utf8');
        console.log('📁 Using Apple Music private key from file path');
      }
      else if (process.env.APPLE_MUSIC_PRIVATE_KEY) {
        // Handle escaped newlines and clean up the key
        let rawKey = process.env.APPLE_MUSIC_PRIVATE_KEY;
        
        // Remove quotes if present
        rawKey = rawKey.replace(/^"(.*)"$/, '$1');
        
        // Replace escaped newlines with actual newlines
        rawKey = rawKey.replace(/\\n/g, '\n');
        
        // Ensure proper PEM format
        if (!rawKey.includes('-----BEGIN PRIVATE KEY-----')) {
          throw new Error('Invalid private key format. Must be in PEM format starting with -----BEGIN PRIVATE KEY-----');
        }
        
        this.privateKey = rawKey;
        console.log('🔑 Using Apple Music private key from environment variable');
        console.log('Key preview:', this.privateKey.substring(0, 50) + '...');
      }
      else {
        throw new Error('No Apple Music private key found. Set either APPLE_MUSIC_PRIVATE_KEY_PATH or APPLE_MUSIC_PRIVATE_KEY environment variable.');
      }

      // Validate the key format
      if (!this.privateKey.includes('BEGIN PRIVATE KEY')) {
        throw new Error('Invalid Apple Music private key format. Expected PEM format.');
      }

      console.log('✅ Apple Music private key loaded and validated successfully');
    } catch (error) {
      console.error('❌ Apple Music private key error:', error);
      throw new Error('Failed to read Apple Music private key: ' + error);
    }
  }

  generateDeveloperToken(): string {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: this.teamId,
      iat: now,
      exp: now + 7776000, // 3 months instead of 6 (more conservative)
    };

    console.log('🍎 Token payload:', { 
      teamId: this.teamId, 
      keyId: this.keyId, 
      iat: payload.iat, 
      exp: payload.exp 
    });

    try {
      const token = sign(payload, this.privateKey, {
        algorithm: 'ES256',
        keyid: this.keyId,
      });
      
      console.log('🍎 Generated token preview:', token.substring(0, 50) + '...' + token.substring(token.length - 20));
      
      // Decode token to verify contents (just for debugging)
      try {
        const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        console.log('🍎 Decoded token payload:', decoded);
      } catch (decodeError) {
        console.log('🍎 Could not decode token for verification');
      }
      
      console.log('🍎 Apple Music developer token generated successfully');
      return token;
    } catch (error) {
      console.error('❌ Token generation error:', error);
      console.error('Private key preview:', this.privateKey.substring(0, 100));
      throw new Error('Failed to generate Apple Music developer token: ' + error);
    }
  }

  async searchTrack(songName: string, artistName: string, userToken: string): Promise<any> {
    const developerToken = this.generateDeveloperToken();
    const query = `${songName} ${artistName}`;
    
    try {
      const searchUrl = `https://api.music.apple.com/v1/catalog/us/search?term=${encodeURIComponent(query)}&types=songs&limit=5`;
      
      const response = await fetch(searchUrl, {
        headers: {
          'Authorization': `Bearer ${developerToken}`,
          'Music-User-Token': userToken,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Apple Music search API error: ${response.status} - ${errorText}`);
      }

      return response.json();
    } catch (error) {
      console.error(`Failed to search for track "${songName}" by "${artistName}":`, error);
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
          'Authorization': `Bearer ${developerToken}`,
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
              data: trackIds.map((id) => ({
                id: id,
                type: 'songs',
              })),
            },
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create Apple Music playlist: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Failed to create Apple Music playlist:', error);
      throw error;
    }
  }
}
