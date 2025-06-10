import React, { useState, useEffect, useCallback } from 'react';
import { spotifyApi, setlistApi, playlistApi, testConnection, appleMusicApi, testAppleMusicConnection, apiUrl } from '../services/api';
import { MusicKitService } from '../services/musicKit';

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

const BackgroundPattern: React.FC = () => (
  <div 
    className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
    style={{
      backgroundImage: `url('/assets/abstract-background.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}
  />
);

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" style={{
      borderColor: '#0d9488',
      borderTopColor: 'transparent',
      borderRightColor: 'transparent',
      borderLeftColor: 'transparent'
    }}></div>
  </div>
);

const HeadphonesLogo: React.FC<{ className?: string }> = React.memo(({ className = "w-16 h-16" }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none">
    <path
      d="M32 8C21.5 8 13 16.5 13 27v10c0 2.2 1.8 4 4 4h4c2.2 0 4-1.8 4-4V31c0-2.2-1.8-4-4-4h-1c0-8.8 7.2-16 16-16s16 7.2 16 16h-1c-2.2 0-4 1.8-4 4v6c0 2.2 1.8 4 4 4h4c2.2 0 4-1.8 4-4V27c0-10.5-8.5-19-19-19z"
      fill="currentColor"
    />
  </svg>
));

const Home: React.FC = () => {
  const [currentView, setCurrentView] = useState('home');
  const [artist, setArtist] = useState('');
  const [setlists, setSetlists] = useState<Setlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'failed'>('checking');
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem('spotify_access_token')
  );
  const [appleMusicToken, setAppleMusicToken] = useState<string | null>(null);
  const [appleMusicService, setAppleMusicService] = useState<MusicKitService | null>(null);
  const [appleMusicStatus, setAppleMusicStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');

  const handleArtistChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Input change:', e.target.value);
    setArtist(e.target.value);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      searchSetlists();
    }
  }, [artist]);

  const searchSetlists = useCallback(async (): Promise<void> => {
    if (!artist.trim()) {
      setError('Please enter an artist name');
      return;
    }
    
    setLoading(true);
    setCurrentView('loading');
    setError(null);
    
    try {
      console.log('🔍 Searching setlists for:', artist);
      const data = await setlistApi.searchSetlists(artist);
      
      if (data && data.length > 0) {
        console.log('✅ Setlists found:', data);
        setSetlists(data);
        setCurrentView('results');
      } else {
        setError('No results. Careful, this is not a search box (yet). Enter an exact artist name.');
        setCurrentView('error');
      }
    } catch (error: any) {
      console.error('❌ Failed to search setlists:', error);
      setError(`Failed to search setlists: ${error.message}`);
      setCurrentView('error');
    } finally {
      setLoading(false);
    }
  }, [artist]);

  const initializeAppleMusic = useCallback(async (): Promise<void> => {
    try {
      console.log('🍎 Checking Apple Music availability...');
      
      const isAvailable = await testAppleMusicConnection();
      if (!isAvailable) {
        setAppleMusicStatus('unavailable');
        console.log('⚠️ Apple Music service not available on backend');
        return;
      }
      
      if (!MusicKitService.isMusicKitLoaded()) {
        await MusicKitService.loadMusicKit();
      }
      
      const { developerToken } = await appleMusicApi.getDeveloperToken();
      
      const service = new MusicKitService();
      await service.initialize(developerToken);
      setAppleMusicService(service);
      
      if (service.isAuthorized()) {
        const userToken = service.getUserToken();
        if (userToken) {
          setAppleMusicToken(userToken);
          console.log('✅ User already authorized with Apple Music');
        }
      }
      
      setAppleMusicStatus('available');
      console.log('✅ Apple Music initialized successfully');
      
    } catch (error: any) {
      console.error('❌ Failed to initialize Apple Music:', error);
      setAppleMusicStatus('unavailable');
    }
  }, []);

  const handleAppleMusicLogin = useCallback(async (): Promise<void> => {
    if (!appleMusicService) {
      setError('Apple Music not initialized. Please refresh the page.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🍎 Requesting Apple Music authorization...');
      const userToken = await appleMusicService.authorize();
      setAppleMusicToken(userToken);
      
      console.log('✅ Apple Music authorized successfully');
    } catch (error: any) {
      console.error('❌ Apple Music authorization failed:', error);
      setError(`Apple Music login failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [appleMusicService]);

  const createAppleMusicPlaylist = useCallback(async (setlist: Setlist): Promise<void> => {
    if (!appleMusicToken) {
      setError('Please login to Apple Music first');
      return;
    }

    setLoading(true);
    setCurrentView('loading');
    
    try {
      console.log('🍎 Creating Apple Music playlist for setlist:', setlist.id);
      const data = await appleMusicApi.createFromSetlist({
        userToken: appleMusicToken,
        setlist
      });
      
      console.log('✅ Apple Music playlist created:', data);
      setCurrentView('success');
    } catch (error: any) {
      console.error('❌ Failed to create Apple Music playlist:', error);
      setError(`Failed to create Apple Music playlist: ${error.message}`);
      setCurrentView('error');
    } finally {
      setLoading(false);
    }
  }, [appleMusicToken]);

  const logoutAppleMusic = useCallback((): void => {
    if (appleMusicService) {
      appleMusicService.signOut();
    }
    setAppleMusicToken(null);
    console.log('🍎 Signed out of Apple Music');
  }, [appleMusicService]);

  const handleSpotifyLogin = useCallback(async (): Promise<void> => {
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
  }, []);

  const createPlaylist = useCallback(async (setlist: Setlist): Promise<void> => {
    if (!accessToken) {
      setError('Please login to Spotify first');
      return;
    }

    setLoading(true);
    setCurrentView('loading');
    
    try {
      console.log('🎵 Creating playlist for setlist:', setlist.id);
      const data = await playlistApi.createFromSetlist({
        accessToken,
        setlist
      });
      
      console.log('✅ Playlist created:', data);
      setCurrentView('success');
      
      if (data.notFoundSongs && data.notFoundSongs.length > 0) {
        console.log('Songs not found:', data.notFoundSongs);
      }
    } catch (error: any) {
      console.error('❌ Failed to create playlist:', error);
      setError(`Failed to create playlist: ${error.message}`);
      setCurrentView('error');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  const logout = useCallback((): void => {
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    setAccessToken(null);
  }, []);

  const handleBackToHome = useCallback(() => {
    setCurrentView('home');
    setArtist('');
    setSetlists([]);
    setError(null);
  }, []);

  useEffect(() => {
    const checkConnections = async () => {
      console.log('🔍 Testing backend connections...');
      const spotifyConnected = await testConnection();
      setConnectionStatus(spotifyConnected ? 'connected' : 'failed');
      
      if (!spotifyConnected) {
        setError('Cannot connect to backend server. Please check if the backend is running.');
      }
      
      initializeAppleMusic();
    };
    
    checkConnections();
  }, [initializeAppleMusic]);

  console.log('🔍 RENDER DEBUG:', {
    currentView,
    artist,
    accessToken: !!accessToken,
    appleMusicToken: !!appleMusicToken,
    loading
  });

  if (currentView === 'home') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <BackgroundPattern />
        
        {connectionStatus !== 'connected' && (
          <div style={{
            position: 'fixed',
            top: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            backgroundColor: connectionStatus === 'checking' ? '#fff3cd' : '#f8d7da',
            border: `1px solid ${connectionStatus === 'checking' ? '#ffeaa7' : '#f5c6cb'}`,
            color: connectionStatus === 'checking' ? '#856404' : '#721c24',
            zIndex: 50,
            fontSize: '0.875rem'
          }}>
            <strong>Backend Status:</strong> {
              connectionStatus === 'checking' ? '🔄 Checking...' :
              '❌ Disconnected'
            }
            <br />
            <small>API URL: {apiUrl}</small>
          </div>
        )}

        {error && (
          <div style={{
            position: 'fixed',
            top: '4rem',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#ffe6e6',
            border: '1px solid #ff9999',
            borderRadius: '0.5rem',
            padding: '0.75rem 1rem',
            margin: '1rem 0',
            color: '#cc0000',
            maxWidth: '28rem',
            zIndex: 50,
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        {connectionStatus === 'connected' ? (
          <div className="w-full max-w-md mx-auto bg-white-95 backdrop-blur-sm rounded-2xl shadow-xl p-8 relative z-10">
            <div className="text-center mb-8">
              <HeadphonesLogo className="w-16 h-16 mx-auto mb-4 text-gray-800" />
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Setlist Playlist</h1>
              <p className="text-gray-600">
                Your favorite artist's latest setlist, direct to your ears via Spotify or Apple Music
              </p>
            </div>

            <div className="border-t border-gray-200 pt-8">
              {!accessToken && !appleMusicToken ? (
                <div className="text-center space-y-6">
                  <p className="text-gray-600">Connect your music account to create playlists</p>
                  <div className="space-y-3">
                    <button
                      onClick={handleSpotifyLogin}
                      disabled={loading}
                      className="w-full btn-primary"
                    >
                      {loading ? 'Connecting...' : '🎵 Login with Spotify'}
                    </button>
                    
                    {appleMusicStatus === 'available' && (
                      <button
                        onClick={handleAppleMusicLogin}
                        disabled={loading}
                        className="w-full btn-secondary"
                      >
                        {loading ? 'Connecting...' : '🍎 Login with Apple Music'}
                      </button>
                    )}
                    
                    {appleMusicStatus === 'unavailable' && (
                      <div className="text-sm text-gray-500 p-2 bg-gray-100 rounded">
                        Apple Music not available (backend configuration needed)
                      </div>
                    )}
                    
                    {appleMusicStatus === 'checking' && (
                      <div className="text-sm text-gray-500 p-2">
                        Checking Apple Music availability...
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    {accessToken && (
                      <div>
                        <p className="text-green-600 font-medium">✅ Connected to Spotify</p>
                        <button
                          onClick={logout}
                          className="text-sm text-gray-600 mt-1"
                          style={{ background: 'none', border: 'none', padding: '0', cursor: 'pointer' }}
                        >
                          Logout
                        </button>
                      </div>
                    )}
                    
                    {appleMusicToken && (
                      <div>
                        <p className="text-green-600 font-medium">✅ Connected to Apple Music</p>
                        <button
                          onClick={logoutAppleMusic}
                          className="text-sm text-gray-600 mt-1"
                          style={{ background: 'none', border: 'none', padding: '0', cursor: 'pointer' }}
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Enter an artist name
                    </label>
                    <input
                      key="artist-input"
                      type="text"
                      value={artist}
                      onChange={handleArtistChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Artist Name"
                      disabled={loading}
                      autoComplete="off"
                      className="w-full p-3 border border-gray-300 rounded-lg outline-none transition-all duration-150 ease-in-out focus:border-teal-600 focus:shadow-sm"
                    />
                  </div>
                  
                  <button
                    onClick={searchSetlists}
                    disabled={loading || !artist.trim()}
                    className="w-full btn-primary"
                  >
                    SUBMIT
                  </button>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 mt-8 pt-6 text-center text-sm text-gray-600">
              <p>Made by <strong>Elli Rego</strong> using <strong>Setlist.fm</strong>,</p>
              <p><strong>Spotify</strong>, and <strong>Apple Music</strong> APIs.</p>
              <div className="mt-2">
                <a href="#" className="text-teal-600">Attributions</a>
                <span className="mx-2">•</span>
                <a href="#" className="text-teal-600">Feedback?</a>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-8 bg-white-95 backdrop-blur-sm rounded-2xl shadow-xl max-w-md mx-auto relative z-10">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Cannot connect to backend</h3>
            <p className="text-gray-600">Please make sure the backend server is running and accessible.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <BackgroundPattern />
      <div className="text-center p-8 bg-white-95 backdrop-blur-sm rounded-2xl shadow-xl max-w-md mx-auto relative z-10">
        <p>View: {currentView}</p>
        <button onClick={handleBackToHome} className="mt-4 btn-primary">Back to Home</button>
      </div>
    </div>
  );
};

export default Home;
