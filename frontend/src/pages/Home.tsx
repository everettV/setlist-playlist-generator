import React, { useState, useEffect, ChangeEvent } from 'react';
import { spotifyApi, setlistApi, playlistApi, testConnection, apiUrl } from '../services/api';

interface Setlist {
  id: string;
  eventDate: string;
  artist: {
    name: string;
  };
  venue: {
    name: string;
    city: {
      name: string;
      country?: {
        name: string;
      };
    };
  };
  sets: {
    set: Array<{
      song: Array<{
        name: string;
      }>;
    }>;
  };
}

const Home: React.FC = () => {
  const [artist, setArtist] = useState<string>('');
  const [setlists, setSetlists] = useState<Setlist[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'failed'>('checking');
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem('spotify_access_token')
  );

  // Test backend connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      console.log('🔍 Testing backend connection...');
      const isConnected = await testConnection();
      setConnectionStatus(isConnected ? 'connected' : 'failed');
      
      if (!isConnected) {
        setError('Cannot connect to backend server. Please check if the backend is running.');
      }
    };
    
    checkConnection();
  }, []);

  const handleSpotifyLogin = async (): Promise<void> => {
    try {
      setError(null);
      setLoading(true);
      
      console.log('🎵 Requesting Spotify auth URL...');
      const data = await spotifyApi.getAuthURL();
      
      if (data.authURL) {
        console.log('✅ Got auth URL, redirecting...');
        window.location.href = data.authURL;
      } else {
        throw new Error('No auth URL in response');
      }
    } catch (error: any) {
      console.error('❌ Failed to get auth URL:', error);
      setError(`Failed to connect to Spotify: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const searchSetlists = async (): Promise<void> => {
    if (!artist.trim()) {
      setError('Please enter an artist name');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Searching setlists for:', artist);
      const data = await setlistApi.searchSetlists(artist);
      console.log('✅ Setlists found:', data);
      setSetlists(data);
    } catch (error: any) {
      console.error('❌ Failed to search setlists:', error);
      setError(`Failed to search setlists: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createPlaylist = async (setlist: Setlist): Promise<void> => {
    if (!accessToken) {
      setError('Please login to Spotify first');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('🎵 Creating playlist for setlist:', setlist.id);
      const data = await playlistApi.createFromSetlist({
        accessToken,
        setlist
      });
      
      console.log('✅ Playlist created:', data);
      window.alert(`Playlist created! ${data.tracksAdded}/${data.totalSongs} tracks added.`);
      
      if (data.notFoundSongs && data.notFoundSongs.length > 0) {
        console.log('Songs not found:', data.notFoundSongs);
      }
    } catch (error: any) {
      console.error('❌ Failed to create playlist:', error);
      setError(`Failed to create playlist: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    setAccessToken(null);
  };

  const retryConnection = async (): Promise<void> => {
    setConnectionStatus('checking');
    setError(null);
    const isConnected = await testConnection();
    setConnectionStatus(isConnected ? 'connected' : 'failed');
    
    if (!isConnected) {
      setError('Still cannot connect to backend server.');
    }
  };

  const handleArtistChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setArtist(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      searchSetlists();
    }
  };

  return (
    <div className="home">
      {/* Connection Status */}
      <div style={{
        padding: '10px',
        margin: '10px 0',
        borderRadius: '4px',
        backgroundColor: connectionStatus === 'connected' ? '#d4edda' : 
                         connectionStatus === 'failed' ? '#f8d7da' : '#fff3cd',
        border: `1px solid ${connectionStatus === 'connected' ? '#c3e6cb' : 
                             connectionStatus === 'failed' ? '#f5c6cb' : '#ffeaa7'}`,
        color: connectionStatus === 'connected' ? '#155724' : 
               connectionStatus === 'failed' ? '#721c24' : '#856404'
      }}>
        <strong>Backend Status:</strong> {
          connectionStatus === 'checking' ? '🔄 Checking...' :
          connectionStatus === 'connected' ? '✅ Connected' :
          '❌ Disconnected'
        }
        <br />
        <small>API URL: {apiUrl}</small>
        {connectionStatus === 'failed' && (
          <button 
            onClick={retryConnection}
            style={{ 
              marginLeft: '10px', 
              padding: '2px 8px', 
              fontSize: '12px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '2px'
            }}
          >
            Retry
          </button>
        )}
      </div>

      {error && (
        <div style={{
          backgroundColor: '#ffe6e6',
          border: '1px solid #ff9999',
          borderRadius: '4px',
          padding: '10px',
          margin: '20px 0',
          color: '#cc0000'
        }}>
          {error}
        </div>
      )}

      {connectionStatus === 'connected' ? (
        <>
          {!accessToken ? (
            <div className="auth-section">
              <p>Connect your Spotify account to create playlists</p>
              <button onClick={handleSpotifyLogin} disabled={loading}>
                {loading ? 'Connecting...' : 'Login with Spotify'}
              </button>
            </div>
          ) : (
            <div className="main-content">
              <div style={{ marginBottom: '20px' }}>
                <p>✅ Connected to Spotify</p>
                <button onClick={logout} style={{ 
                  background: '#666', 
                  color: 'white', 
                  border: 'none', 
                  padding: '5px 10px', 
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  Logout
                </button>
              </div>

              <div className="search-section">
                <input
                  type="text"
                  value={artist}
                  onChange={handleArtistChange}
                  placeholder="Enter artist name"
                  onKeyPress={handleKeyPress}
                />
                <button onClick={searchSetlists} disabled={loading}>
                  {loading ? 'Searching...' : 'Search Setlists'}
                </button>
              </div>

              {setlists.length > 0 && (
                <div className="setlists-section">
                  <h2>Recent Setlists for {artist}</h2>
                  {setlists.map((setlist: Setlist) => (
                    <div key={setlist.id} className="setlist-card">
                      <h3>{setlist.venue?.name || 'Unknown Venue'}</h3>
                      <p>
                        {setlist.venue?.city?.name || 'Unknown City'}
                        {setlist.venue?.city?.country?.name && `, ${setlist.venue.city.country.name}`}
                      </p>
                      <p>{setlist.eventDate}</p>
                      <p>
                        {setlist.sets?.set?.reduce((total: number, set: any) => 
                          total + (set.song?.length || 0), 0) || 0} songs
                      </p>
                      <button 
                        onClick={() => createPlaylist(setlist)}
                        disabled={loading}
                      >
                        {loading ? 'Creating...' : 'Create Playlist'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h3>Cannot connect to backend</h3>
          <p>Please make sure the backend server is running and accessible.</p>
        </div>
      )}
    </div>
  );
};

export default Home;