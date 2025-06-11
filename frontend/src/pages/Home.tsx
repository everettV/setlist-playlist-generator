import React, { useState, useEffect } from 'react';
import ArtistAutocomplete from '../components/ArtistAutocomplete';

interface Artist {
  mbid: string;
  name: string;
  sortName: string;
  disambiguation?: string;
  verified?: boolean;
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

const HeadphonesLogo: React.FC<{ className?: string }> = React.memo(({ className = "w-16 h-16" }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none">
    <path
      d="M32 8C21.5 8 13 16.5 13 27v10c0 2.2 1.8 4 4 4h4c2.2 0 4-1.8 4-4V31c0-2.2-1.8-4-4-4h-1c0-8.8 7.2-16 16-16s16 7.2 16 16h-1c-2.2 0-4 1.8-4 4v6c0 2.2 1.8 4 4 4h4c2.2 0 4-1.8 4-4V27c0-10.5-8.5-19-19-19z"
      fill="currentColor"
    />
  </svg>
));

const Home: React.FC = () => {
  const [artistName, setArtistName] = useState('');
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem('spotify_access_token')
  );

  const handleArtistSelect = (artist: Artist) => {
    setSelectedArtist(artist);
    setError('');
  };

  const handleSpotifyLogin = async () => {
    try {
      setError('');
      setLoading(true);
      
      // For demo purposes, simulate successful login
      console.log('🎵 Demo login - simulating successful Spotify connection...');
      
      setTimeout(() => {
        const mockToken = 'demo_token_' + Date.now();
        localStorage.setItem('spotify_access_token', mockToken);
        setAccessToken(mockToken);
        setLoading(false);
        setSuccess('🎉 Demo mode: Successfully connected to Spotify!');
      }, 1000);
      
    } catch (error: any) {
      console.error('❌ Login error:', error);
      setError(`Login failed: ${error.message}`);
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    setAccessToken(null);
    setSuccess('');
    setError('');
    console.log('🎵 Logged out of Spotify');
  };

  const handleCreatePlaylist = async (platform: 'spotify' | 'apple') => {
    if (!artistName.trim()) {
      setError('Please enter an artist name');
      return;
    }

    if (platform === 'spotify' && !accessToken) {
      setError('Please login to Spotify first');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const apiUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:3001' 
        : 'https://setlist-playlist-generator.onrender.com';
        
      const response = await fetch(`${apiUrl}/api/create-playlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          artistName: artistName.trim(),
          platform,
          artistMbid: selectedArtist?.mbid,
          accessToken: platform === 'spotify' ? accessToken : undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create playlist');
      }

      setSuccess(`🎉 ${platform === 'spotify' ? 'Spotify' : 'Apple Music'} playlist created! Found ${data.tracksAdded}/${data.totalSongs} songs. ${data.notFoundSongs?.length > 0 ? `(${data.notFoundSongs.length} songs not found)` : ''}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Clear success message after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <BackgroundPattern />
      
      <div className="w-full max-w-md mx-auto bg-white-95 backdrop-blur-sm rounded-2xl shadow-xl p-8 relative z-10">
        <div className="text-center mb-8">
          <HeadphonesLogo className="w-16 h-16 mx-auto mb-4 text-gray-800" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🎵 Setlist Playlist Generator</h1>
          <p className="text-gray-600">
            Create Spotify playlists from concert setlists
          </p>
        </div>

        <div className="border-t border-gray-200 pt-8">
          {!accessToken ? (
            <div className="text-center space-y-6">
              <p className="text-gray-600">Connect your Spotify account to create playlists</p>
              <button
                onClick={handleSpotifyLogin}
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Connecting...
                  </span>
                ) : (
                  '🎵 Demo Login (Spotify)'
                )}
              </button>
              <p className="text-xs text-gray-500">
                Demo mode - simulates Spotify connection for testing
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-green-600 font-medium">✅ Connected to Spotify (Demo Mode)</p>
                <button
                  onClick={logout}
                  className="text-sm text-gray-600 mt-2 hover:text-gray-800 transition-colors"
                  style={{ background: 'none', border: 'none', padding: '0', cursor: 'pointer' }}
                >
                  Logout
                </button>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Artist Name
                </label>
                <ArtistAutocomplete
                  value={artistName}
                  onChange={setArtistName}
                  onSelect={handleArtistSelect}
                  placeholder="Search for an artist..."
                  className="mb-2"
                />
                {selectedArtist && (
                  <div className="text-sm text-green-600 mb-2 flex items-center space-x-2">
                    <span>✓ Selected: <strong>{selectedArtist.name}</strong></span>
                    {selectedArtist.verified && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        Has Setlists
                      </span>
                    )}
                    {selectedArtist.disambiguation && (
                      <span className="text-gray-500 text-xs">({selectedArtist.disambiguation})</span>
                    )}
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="text-red-400">⚠️</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="text-green-400">✅</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">{success}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={() => handleCreatePlaylist('spotify')}
                  disabled={loading || !artistName.trim()}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Playlist...
                    </span>
                  ) : (
                    '🎵 Create Spotify Playlist'
                  )}
                </button>

                <button
                  onClick={() => handleCreatePlaylist('apple')}
                  disabled={loading || !artistName.trim()}
                  className="w-full bg-gray-800 hover:bg-gray-900 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Playlist...
                    </span>
                  ) : (
                    '🍎 Create Apple Music Playlist'
                  )}
                </button>
              </div>

              <div className="text-center text-xs text-gray-500 mt-6">
                <p>Try searching: "khruangbin", "led zep", or "beatlees"</p>
                <p className="mt-1">✨ Fuzzy search handles typos and partial matches</p>
                <p className="mt-2 text-orange-600">Demo mode - using mock data for playlist creation</p>
              </div>
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
    </div>
  );
};

export default Home;
