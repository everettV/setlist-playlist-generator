import React, { useState, useEffect } from 'react';
import { spotifyApi, setlistApi, playlistApi, testConnection, apiUrl } from '../services/api';

// Types matching your existing API
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

// Background using your exact uploaded image
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

// Loading Spinner Component
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

// Headphones Logo Component
const HeadphonesLogo: React.FC<{ className?: string }> = ({ className = "w-16 h-16" }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none">
    <path
      d="M32 8C21.5 8 13 16.5 13 27v10c0 2.2 1.8 4 4 4h4c2.2 0 4-1.8 4-4V31c0-2.2-1.8-4-4-4h-1c0-8.8 7.2-16 16-16s16 7.2 16 16h-1c-2.2 0-4 1.8-4 4v6c0 2.2 1.8 4 4 4h4c2.2 0 4-1.8 4-4V27c0-10.5-8.5-19-19-19z"
      fill="currentColor"
    />
  </svg>
);

const Home: React.FC = () => {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'loading', 'results', 'success', 'error'
  const [artist, setArtist] = useState('');
  const [setlists, setSetlists] = useState<Setlist[]>([]);
  const [loading, setLoading] = useState(false);
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
  };

  const createPlaylist = async (setlist: Setlist): Promise<void> => {
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      searchSetlists();
    }
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setArtist('');
    setSetlists([]);
    setError(null);
  };

  // Home View
  const HomeView = () => (
    <div className="w-full max-w-md mx-auto bg-white-95 backdrop-blur-sm rounded-2xl shadow-xl p-8 relative z-10">
      <div className="text-center mb-8">
        <HeadphonesLogo className="w-16 h-16 mx-auto mb-4 text-gray-800" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Setlist Playlist</h1>
        <p className="text-gray-600">
          Your favorite artist's latest setlist, direct to your ears via Spotify or Apple Music
        </p>
      </div>

      <div className="border-t border-gray-200 pt-8">
        {!accessToken ? (
          <div className="text-center space-y-6">
            <p className="text-gray-600">Connect your Spotify account to create playlists</p>
            <button
              onClick={handleSpotifyLogin}
              disabled={loading}
              className="w-full btn-primary"
            >
              {loading ? 'Connecting...' : 'Login with Spotify'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-green-600 font-medium">✅ Connected to Spotify</p>
              <button
                onClick={logout}
                className="text-sm text-gray-600 mt-2"
                style={{ background: 'none', border: 'none', padding: '0', cursor: 'pointer' }}
              >
                Logout
              </button>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Enter an artist name
              </label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Artist Name"
                disabled={loading}
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
  );

  // Loading View
  const LoadingView = () => (
    <div className="w-full max-w-md mx-auto bg-white-95 backdrop-blur-sm rounded-2xl shadow-xl p-8 relative z-10">
      <div className="text-center mb-8">
        <HeadphonesLogo className="w-16 h-16 mx-auto mb-4 text-gray-800" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Setlist Playlist</h1>
        <p className="text-gray-600">
          Your favorite artist's latest setlist, direct to your ears via Spotify or Apple Music
        </p>
      </div>

      <div className="border-t border-gray-200 pt-8">
        <div className="flex items-center justify-center" style={{ flexDirection: 'column', padding: '3rem 0' }}>
          <LoadingSpinner />
          <p className="text-gray-600 mt-4">Creating playlist...</p>
        </div>
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
  );

  // Results View
  const ResultsView = () => {
    const setlist = setlists[0];
    const songs = setlist?.sets?.set?.flatMap(set => set.song) || [];

    if (!setlist) {
      return (
        <div className="w-full max-w-md mx-auto bg-white-95 backdrop-blur-sm rounded-2xl shadow-xl p-8 relative z-10">
          <div className="text-center">
            <p className="text-gray-600">No setlist data available</p>
            <button
              onClick={handleBackToHome}
              className="mt-4 text-teal-600"
              style={{ background: 'none', border: 'none', padding: '0', cursor: 'pointer' }}
            >
              Back to Home
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full max-w-md mx-auto bg-white-95 backdrop-blur-sm rounded-2xl shadow-xl p-8 relative z-10">
        <div className="text-center mb-8">
          <HeadphonesLogo className="w-16 h-16 mx-auto mb-4 text-gray-800" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Setlist Playlist</h1>
          <p className="text-gray-600">
            Your favorite artist's latest setlist, direct to your ears via Spotify or Apple Music
          </p>
        </div>

        <div className="border-t border-gray-200 pt-8">
          <div className="mb-6">
            <p className="text-gray-800 font-medium mb-4">
              We found {setlist.artist?.name || 'Unknown Artist'}'s setlist from{' '}
              {setlist.eventDate || 'Unknown Date'} at {setlist.venue?.name || 'Unknown Venue'},{' '}
              {setlist.venue?.city?.name || 'Unknown City'} with these songs:
            </p>
            
            <ul className="space-y-1 text-gray-700 mb-6">
              {songs.map((song, index) => (
                <li key={index}>
                  <span className="text-gray-400 mr-2">•</span>
                  {song.name}
                </li>
              ))}
            </ul>

            <p className="text-gray-600 text-sm mb-6">
              Connect an account to create this playlist.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => createPlaylist(setlist)}
                className="flex-1 btn-primary"
              >
                SPOTIFY
              </button>
              <button
                onClick={() => createPlaylist(setlist)}
                className="flex-1 btn-secondary"
              >
                APPLE MUSIC
              </button>
            </div>
          </div>
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
    );
  };

  // Error View
  const ErrorView = () => (
    <div className="w-full max-w-md mx-auto bg-white-95 backdrop-blur-sm rounded-2xl shadow-xl p-8 relative z-10">
      <div className="text-center mb-8">
        <HeadphonesLogo className="w-16 h-16 mx-auto mb-4 text-gray-800" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Setlist Playlist</h1>
        <p className="text-gray-600">
          Your favorite artist's latest setlist, direct to your ears via Spotify or Apple Music
        </p>
      </div>

      <div className="border-t border-gray-200 pt-8">
        <div className="text-center mb-6">
          <p className="text-gray-800 mb-6">{error}</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2" style={{ textAlign: 'left' }}>
                Enter an artist name
              </label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Artist Name"
              />
            </div>
            
            <button
              onClick={searchSetlists}
              disabled={!artist.trim()}
              className="w-full btn-primary"
            >
              SUBMIT
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 mt-8 pt-6">
        <div className="text-center mb-4">
          <a href="#" className="text-teal-600">
            Abstract Shapes Vectors by Vecteezy
          </a>
        </div>
        
        <button
          onClick={handleBackToHome}
          className="w-full btn-primary"
        >
          BACK TO HOMEPAGE
        </button>
        
        <div className="text-center text-sm text-gray-600 mt-6">
          <p>Made by <strong>Elli Rego</strong> using <strong>Setlist.fm</strong>,</p>
          <p><strong>Spotify</strong>, and <strong>Apple Music</strong> APIs.</p>
          <div className="mt-2">
            <a href="#" className="text-teal-600">Attributions</a>
            <span className="mx-2">•</span>
            <a href="#" className="text-teal-600">Feedback?</a>
          </div>
        </div>
      </div>
    </div>
  );

  // Success View
  const SuccessView = () => (
    <div className="w-full max-w-md mx-auto bg-white-95 backdrop-blur-sm rounded-2xl shadow-xl p-8 relative z-10">
      <div className="text-center mb-8">
        <HeadphonesLogo className="w-16 h-16 mx-auto mb-4 text-gray-800" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Setlist Playlist</h1>
        <p className="text-gray-600">
          Your favorite artist's latest setlist, direct to your ears via Spotify or Apple Music
        </p>
      </div>

      <div className="border-t border-gray-200 pt-8">
        <div className="text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Success!</h3>
            <p className="text-gray-600 mb-6">
              Your playlist has been created and added to your Spotify account.
            </p>
            
            <button
              onClick={handleBackToHome}
              className="w-full btn-primary"
            >
              CREATE ANOTHER PLAYLIST
            </button>
          </div>
        </div>
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
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <BackgroundPattern />
      
      {/* Connection Status */}
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
                borderRadius: '2px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          )}
        </div>
      )}

      {error && currentView === 'home' && (
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

      {/* Main Content */}
      {connectionStatus === 'connected' ? (
        <>
          {currentView === 'home' && <HomeView />}
          {currentView === 'loading' && <LoadingView />}
          {currentView === 'results' && <ResultsView />}
          {currentView === 'error' && <ErrorView />}
          {currentView === 'success' && <SuccessView />}
        </>
      ) : (
        <div className="text-center p-8 bg-white-95 backdrop-blur-sm rounded-2xl shadow-xl max-w-md mx-auto relative z-10">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Cannot connect to backend</h3>
          <p className="text-gray-600">Please make sure the backend server is running and accessible.</p>
        </div>
      )}
    </div>
  );
};

export default Home;