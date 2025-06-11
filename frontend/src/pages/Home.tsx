import React, { useState } from 'react';
import ArtistAutocomplete from '../components/ArtistAutocomplete';

interface Artist {
  mbid: string;
  name: string;
  sortName: string;
  disambiguation?: string;
  verified?: boolean;
}

const Home: React.FC = () => {
  const [artistName, setArtistName] = useState('');
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleArtistSelect = (artist: Artist) => {
    setSelectedArtist(artist);
    setError('');
  };

  const handleCreatePlaylist = async (platform: 'spotify' | 'apple') => {
    if (!artistName.trim()) {
      setError('Please enter an artist name');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/create-playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          artistName: artistName.trim(),
          platform,
          artistMbid: selectedArtist?.mbid
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create playlist');
      }

      setSuccess(`Playlist created successfully! ${data.playlistUrl ? `View it here: ${data.playlistUrl}` : ''}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
              Setlist Playlist Generator
            </h1>
            <p className="text-gray-600 text-center mb-6">
              Turn concert setlists into playlists
            </p>

            <div className="space-y-4">
              <div>
                <label htmlFor="artist" className="block text-sm font-medium text-gray-700 mb-2">
                  Artist Name
                </label>
                <ArtistAutocomplete
                  value={artistName}
                  onChange={setArtistName}
                  onSelect={handleArtistSelect}
                  placeholder="Try typing 'kruangbin' or 'beatlees'..."
                  className="mb-4"
                />
                {selectedArtist && (
                  <div className="text-sm text-green-600 mb-2 flex items-center space-x-2">
                    <span>✓ Selected: {selectedArtist.name}</span>
                    {selectedArtist.verified && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                        Has Setlists
                      </span>
                    )}
                    {selectedArtist.disambiguation && (
                      <span className="text-gray-500">({selectedArtist.disambiguation})</span>
                    )}
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                  {success}
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => handleCreatePlaylist('spotify')}
                  disabled={loading}
                  className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {loading ? 'Creating...' : 'Create Spotify Playlist'}
                </button>

                <button
                  onClick={() => handleCreatePlaylist('apple')}
                  disabled={loading}
                  className="flex-1 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {loading ? 'Creating...' : 'Create Apple Music Playlist'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
