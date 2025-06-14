import React, { useState } from 'react';

interface Setlist {
  id: string;
  venue: string;
  date: string;
  tour?: string;
  songCount: number;
  city?: string;
  createdPlaylists?: {
    spotify?: boolean;
    apple?: boolean;
  };
}

interface Song {
  name: string;
  found: boolean;
  album?: string;
  duration?: string;
  artist?: string;
  availableOn: {
    spotify: boolean;
    apple: boolean;
  };
}

interface SetlistWizardProps {
  artistName: string;
  platform: 'spotify' | 'apple';
  onClose: () => void;
  onComplete: (playlistId?: string) => void;
  connectedServices?: {
    spotify: boolean;
    apple: boolean;
  };
  searchQuery?: string;
}

const SetlistWizard: React.FC<SetlistWizardProps> = ({ 
  artistName, 
  platform: initialPlatform, 
  onClose, 
  onComplete,
  connectedServices = { spotify: false, apple: false },
  searchQuery
}) => {
  const [step, setStep] = useState(1);
  const [selectedSetlist, setSelectedSetlist] = useState<Setlist | null>(null);
  const [platform, setPlatform] = useState<'spotify' | 'apple'>(initialPlatform);
  const [loading, setLoading] = useState(false);

  // Mock data - will be replaced with real API calls
  // Filter setlists based on search query if provided
  const getAllMockSetlists = () => [
    {
      id: '1',
      venue: 'Madison Square Garden',
      date: 'Dec 15, 2024',
      tour: 'Eras Tour 2024',
      songCount: 23,
      city: 'New York, NY',
      createdPlaylists: {
        spotify: true,
        apple: false
      }
    },
    {
      id: '2',
      venue: 'Coachella Festival',
      date: 'Apr 20, 2024',
      tour: 'Festival Performance',
      songCount: 18,
      city: 'Indio, CA',
      createdPlaylists: {
        spotify: true,
        apple: true
      }
    },
    {
      id: '3',
      venue: 'Red Rocks Amphitheatre',
      date: 'Aug 8, 2024',
      tour: 'Greatest Hits Tour',
      songCount: 26,
      city: 'Morrison, CO'
    },
    {
      id: '4',
      venue: 'The Forum',
      date: 'Nov 3, 2024',
      tour: 'World Tour 2024',
      songCount: 20,
      city: 'Los Angeles, CA',
      createdPlaylists: {
        spotify: false,
        apple: true
      }
    },
    {
      id: '5',
      venue: 'Wembley Stadium',
      date: 'Sep 12, 2024',
      tour: 'European Tour',
      songCount: 24,
      city: 'London, UK'
    }
  ];

  const getFilteredSetlists = () => {
    const allSetlists = getAllMockSetlists();
    
    // If no search query or search query is just an artist name, show default setlists
    if (!searchQuery || searchQuery === artistName) {
      return allSetlists.slice(0, 3);
    }
    
    const query = searchQuery.toLowerCase();
    
    // Filter based on search query relevance
    const filtered = allSetlists.filter(setlist => 
      setlist.venue.toLowerCase().includes(query) ||
      setlist.city.toLowerCase().includes(query) ||
      setlist.tour.toLowerCase().includes(query) ||
      setlist.date.toLowerCase().includes(query)
    );
    
    // If no matches found, return default setlists
    if (filtered.length === 0) {
      return allSetlists.slice(0, 3);
    }
    
    return filtered.slice(0, 4); // Show up to 4 relevant results
  };

  const mockSetlists: Setlist[] = getFilteredSetlists();

  const mockSongs: Song[] = [
    { name: 'Time (You and I)', found: true, album: 'Mordechai', duration: '3:42', artist: artistName, availableOn: { spotify: true, apple: true } },
    { name: 'People Everywhere', found: true, album: 'Con Todo El Mundo', duration: '4:18', artist: artistName, availableOn: { spotify: true, apple: false } },
    { name: 'So We Won\'t Forget', found: true, album: 'Mordechai', duration: '3:56', artist: artistName, availableOn: { spotify: false, apple: true } },
    { name: 'Evan Finds the Third Room', found: false, artist: artistName, availableOn: { spotify: false, apple: false } },
    { name: 'Cómo Me Quieres', found: true, album: 'Con Todo El Mundo', duration: '5:23', artist: artistName, availableOn: { spotify: true, apple: true } },
    { name: 'Marceline', found: true, album: 'Con Todo El Mundo', duration: '4:09', artist: artistName, availableOn: { spotify: true, apple: true } },
    { name: 'Unknown Song Title', found: false, artist: artistName, availableOn: { spotify: false, apple: false } },
    { name: 'Lasso', found: true, album: 'Mordechai', duration: '3:31', artist: artistName, availableOn: { spotify: true, apple: false } },
  ];

  const handleSetlistSelect = (setlist: Setlist) => {
    setSelectedSetlist(setlist);
    setStep(2);
  };

  const handleCreatePlaylist = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setStep(3);
    }, 2000);
  };

  const platformColors = {
    spotify: 'bg-green-500 hover:bg-green-600',
    apple: 'bg-black hover:bg-gray-800'
  };

  const platformNames = {
    spotify: 'Spotify',
    apple: 'Apple Music'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header with Artist Background */}
        <div className="relative h-32 overflow-hidden">
          {/* Artist Background Image - placeholder gradient for now */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-teal-600"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-40" />
          
          {/* Artist Name */}
          <div className="relative h-full flex items-center justify-between px-6 text-white">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-1">{artistName}</h2>
              {selectedSetlist ? (
                <div className="text-white/90">
                  <p className="text-lg font-medium">{selectedSetlist.venue}</p>
                  <p className="text-white/80 text-sm">{selectedSetlist.city} • {selectedSetlist.date}</p>
                </div>
              ) : (
                <p className="text-white/80 text-sm">Select a setlist to create your playlist</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col h-[calc(90vh-8rem)]">
          {/* Step 1: Setlist Selection */}
          {step === 1 && (
            <div className="flex-1 p-6 overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Select a Setlist</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockSetlists.map((setlist) => (
                  <div
                    key={setlist.id}
                    onClick={() => handleSetlistSelect(setlist)}
                    className="p-6 border-2 border-gray-200 rounded-lg hover:border-teal-500 hover:bg-gray-50 cursor-pointer transition-all text-center"
                  >
                    <h4 className="font-semibold text-gray-800 text-base mb-2">{setlist.tour}</h4>
                    <p className="text-sm text-gray-600">{setlist.venue}</p>
                    <p className="text-xs text-gray-500 mt-1">{setlist.city} • {setlist.date}</p>
                    
                    {/* Playlist Creation Status */}
                    {setlist.createdPlaylists && (setlist.createdPlaylists.spotify || setlist.createdPlaylists.apple) && (
                      <div className="mt-4 text-center">
                        <p className="text-xs text-gray-500 mb-1">Playlist created in:</p>
                        <div className="flex gap-2 justify-center">
                          {setlist.createdPlaylists.spotify && (
                            <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                            </svg>
                          )}
                          {setlist.createdPlaylists.apple && (
                            <svg className="w-5 h-5 text-gray-900" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                            </svg>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Song Preview */}
          {step === 2 && selectedSetlist && (
            <>
              {/* Scrollable content area */}
              <div className="flex-1 p-6 overflow-y-auto pb-0">
                {/* Music Player Interface for All Songs */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-800">Setlist Preview</h4>
                    <span className="text-sm text-gray-600">{mockSongs.length} songs</span>
                  </div>
                  
                  {/* Header Row */}
                  <div className="flex items-center px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 mb-2">
                    <div className="w-8">#</div>
                    <div className="flex-1 min-w-0">Title</div>
                    <div className="hidden md:block flex-1 min-w-0 px-4">Album</div>
                    <div className="w-16 text-center">Services</div>
                    <div className="w-12 text-right">Time</div>
                  </div>
                  
                  <div className="space-y-1">
                    {mockSongs.map((song, index) => (
                      <div
                        key={index}
                        className={`flex items-center p-3 rounded-lg transition-colors group ${
                          (song.availableOn.spotify || song.availableOn.apple) ? 'hover:bg-white' : 'bg-red-50/50 hover:bg-red-50'
                        }`}
                      >
                        {/* Track Number */}
                        <div className="w-8 text-center">
                          <span className={`text-sm group-hover:hidden ${
                            (song.availableOn.spotify || song.availableOn.apple) ? 'text-gray-500' : 'text-gray-400'
                          }`}>{index + 1}</span>
                          {(song.availableOn.spotify || song.availableOn.apple) ? (
                            <svg className="w-4 h-4 text-gray-400 hidden group-hover:block mx-auto" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-red-400 hidden group-hover:block mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </div>
                        
                        {/* Song Info */}
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium truncate ${
                            (song.availableOn.spotify || song.availableOn.apple) ? 'text-gray-900' : 'text-gray-600'
                          }`}>{song.name}</p>
                        </div>
                        
                        {/* Album */}
                        <div className="hidden md:block flex-1 min-w-0 px-4">
                          <p className={`text-sm truncate ${
                            (song.availableOn.spotify || song.availableOn.apple) ? 'text-gray-600' : 'text-gray-400'
                          }`}>{song.album || '—'}</p>
                        </div>
                        
                        {/* Service Availability */}
                        <div className="w-16 flex justify-center gap-1">
                          {song.availableOn.spotify || song.availableOn.apple ? (
                            <div className="flex gap-1">
                              {song.availableOn.spotify && (
                                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center" title="Available on Spotify">
                                  <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                                  </svg>
                                </div>
                              )}
                              {song.availableOn.apple && (
                                <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center" title="Available on Apple Music">
                                  <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                                  </svg>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center" title="Not available on any service">
                              <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </div>
                          )}
                        </div>
                        
                        {/* Duration */}
                        <div className={`text-sm w-12 text-right ${
                          (song.availableOn.spotify || song.availableOn.apple) ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          {song.duration || '—'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sticky bottom section */}
              <div className="border-t border-gray-200 bg-white p-6 rounded-b-2xl">
                {/* Attended Checkbox */}
                <div className="mb-6 flex justify-center">
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    I attended this set!
                  </label>
                </div>

                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Back
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setPlatform('spotify');
                        handleCreatePlaylist();
                      }}
                      disabled={loading}
                      className="btn-spotify disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-full transition-all duration-200 shadow flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
                    >
                      {loading && platform === 'spotify' ? (
                        <span className="flex items-center">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                          Creating...
                        </span>
                      ) : (
                        <>
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                          </svg>
                          <span>Spotify</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setPlatform('apple');
                        handleCreatePlaylist();
                      }}
                      disabled={loading}
                      className="bg-black hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow flex items-center justify-center gap-2 text-sm"
                    >
                      {loading && platform === 'apple' ? (
                        <span className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                          Creating...
                        </span>
                      ) : (
                        <>
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                          </svg>
                          <span>Apple Music</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Step 3: Success */}
          {step === 3 && selectedSetlist && (
            <div className="flex-1 p-6 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Playlist Created!</h3>
                <p className="text-lg text-gray-600 mb-2">"{artistName} - {selectedSetlist.venue}"</p>
                <p className="text-sm text-gray-500 mb-8">
                  {mockSongs.filter(s => s.found).length} songs • Approximately 1hr 12min
                </p>

                <div className="space-y-3">
                  <button
                    className={`w-full px-6 py-3 text-white rounded-lg transition-colors ${platformColors[platform]}`}
                  >
                    Open in {platformNames[platform]}
                  </button>
                  <button
                    onClick={() => {
                      onComplete();
                      onClose();
                    }}
                    className="w-full px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Create Another
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetlistWizard;