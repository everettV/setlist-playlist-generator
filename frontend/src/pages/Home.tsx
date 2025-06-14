import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MockArtistAutocomplete from '../components/MockArtistAutocomplete';
import Sidebar from '../components/Sidebar';
import SetlistWizard from '../components/SetlistWizard';
import RecentlyPlayedCarousel from '../components/RecentlyPlayedCarousel';
import { OptimalArtistSearch, SetlistData } from '../services/OptimalArtistSearch';
import { Artist, ClientArtistSearch } from '../services/ClientArtistSearch';
import { AppleMusicRecentlyPlayedTest } from '../services/AppleMusicRecentlyPlayedTest';
import ArtistsOnTourService, { ArtistOnTour } from '../services/ArtistsOnTourService';
import AnalyticsDashboard from '../components/AnalyticsDashboard';


interface SetlistSong {
  name: string;
  frequency: number;
  playedIn: string;
  duration?: string;
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

// Mock setlist data for different artists
const getMockSetlist = (artistName: string): { songs: SetlistSong[], context: string, confidence: string } => {
  const setlists: Record<string, { songs: SetlistSong[], context: string, confidence: string }> = {
    'Taylor Swift': {
      songs: [
        { name: 'Lavender Haze', frequency: 95, playedIn: '19/20 shows', duration: '3:22' },
        { name: 'Anti-Hero', frequency: 92, playedIn: '18/20 shows', duration: '3:20' },
        { name: 'Midnight Rain', frequency: 89, playedIn: '17/20 shows', duration: '2:54' },
        { name: 'Love Story', frequency: 87, playedIn: '17/20 shows', duration: '3:55' },
        { name: 'Shake It Off', frequency: 84, playedIn: '16/20 shows', duration: '3:39' },
        { name: 'Blank Space', frequency: 82, playedIn: '16/20 shows', duration: '3:51' },
        { name: 'We Are Never Getting Back Together', frequency: 79, playedIn: '15/20 shows', duration: '3:13' },
        { name: '22', frequency: 76, playedIn: '15/20 shows', duration: '3:52' },
        { name: 'You Belong With Me', frequency: 73, playedIn: '14/20 shows', duration: '3:51' },
        { name: 'Enchanted', frequency: 68, playedIn: '13/20 shows', duration: '5:52' },
        { name: 'All Too Well (10 Minute Version)', frequency: 65, playedIn: '13/20 shows', duration: '10:13' },
        { name: 'Style', frequency: 61, playedIn: '12/20 shows', duration: '3:51' },
      ],
      context: 'Based on 20 shows from Eras Tour 2024',
      confidence: 'high'
    },
    'Arctic Monkeys': {
      songs: [
        { name: 'Do I Wanna Know?', frequency: 94, playedIn: '17/18 shows', duration: '4:32' },
        { name: 'R U Mine?', frequency: 91, playedIn: '16/18 shows', duration: '3:21' },
        { name: 'I Bet You Look Good on the Dancefloor', frequency: 89, playedIn: '16/18 shows', duration: '2:53' },
        { name: 'Fluorescent Adolescent', frequency: 86, playedIn: '15/18 shows', duration: '2:57' },
        { name: 'When the Sun Goes Down', frequency: 83, playedIn: '15/18 shows', duration: '3:20' },
        { name: 'Knee Socks', frequency: 78, playedIn: '14/18 shows', duration: '4:17' },
        { name: '505', frequency: 75, playedIn: '13/18 shows', duration: '4:13' },
        { name: 'Arabella', frequency: 72, playedIn: '13/18 shows', duration: '3:27' },
        { name: 'The View from the Afternoon', frequency: 67, playedIn: '12/18 shows', duration: '3:38' },
        { name: 'Mardy Bum', frequency: 64, playedIn: '11/18 shows', duration: '2:55' },
      ],
      context: 'Based on 18 shows from 2023 tour',
      confidence: 'high'
    },
    'Radiohead': {
      songs: [
        { name: 'Creep', frequency: 88, playedIn: '15/17 shows', duration: '3:58' },
        { name: 'Paranoid Android', frequency: 85, playedIn: '14/17 shows', duration: '6:23' },
        { name: 'Karma Police', frequency: 82, playedIn: '14/17 shows', duration: '4:21' },
        { name: 'No Surprises', frequency: 79, playedIn: '13/17 shows', duration: '3:48' },
        { name: 'Everything In Its Right Place', frequency: 76, playedIn: '13/17 shows', duration: '4:11' },
        { name: 'Fake Plastic Trees', frequency: 71, playedIn: '12/17 shows', duration: '4:50' },
        { name: 'High and Dry', frequency: 68, playedIn: '11/17 shows', duration: '4:17' },
        { name: '15 Step', frequency: 65, playedIn: '11/17 shows', duration: '3:57' },
        { name: 'Street Spirit (Fade Out)', frequency: 62, playedIn: '10/17 shows', duration: '4:12' },
        { name: 'Lucky', frequency: 59, playedIn: '10/17 shows', duration: '4:19' },
      ],
      context: 'Based on 17 shows from recent tours (2022-2023)',
      confidence: 'medium'
    }
  };

  return setlists[artistName] || {
    songs: [
      { name: 'Popular Song 1', frequency: 90, playedIn: '9/10 shows', duration: '3:45' },
      { name: 'Popular Song 2', frequency: 85, playedIn: '8/10 shows', duration: '4:12' },
      { name: 'Popular Song 3', frequency: 80, playedIn: '8/10 shows', duration: '3:28' },
      { name: 'Fan Favorite', frequency: 75, playedIn: '7/10 shows', duration: '4:55' },
      { name: 'Classic Hit', frequency: 70, playedIn: '7/10 shows', duration: '3:33' },
    ],
    context: `Based on recent ${artistName} shows`,
    confidence: 'medium'
  };
};

const Home: React.FC = () => {
  const [artistName, setArtistName] = useState('');
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [createdPlaylists, setCreatedPlaylists] = useState<string[]>(() => {
    const saved = localStorage.getItem('createdPlaylists');
    return saved ? JSON.parse(saved) : [];
  });
  const searchService = useRef(new OptimalArtistSearch());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('artists');
  const [showWizard, setShowWizard] = useState(false);
  const [wizardPlatform, setWizardPlatform] = useState<'spotify' | 'apple'>('spotify');
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem('spotify_access_token')
  );
  const [recentSearches, setRecentSearches] = useState<Artist[]>(() => {
    const saved = localStorage.getItem('recentSearches');
    return saved ? JSON.parse(saved) : [];
  });
  const [artistsOnTour, setArtistsOnTour] = useState<ArtistOnTour[]>([]);
  const [artistsOnTourLoading, setArtistsOnTourLoading] = useState(true);
  const [setSearchQuery, setSetSearchQuery] = useState('');
  const [showPlayer, setShowPlayer] = useState(false);
  const [selectedPlayerArtist, setSelectedPlayerArtist] = useState<Artist | null>(null);
  const [setlistData, setSetlistData] = useState<SetlistData | null>(null);
  const [loadingSetlist, setLoadingSetlist] = useState(false);
  const navigate = useNavigate();

  const handleArtistSelect = (artist: Artist) => {
    setSelectedArtist(artist);
    setError('');
    setArtistName(''); // Clear the search field
    
    // Add to recent searches
    const updated = [artist, ...recentSearches.filter(a => a.mbid !== artist.mbid)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleCreatePlaylist = (artist: Artist) => {
    const playlistId = `${artist.name.toLowerCase().replace(/\s+/g, '-')}-setlist`;
    
    // Check for duplicates
    if (createdPlaylists.includes(playlistId)) {
      setError(`You've already created a setlist playlist for ${artist.name}. Check your Apple Music library!`);
      return;
    }
    
    // Simulate playlist creation
    setLoading(true);
    setError('');
    
    setTimeout(() => {
      const updatedPlaylists = [...createdPlaylists, playlistId];
      setCreatedPlaylists(updatedPlaylists);
      localStorage.setItem('createdPlaylists', JSON.stringify(updatedPlaylists));
      
      setSuccess(`🎉 Created "${artist.name} - Average Setlist" playlist in Apple Music!`);
      setLoading(false);
    }, 1500);
  };

  const handleBackToSearch = () => {
    setSelectedArtist(null);
    setError('');
    setSuccess('');
  };

  const handleSetSearch = (query: string) => {
    if (!query.trim()) return;
    
    setError('');
    setLoading(true);
    
    // Simulate searching for sets based on query
    // In real app, this would call an API to search setlists
    setTimeout(() => {
      // Create a mock artist based on the search query
      const mockArtist: Artist = {
        mbid: 'set_search_' + Date.now(),
        name: query.includes('Taylor') ? 'Taylor Swift' : 
              query.includes('Arctic') ? 'Arctic Monkeys' :
              query.includes('Radiohead') ? 'Radiohead' :
              query.split(' ')[0], // Use first word as artist name
        sortName: query,
        verified: true
      };
      
      setSelectedArtist(mockArtist);
      setSetSearchQuery('');
      setLoading(false);
      
      // Open wizard with relevant sets
      const platform = accessToken ? 'spotify' : 'apple';
      setWizardPlatform(platform);
      setShowWizard(true);
    }, 800);
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

  const handleArtistCarouselClick = (artist: { name: string; image: string }) => {
    const mockArtist: Artist = {
      mbid: 'carousel_' + artist.name.toLowerCase().replace(/\s+/g, '_'),
      name: artist.name,
      sortName: artist.name,
      verified: true
    };
    setSelectedPlayerArtist(mockArtist);
    setShowPlayer(true);
  };


  const handleWizardComplete = () => {
    setSuccess('🎉 Playlist created successfully!');
    setArtistName('');
    setSelectedArtist(null);
  };

  // Load setlist data when artist is selected
  useEffect(() => {
    if (selectedArtist) {
      const loadSetlist = async () => {
        try {
          setLoadingSetlist(true);
          const data = await searchService.current.getArtistSetlists(selectedArtist);
          setSetlistData(data);
        } catch (error) {
          console.error('Error loading setlist:', error);
          setSetlistData(getMockSetlist(selectedArtist.name));
        } finally {
          setLoadingSetlist(false);
        }
      };
      
      loadSetlist();
    } else {
      setSetlistData(null);
      setLoadingSetlist(false);
    }
  }, [selectedArtist]);

  // Load nearby shows for user based on Apple Music listening history
  useEffect(() => {
    const loadArtistsOnTour = async () => {
      try {
        console.log('🎪 Loading nearby shows...');
        setArtistsOnTourLoading(true);
        
        // Step 1: Show fallback immediately for good UX
        const clientSearch = new ClientArtistSearch();
        const fallbackRecents = clientSearch.getRecentlyPlayed();
        const fallbackArtistsOnTour = fallbackRecents.map(artist => ({
          ...artist,
          tourDates: [],
          userAffinityScore: 50,
          isLiked: false
        }));
        
        setArtistsOnTour(fallbackArtistsOnTour);
        setArtistsOnTourLoading(false);
        console.log('🎪 Showing fallback artists while loading show data...', fallbackRecents.length, 'fallback artists');
        console.log('🎪 Fallback artists with shows:', fallbackArtistsOnTour);
        
        // Step 2: Get real nearby shows data
        const artistsOnTourService = ArtistsOnTourService.getInstance();
        const realArtistsOnTour = await artistsOnTourService.getArtistsOnTourNearby();
        
        console.log('🎪 Nearby shows loaded:', realArtistsOnTour.length, 'artists');
        console.log('🎪 Nearby shows data:', realArtistsOnTour);
        setArtistsOnTour(realArtistsOnTour);
        
      } catch (error) {
        console.error('Failed to load nearby shows:', error);
        setArtistsOnTourLoading(false);
        // Keep fallback data if real data fails
      }
    };

    loadArtistsOnTour();
  }, []);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const renderTabContent = () => {
    console.log('🎪 Rendering tab content for:', activeTab);
    console.log('🎪 Current state:', { 
      artistsOnTourLength: artistsOnTour.length, 
      artistsOnTourLoading, 
      selectedArtist: selectedArtist?.name 
    });
    
    switch (activeTab) {
      case 'artists':
        if (selectedArtist) {
          // Show setlist view when artist is selected
          const playlistId = `${selectedArtist.name.toLowerCase().replace(/\s+/g, '-')}-setlist`;
          const isDuplicate = createdPlaylists.includes(playlistId);
          
          if (loadingSetlist || !setlistData) {
            return (
              <div className="space-y-6">
                <div className="max-w-4xl mx-auto">
                  <div className="bg-black rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[80vh] items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
                    <p className="text-white">Loading setlist data...</p>
                  </div>
                </div>
              </div>
            );
          }
          
          return (
            <div className="space-y-6">
              <div className="max-w-4xl mx-auto">
                {/* Apple MusicKit Player Modal */}
                <div className="bg-black rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[80vh]">
                  {/* Navigation Bar - iOS Style - STICKY */}
                  <div className="flex items-center justify-between p-4 bg-black/95 backdrop-blur-sm border-b border-gray-800 flex-shrink-0">
                    <button 
                      onClick={handleBackToSearch}
                      className="flex items-center gap-1 text-red-500 text-base font-normal"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                      </svg>
                      Search
                    </button>
                    
                    <div className="flex items-center gap-4">
                      <button className="text-red-500 text-base">
                        Share
                      </button>
                      <button className="text-red-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Album/Playlist Header - Apple Music Style - STICKY */}
                  <div className="bg-gradient-to-b from-gray-900 to-black p-6 text-white flex-shrink-0">
                    <div className="flex items-center gap-6">
                      {/* Artist Image */}
                      <div className="w-32 h-32 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-lg shadow-2xl overflow-hidden">
                        {selectedArtist.artwork?.url ? (
                          <img 
                            src={selectedArtist.artwork.url}
                            alt={selectedArtist.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.setAttribute('style', 'display: flex');
                            }}
                          />
                        ) : (
                          <img 
                            src={`https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop&crop=face`}
                            alt={selectedArtist.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.setAttribute('style', 'display: flex');
                            }}
                          />
                        )}
                        <div className="w-full h-full bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center text-4xl" style={{display: 'none'}}>
                          🎤
                        </div>
                      </div>
                      
                      {/* Metadata */}
                      <div className="flex-1">
                        <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Playlist</p>
                        <h1 className="text-3xl font-bold mb-2">{selectedArtist.name}</h1>
                        <p className="text-lg text-gray-300 mb-3">Average Setlist</p>
                        <p className="text-sm text-gray-400">{setlistData.songs.length} songs</p>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 mt-6">
                      <button className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full font-semibold flex items-center gap-2 transition-colors h-12">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                        Play
                      </button>
                      
                      <button className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition-colors h-12">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        Add to Library
                      </button>
                      
                      <button className="bg-gray-800 hover:bg-gray-700 text-white rounded-full transition-colors h-12 w-12 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Error/Success Messages */}
                  {(error || success) && (
                    <div className="p-4 bg-gray-900 border-b border-gray-800">
                      {error && (
                        <div className="bg-red-900/50 border border-red-800 rounded-lg p-3 text-sm">
                          <div className="flex items-center">
                            <span className="text-red-400 mr-2">⚠️</span>
                            <p className="text-red-200">{error}</p>
                          </div>
                        </div>
                      )}

                      {success && (
                        <div className="bg-green-900/50 border border-green-800 rounded-lg p-3 text-sm">
                          <div className="flex items-center">
                            <span className="text-green-400 mr-2">✅</span>
                            <p className="text-green-200">{success}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Track List - Apple Music Style - SCROLLABLE */}
                  <div className="bg-black flex-1 overflow-y-auto">
                    {setlistData.songs.map((song, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-3 hover:bg-gray-900/50 transition-colors group cursor-pointer"
                      >
                        {/* Track Number / Play Button */}
                        <div className="w-8 flex justify-center relative">
                          <span className="text-gray-400 text-sm group-hover:opacity-0 transition-opacity">
                            {index + 1}
                          </span>
                          <svg 
                            className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 absolute transition-opacity" 
                            fill="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                        
                        {/* Song Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-normal truncate">{song.name}</h3>
                          <p className="text-gray-400 text-sm truncate">{selectedArtist.name}</p>
                        </div>
                        
                        {/* Right side content */}
                        <div className="flex items-center gap-3">
                          {/* More Menu */}
                          <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white transition-all">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                            </svg>
                          </button>
                          
                          {/* Duration */}
                          <span className="text-gray-400 text-sm w-10 text-right">{song.duration}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Now Playing Bar - Apple Music Style - STICKY FOOTER */}
                  <div className="bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 flex-shrink-0">
                    {/* Mini Player */}
                    <div className="flex items-center p-3">
                      {/* Album Art */}
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex-shrink-0 overflow-hidden mr-3">
                        {selectedArtist.artwork?.url ? (
                          <img 
                            src={selectedArtist.artwork.url}
                            alt={selectedArtist.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.setAttribute('style', 'display: flex');
                            }}
                          />
                        ) : (
                          <img 
                            src={`https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=50&h=50&fit=crop&crop=face`}
                            alt={selectedArtist.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.setAttribute('style', 'display: flex');
                            }}
                          />
                        )}
                        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-lg" style={{display: 'none'}}>
                          🎤
                        </div>
                      </div>
                      
                      {/* Track Info */}
                      <div className="flex-1 min-w-0 mr-3">
                        <p className="text-white text-sm font-medium truncate">{setlistData.songs[0]?.name}</p>
                        <p className="text-gray-400 text-xs truncate">{selectedArtist.name}</p>
                      </div>
                      
                      {/* Controls */}
                      <div className="flex items-center gap-2">
                        {/* Previous */}
                        <button className="text-white p-2">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                          </svg>
                        </button>
                        
                        {/* Play/Pause */}
                        <button className="bg-white text-black w-8 h-8 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </button>
                        
                        {/* Next */}
                        <button className="text-white p-2">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="px-3 pb-3">
                      <div className="w-full bg-gray-600 rounded-full h-1">
                        <div className="bg-white h-1 rounded-full" style={{width: '35%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }
        
        // Show search view when no artist is selected
        return (
          <div className="space-y-6">
            {/* Single Combined Section */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Setlist Playlist Creator</h2>
                  <p className="text-gray-500">Find any artist to explore their setlists</p>
                  
                  {/* Debug Buttons - Remove in production */}
                  <div className="mt-4 flex gap-2 justify-center">
                    <button
                      onClick={() => {
                        console.log('🧪 Running Apple Music tests...');
                        AppleMusicRecentlyPlayedTest.testUserAuthentication();
                        AppleMusicRecentlyPlayedTest.testDirectAppleMusicAPI();
                        AppleMusicRecentlyPlayedTest.testArtistImagesEndpoint();
                        AppleMusicRecentlyPlayedTest.testRecentlyPlayedTracksEndpoint();
                        AppleMusicRecentlyPlayedTest.testRecentlyPlayedService();
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                    >
                      🧪 Test Apple Music API
                    </button>
                    <button
                      onClick={async () => {
                        console.log('🎪 Clearing nearby shows cache and reloading...');
                        const service = ArtistsOnTourService.getInstance();
                        service.clearCache();
                        setArtistsOnTourLoading(true);
                        const newArtists = await service.getArtistsOnTourNearby();
                        console.log('🎪 Refresh button got artists:', newArtists);
                        setArtistsOnTour(newArtists);
                        setArtistsOnTourLoading(false);
                      }}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                    >
                      🎪 Refresh Nearby Shows
                    </button>
                    <button
                      onClick={() => {
                        console.log('🎪 Current artists on tour state:', {
                          length: artistsOnTour.length,
                          loading: artistsOnTourLoading,
                          artists: artistsOnTour
                        });
                      }}
                      className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 transition-colors"
                    >
                      🔍 Debug State
                    </button>
                  </div>
                </div>
                
                <MockArtistAutocomplete
                  value={artistName}
                  onChange={setArtistName}
                  onSelect={handleArtistSelect}
                  placeholder="Search for an artist..."
                  className="w-full"
                />
              </div>
            </div>

            {/* Nearby Shows Carousel */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <RecentlyPlayedCarousel
                  artists={artistsOnTour}
                  onArtistSelect={handleArtistSelect}
                  loading={artistsOnTourLoading}
                  title="Nearby Shows"
                />
              </div>
            </div>

          </div>
        );
      case 'sets':
        return (
          <div className="space-y-6">
            {/* Search Section - Single Card Layout */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Setlist Playlist Creator</h2>
                  <p className="text-gray-500">Find any artist to explore their setlists</p>
                </div>
                
                <MockArtistAutocomplete
                  value={artistName}
                  onChange={setArtistName}
                  onSelect={handleArtistSelect}
                  placeholder="Search for an artist..."
                  className="w-full"
                />

                {error && (
                  <div className="mt-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                      <div className="flex items-center">
                        <span className="text-red-500 mr-2">⚠️</span>
                        <p className="text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {success && (
                  <div className="mt-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                      <div className="flex items-center">
                        <span className="text-green-500 mr-2">✅</span>
                        <p className="text-green-700">{success}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Searches - Below Search Bar in Same Card */}
                {recentSearches.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Recent searches</p>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.slice(0, 3).map((artist) => (
                        <button
                          key={artist.mbid}
                          onClick={() => handleArtistSelect(artist)}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 rounded-full text-xs font-medium transition-colors cursor-pointer"
                        >
                          {artist.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Playlists Section */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Recent Playlists</h2>
                  <button className="text-sm text-teal-600 hover:text-teal-700">
                    View all
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      id: '1',
                      artist: 'Taylor Swift',
                      venue: 'Madison Square Garden',
                      city: 'New York, NY',
                      date: 'Dec 15, 2024',
                      attended: false,
                      playlistName: 'Taylor Swift - Eras Tour NYC',
                      createdPlaylists: {
                        spotify: true,
                        apple: false
                      }
                    },
                    {
                      id: '2',
                      artist: 'Arctic Monkeys',
                      venue: 'Red Rocks Amphitheatre',
                      city: 'Morrison, CO',
                      date: 'Aug 8, 2024',
                      attended: true,
                      playlistName: 'Arctic Monkeys - Red Rocks',
                      createdPlaylists: {
                        spotify: true,
                        apple: true
                      }
                    },
                    {
                      id: '3',
                      artist: 'Radiohead',
                      venue: 'Coachella Festival',
                      city: 'Indio, CA',
                      date: 'Apr 20, 2024',
                      attended: false,
                      playlistName: 'Radiohead - Coachella 2024',
                      createdPlaylists: {
                        spotify: false,
                        apple: true
                      }
                    },
                    {
                      id: '4',
                      artist: 'The Weekend',
                      venue: 'Hollywood Bowl',
                      city: 'Los Angeles, CA',
                      date: 'Mar 12, 2024',
                      attended: true,
                      playlistName: 'The Weeknd - After Hours Tour',
                      createdPlaylists: {
                        spotify: true,
                        apple: false
                      }
                    },
                    {
                      id: '5',
                      artist: 'Billie Eilish',
                      venue: 'Chase Center',
                      city: 'San Francisco, CA',
                      date: 'Feb 28, 2024',
                      attended: false,
                      playlistName: 'Billie Eilish - Happier Than Ever Tour',
                      createdPlaylists: {
                        spotify: false,
                        apple: false
                      }
                    }
                  ].map((playlist, index) => (
                    <div 
                      key={playlist.id} 
                      onClick={() => {
                        // Open preferred music player based on which service has the playlist
                        if (playlist.createdPlaylists?.spotify) {
                          // Open Spotify - this would use the actual playlist URL in a real app
                          const spotifyUrl = `spotify:playlist:mock_playlist_id_${playlist.id}`;
                          // Try to open Spotify app first, fallback to web
                          window.location.href = spotifyUrl;
                          // Fallback to web after a brief delay if app doesn't open
                          setTimeout(() => {
                            window.open(`https://open.spotify.com/playlist/mock_playlist_id_${playlist.id}`, '_blank');
                          }, 1000);
                        } else if (playlist.createdPlaylists?.apple) {
                          // Open Apple Music - this would use the actual playlist URL in a real app
                          const appleMusicUrl = `music://playlist/mock_playlist_id_${playlist.id}`;
                          window.location.href = appleMusicUrl;
                          // Fallback to web
                          setTimeout(() => {
                            window.open(`https://music.apple.com/playlist/mock_playlist_id_${playlist.id}`, '_blank');
                          }, 1000);
                        } else {
                          // No playlist created yet, show message
                          alert('This playlist hasn\'t been created in any music service yet. Create it first by searching for the artist again!');
                        }
                      }}
                      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors aspect-square flex flex-col justify-between cursor-pointer"
                    >
                      <div className="flex-1 min-h-0 relative">
                        {playlist.attended && (
                          <svg className="w-3 h-3 text-gray-500 absolute top-0 right-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                          </svg>
                        )}
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 mb-3 pr-4">{playlist.artist}</h3>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 leading-tight truncate">{playlist.city}</p>
                          <p className="text-xs text-gray-500 leading-tight">{playlist.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 'concerts':
        return (
          <div className="space-y-6">
            {/* Search Section - Single Card Layout */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Concert Set Search</h2>
                  <p className="text-gray-500">Search for specific concert setlists and performances</p>
                </div>
                
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSetSearch(setSearchQuery);
                  }}
                  className="relative"
                >
                  <input
                    type="text"
                    value={setSearchQuery}
                    onChange={(e) => setSetSearchQuery(e.target.value)}
                    placeholder="Search for a concert set or venue..."
                    className="w-full p-3 border border-gray-300 rounded-lg outline-none transition-all duration-150 ease-in-out focus:border-teal-600 focus:shadow-sm pr-10"
                    disabled={loading}
                  />
                  {loading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600"></div>
                    </div>
                  )}
                </form>

                {error && (
                  <div className="mt-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                      <div className="flex items-center">
                        <span className="text-red-500 mr-2">⚠️</span>
                        <p className="text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {success && (
                  <div className="mt-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                      <div className="flex items-center">
                        <span className="text-green-500 mr-2">✅</span>
                        <p className="text-green-700">{success}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Searches - Below Search Bar in Same Card */}
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Recent set searches</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Taylor Swift MSG Dec 2024',
                      'Arctic Monkeys Red Rocks',
                      'Radiohead Coachella'
                    ].map((setSearch, index) => (
                      <button
                        key={index}
                        onClick={() => handleSetSearch(setSearch)}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 rounded-full text-xs font-medium transition-colors cursor-pointer"
                      >
                        {setSearch}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Concert History Section */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Concert History</h2>
                  <button className="text-sm text-teal-600 hover:text-teal-700">
                    View all
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      id: '1',
                      artist: 'Taylor Swift',
                      venue: 'Madison Square Garden',
                      city: 'New York, NY',
                      date: 'Dec 15, 2024',
                      attended: true,
                      playlistName: 'Taylor Swift - Eras Tour NYC',
                      createdPlaylists: {
                        spotify: true,
                        apple: false
                      }
                    },
                    {
                      id: '2',
                      artist: 'Arctic Monkeys',
                      venue: 'Red Rocks Amphitheatre',
                      city: 'Morrison, CO',
                      date: 'Aug 8, 2024',
                      attended: true,
                      playlistName: 'Arctic Monkeys - Red Rocks',
                      createdPlaylists: {
                        spotify: true,
                        apple: true
                      }
                    },
                    {
                      id: '3',
                      artist: 'Radiohead',
                      venue: 'Coachella Festival',
                      city: 'Indio, CA',
                      date: 'Apr 20, 2024',
                      attended: false,
                      playlistName: 'Radiohead - Coachella 2024',
                      createdPlaylists: {
                        spotify: false,
                        apple: true
                      }
                    }
                  ].map((playlist, index) => (
                    <div 
                      key={playlist.id} 
                      onClick={() => {
                        // Open preferred music player based on which service has the playlist
                        if (playlist.createdPlaylists?.spotify) {
                          // Open Spotify - this would use the actual playlist URL in a real app
                          const spotifyUrl = `spotify:playlist:mock_playlist_id_${playlist.id}`;
                          // Try to open Spotify app first, fallback to web
                          window.location.href = spotifyUrl;
                          // Fallback to web after a brief delay if app doesn't open
                          setTimeout(() => {
                            window.open(`https://open.spotify.com/playlist/mock_playlist_id_${playlist.id}`, '_blank');
                          }, 1000);
                        } else if (playlist.createdPlaylists?.apple) {
                          // Open Apple Music - this would use the actual playlist URL in a real app
                          const appleMusicUrl = `music://playlist/mock_playlist_id_${playlist.id}`;
                          window.location.href = appleMusicUrl;
                          // Fallback to web
                          setTimeout(() => {
                            window.open(`https://music.apple.com/playlist/mock_playlist_id_${playlist.id}`, '_blank');
                          }, 1000);
                        } else {
                          // No playlist created yet, show message
                          alert('This playlist hasn\'t been created in any music service yet. Create it first by searching for the artist again!');
                        }
                      }}
                      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors aspect-square flex flex-col justify-between cursor-pointer"
                    >
                      <div className="flex-1 min-h-0 relative">
                        {playlist.attended && (
                          <svg className="w-3 h-3 text-gray-500 absolute top-0 right-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                          </svg>
                        )}
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 mb-3 pr-4">{playlist.artist}</h3>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 leading-tight truncate">{playlist.city}</p>
                          <p className="text-xs text-gray-500 leading-tight">{playlist.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 'festivals':
        return (
          <div className="space-y-6">
            {/* Festival Experiences Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-medium text-gray-900 mb-6">Festival Experiences</h2>
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Multi-Artist Festival Magic</h3>
                <p className="text-gray-600 mb-4">Festivals are special - multiple artists, multiple sets, endless memories. Our festival mode will help you capture the full experience.</p>
                <div className="max-w-md mx-auto">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-purple-900 mb-2"><strong>Festival features in development:</strong></p>
                    <ul className="text-sm text-purple-800 space-y-1">
                      <li>• Multi-day festival tracking</li>
                      <li>• Artist lineup playlist creation</li>
                      <li>• Stage-by-stage organization</li>
                      <li>• Friend collaboration on festival playlists</li>
                    </ul>
                  </div>
                  <p className="text-sm text-gray-500">Currently, you can search for individual festival performers and create their setlist playlists!</p>
                </div>
              </div>
            </div>
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
        <div className="max-w-7xl mx-auto">
          {renderTabContent()}
        </div>
      </main>

      {/* Music Player Modal */}
      {showPlayer && selectedPlayerArtist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-r from-gray-900 to-black rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden text-white">
            {/* Header */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&q=80"
                      alt={selectedPlayerArtist.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{selectedPlayerArtist.name}</h3>
                    <p className="text-gray-300 text-sm">Average Setlist • Recent Tour 2024</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowPlayer(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Platform Selection */}
              <div className="flex gap-2 mt-4">
                <button className="flex items-center gap-2 px-4 py-2 bg-black rounded-lg text-sm font-medium text-white">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  Add to Apple Music
                </button>
              </div>
            </div>

            {/* Setlist Songs */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-2">
                {[
                  { name: 'Time (You and I)', duration: '3:42', frequency: '95%' },
                  { name: 'People Everywhere', duration: '4:18', frequency: '89%' },
                  { name: 'So We Won\'t Forget', duration: '3:56', frequency: '87%' },
                  { name: 'Cómo Me Quieres', duration: '5:23', frequency: '82%' },
                  { name: 'Marceline', duration: '4:09', frequency: '78%' },
                  { name: 'Lasso', duration: '3:31', frequency: '76%' },
                  { name: 'White Gloves', duration: '4:45', frequency: '71%' },
                  { name: 'August 12', duration: '3:28', frequency: '68%' },
                  { name: 'Two Fish and an Elephant', duration: '4:52', frequency: '65%' },
                  { name: 'Dang!', duration: '3:33', frequency: '61%' },
                  { name: 'A Hymn', duration: '5:12', frequency: '58%' },
                  { name: 'Pelota', duration: '3:47', frequency: '54%' }
                ].map((song, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-black/30 rounded-lg hover:bg-black/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white opacity-60 group-hover:opacity-100" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">{song.name}</p>
                        <p className="text-xs text-gray-400">Played in {song.frequency} of recent shows</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">{song.duration}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Player Controls Footer */}
            <div className="p-6 border-t border-gray-700 bg-black/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                    </svg>
                  </button>
                  <button className="w-12 h-12 bg-white hover:bg-gray-200 text-black rounded-full flex items-center justify-center transition-colors">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </button>
                  <button className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                    </svg>
                  </button>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      setShowPlayer(false);
                      setWizardPlatform('spotify');
                      setSelectedArtist(selectedPlayerArtist);
                      setShowWizard(true);
                    }}
                    className="px-6 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Create Playlist
                  </button>
                  <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">
                    Shuffle Play
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
          searchQuery={selectedArtist?.sortName}
        />
      )}
    </div>
  );
};

export default Home;
