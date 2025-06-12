import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MockArtistAutocomplete from '../components/MockArtistAutocomplete';
import Sidebar from '../components/Sidebar';
import SetlistWizard from '../components/SetlistWizard';

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
  const [activeTab, setActiveTab] = useState('sets');
  const [showWizard, setShowWizard] = useState(false);
  const [wizardPlatform, setWizardPlatform] = useState<'spotify' | 'apple'>('spotify');
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem('spotify_access_token')
  );
  const navigate = useNavigate();

  const handleArtistSelect = (artist: Artist) => {
    setSelectedArtist(artist);
    setError('');
    // Automatically open wizard when artist is selected
    // Default to Spotify if user has token, otherwise Apple Music
    const platform = accessToken ? 'spotify' : 'apple';
    setWizardPlatform(platform);
    setShowWizard(true);
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
    localStorage.removeItem('apple_music_token');
    setAccessToken(null);
    setSuccess('');
    setError('');
    navigate('/');
    console.log('🎵 Logged out');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // For now, we'll just show placeholder content for other tabs
  };


  const handleWizardComplete = () => {
    setSuccess('🎉 Playlist created successfully!');
    setArtistName('');
    setSelectedArtist(null);
  };

  // Clear success message after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'sets':
        return (
          <div className="space-y-6">
            {/* Header Section */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">Find Live Music</h1>
              <p className="text-gray-600 text-lg">Search for any artist to discover their setlists and create playlists</p>
            </div>

            {/* Search Section */}
            <div className="bg-white-95 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8">
              <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">Start Your Search</h2>
                  <p className="text-gray-600">Type an artist name to explore their live performances</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <MockArtistAutocomplete
                      value={artistName}
                      onChange={setArtistName}
                      onSelect={handleArtistSelect}
                      placeholder="Search for an artist..."
                      className="text-lg p-4 rounded-xl border-2 border-gray-200 focus:border-teal-500 transition-colors"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4 fade-in">
                    <div className="flex items-center">
                      <span className="text-red-500 text-xl mr-3">⚠️</span>
                      <p className="text-red-700 font-medium">{error}</p>
                    </div>
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-4 fade-in">
                    <div className="flex items-center">
                      <span className="text-green-500 text-xl mr-3">✅</span>
                      <p className="text-green-700 font-medium">{success}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
          </div>
        );
      case 'concerts':
        return (
          <div className="bg-white-95 backdrop-blur-sm rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Concerts</h2>
            <p className="text-gray-600">Your saved concerts and upcoming shows will appear here.</p>
          </div>
        );
      case 'festivals':
        return (
          <div className="bg-white-95 backdrop-blur-sm rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Festivals</h2>
            <p className="text-gray-600">Festival lineups and multi-artist playlists will appear here.</p>
          </div>
        );
      case 'account':
        return (
          <div className="bg-white-95 backdrop-blur-sm rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Account Settings</h2>
            <p className="text-gray-600">Manage your account preferences and connections.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen relative">
      <BackgroundPattern />
      
      <Sidebar 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onLogout={logout}
      />
      
      <main className="lg:ml-60 min-h-screen overflow-y-auto p-4 lg:p-8 pt-20 lg:pt-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          {renderTabContent()}
        </div>
      </main>

      {/* Setlist Wizard */}
      {showWizard && (
        <SetlistWizard
          artistName={selectedArtist?.name || artistName}
          platform={wizardPlatform}
          onClose={() => setShowWizard(false)}
          onComplete={handleWizardComplete}
          connectedServices={{
            spotify: !!accessToken,
            apple: !!localStorage.getItem('apple_music_token')
          }}
        />
      )}
    </div>
  );
};

export default Home;
