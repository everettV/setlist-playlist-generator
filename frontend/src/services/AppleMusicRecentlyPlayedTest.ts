// Test service to debug Apple Music recently played data
import MusicKitService from './MusicKitService';
import AppleMusicRecentlyPlayedService from './AppleMusicRecentlyPlayed';
import { Artist } from './ClientArtistSearch';

export class AppleMusicRecentlyPlayedTest {
  static async testUserAuthentication(): Promise<void> {
    try {
      console.log('🧪 Testing Apple Music Authentication...');
      
      const musicKit = MusicKitService.getInstance();
      await musicKit.initialize();
      
      console.log('✅ MusicKit initialized');
      console.log('🔍 Authorization status:', musicKit.getAuthorizationStatus());
      console.log('🔍 Is authorized:', musicKit.isAuthorized());
      
      const userToken = musicKit.getUserToken();
      console.log('🔍 User token exists:', !!userToken);
      console.log('🔍 User token preview:', userToken ? userToken.substring(0, 20) + '...' : 'none');
      
      if (!userToken) {
        console.log('❌ No user token - user needs to authorize');
        return;
      }
      
      // Test API call with current token
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      console.log('🧪 Testing backend API call...');
      
      const response = await fetch(`${apiUrl}/api/apple-music/recently-played`, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🔍 Backend response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backend response data:', data);
      } else {
        const errorText = await response.text();
        console.log('❌ Backend error:', errorText);
      }
      
    } catch (error) {
      console.error('🧪 Test failed:', error);
    }
  }
  
  static async testArtistImagesEndpoint(): Promise<void> {
    try {
      console.log('🧪 Testing Apple Music artist images vs track artwork...');
      
      const musicKit = MusicKitService.getInstance();
      const userToken = musicKit.getUserToken();
      
      if (!userToken) {
        console.log('❌ No user token for artist images test');
        return;
      }
      
      // Get developer token
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const developerTokenResponse = await fetch(`${apiUrl}/api/apple-music/developer-token`);
      const { token: developerToken } = await developerTokenResponse.json();
      
      // Test searching for a specific artist to see what images we get
      const artistSearchResponse = await fetch('https://api.music.apple.com/v1/catalog/us/search?term=Taylor%20Swift&types=artists&limit=1', {
        headers: {
          'Authorization': `Bearer ${developerToken}`,
          'User-Agent': 'SetlistPlaylistGenerator/1.0'
        }
      });
      
      if (artistSearchResponse.ok) {
        const searchData = await artistSearchResponse.json();
        const artist = searchData.results?.artists?.data?.[0];
        
        if (artist) {
          console.log('🎤 Artist search result:');
          console.log('Artist name:', artist.attributes?.name);
          console.log('Artist artwork:', artist.attributes?.artwork);
          console.log('Artist genres:', artist.attributes?.genreNames);
          console.log('Artist URL:', artist.attributes?.url);
          
          // Now get recent tracks to compare artwork types
          const tracksResponse = await fetch('https://api.music.apple.com/v1/me/recent/played/tracks?limit=3', {
            headers: {
              'Authorization': `Bearer ${developerToken}`,
              'Music-User-Token': userToken,
              'User-Agent': 'SetlistPlaylistGenerator/1.0'
            }
          });
          
          if (tracksResponse.ok) {
            const tracksData = await tracksResponse.json();
            console.log('🎵 Comparing image types:');
            console.log('📀 Track artwork (album covers):');
            tracksData.data?.slice(0, 3).forEach((track: any, index: number) => {
              console.log(`${index + 1}. ${track.attributes?.name} - ${track.attributes?.artistName}`);
              console.log(`   Album artwork: ${track.attributes?.artwork?.url || 'No artwork'}`);
            });
            
            console.log('🎤 Artist image (promotional photo):');
            console.log(`   Artist artwork: ${artist.attributes?.artwork?.url || 'No artist artwork'}`);
          }
        }
      }
      
    } catch (error) {
      console.error('🧪 Artist images test failed:', error);
    }
  }

  static async testRecentlyPlayedTracksEndpoint(): Promise<void> {
    try {
      console.log('🧪 Testing Apple Music recent/played/tracks endpoint directly...');
      
      const musicKit = MusicKitService.getInstance();
      const userToken = musicKit.getUserToken();
      
      if (!userToken) {
        console.log('❌ No user token for tracks endpoint test');
        return;
      }
      
      // Get developer token
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const developerTokenResponse = await fetch(`${apiUrl}/api/apple-music/developer-token`);
      const { token: developerToken } = await developerTokenResponse.json();
      
      console.log('✅ Got developer token for tracks endpoint');
      
      // Test the specific endpoint you asked about
      const tracksResponse = await fetch('https://api.music.apple.com/v1/me/recent/played/tracks', {
        headers: {
          'Authorization': `Bearer ${developerToken}`,
          'Music-User-Token': userToken,
          'User-Agent': 'SetlistPlaylistGenerator/1.0'
        }
      });
      
      console.log('🔍 Recent played tracks endpoint status:', tracksResponse.status);
      
      if (tracksResponse.ok) {
        const data = await tracksResponse.json();
        console.log('✅ Recent played tracks response:', data);
        
        if (data.data && data.data.length > 0) {
          console.log(`🎵 Found ${data.data.length} recent tracks`);
          console.log('🔍 Last 10 recently played tracks:');
          
          // Show the last 10 tracks (or all if less than 10)
          const tracksToShow = data.data.slice(0, 10);
          tracksToShow.forEach((track: any, index: number) => {
            const trackName = track.attributes?.name || 'Unknown Track';
            const artistName = track.attributes?.artistName || 'Unknown Artist';
            const albumName = track.attributes?.albumName || 'Unknown Album';
            const playedDate = track.attributes?.playedDate || 'Unknown Date';
            
            console.log(`${index + 1}. "${trackName}" by ${artistName}`);
            console.log(`   Album: ${albumName}`);
            console.log(`   Played: ${playedDate}`);
            console.log(`   Track ID: ${track.id || 'No ID'}`);
            console.log('---');
          });
          
        } else {
          console.log('📭 No recent tracks found in response');
        }
      } else {
        const errorText = await tracksResponse.text();
        console.log('❌ Recent tracks error:', tracksResponse.status, errorText);
      }
      
    } catch (error) {
      console.error('🧪 Recent tracks endpoint test failed:', error);
    }
  }

  static async testRecentlyPlayedService(): Promise<void> {
    try {
      console.log('🧪 Testing AppleMusicRecentlyPlayedService directly...');
      
      const service = AppleMusicRecentlyPlayedService.getInstance();
      service.clearCache(); // Clear cache first
      
      const artists = await service.getRecentlyPlayedArtists();
      
      console.log('🔍 Service returned artists:', artists.length);
      artists.forEach((artist: Artist, index: number) => {
        console.log(`${index + 1}. ${artist.name} (source: ${artist.source})`);
      });
      
    } catch (error) {
      console.error('🧪 Recently played service test failed:', error);
    }
  }

  static async testDirectAppleMusicAPI(): Promise<void> {
    try {
      console.log('🧪 Testing Direct Apple Music API...');
      
      const musicKit = MusicKitService.getInstance();
      const userToken = musicKit.getUserToken();
      
      if (!userToken) {
        console.log('❌ No user token for direct API test');
        return;
      }
      
      // Get developer token
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const developerTokenResponse = await fetch(`${apiUrl}/api/apple-music/developer-token`);
      const { token: developerToken } = await developerTokenResponse.json();
      
      console.log('✅ Got developer token');
      
      // Test multiple Apple Music API endpoints
      const endpoints = [
        {
          name: 'Recently Added',
          url: 'https://api.music.apple.com/v1/me/library/recently-added',
          description: 'Songs recently added to your library'
        },
        {
          name: 'Heavy Rotation',
          url: 'https://api.music.apple.com/v1/me/history/heavy-rotation',
          description: 'Your most played content'
        },
        {
          name: 'Recent Plays',
          url: 'https://api.music.apple.com/v1/me/recent/played',
          description: 'Recently played content'
        },
        {
          name: 'Library Songs',
          url: 'https://api.music.apple.com/v1/me/library/songs?limit=10',
          description: 'Songs in your library'
        }
      ];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`🧪 Testing ${endpoint.name}: ${endpoint.description}`);
          
          const response = await fetch(endpoint.url, {
            headers: {
              'Authorization': `Bearer ${developerToken}`,
              'Music-User-Token': userToken,
              'User-Agent': 'SetlistPlaylistGenerator/1.0'
            }
          });
          
          console.log(`🔍 ${endpoint.name} status:`, response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log(`✅ ${endpoint.name} response:`, data);
            
            if (data.data && data.data.length > 0) {
              console.log(`🎵 Found ${data.data.length} items in ${endpoint.name}`);
              
              // Extract artist names from the first few items
              const artists = data.data.slice(0, 3).map((item: any) => 
                item.attributes?.artistName || 'Unknown Artist'
              );
              console.log(`🎤 Sample artists from ${endpoint.name}:`, artists);
            } else {
              console.log(`📭 ${endpoint.name} is empty`);
            }
          } else {
            const errorText = await response.text();
            console.log(`❌ ${endpoint.name} error:`, response.status, errorText);
          }
          
        } catch (endpointError) {
          console.error(`🧪 ${endpoint.name} test failed:`, endpointError);
        }
      }
      
    } catch (error) {
      console.error('🧪 Direct API test failed:', error);
    }
  }
}

// Expose to window for debugging
if (typeof window !== 'undefined') {
  (window as any).AppleMusicRecentlyPlayedTest = AppleMusicRecentlyPlayedTest;
}