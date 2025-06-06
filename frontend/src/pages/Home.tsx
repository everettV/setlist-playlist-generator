import React, { useState } from 'react';
import { spotifyApi, setlistApi, playlistApi } from '../services/api';

const Home: React.FC = () => {
  const [artist, setArtist] = useState('');
  const [setlists, setSetlists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem('spotify_access_token')
  );

  const handleSpotifyLogin = async () => {
    try {
      const response = await spotifyApi.getAuthURL();
      window.location.href = response.data.authURL;
    } catch (error) {
      console.error('Failed to get auth URL:', error);
    }
  };

  const searchSetlists = async () => {
    if (!artist.trim()) return;
    
    setLoading(true);
    try {
      const response = await setlistApi.searchSetlists(artist);
      setSetlists(response.data);
    } catch (error) {
      console.error('Failed to search setlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPlaylist = async (setlist: any) => {
    if (!accessToken) {
      alert('Please login to Spotify first');
      return;
    }

    setLoading(true);
    try {
      const response = await playlistApi.createFromSetlist({
        accessToken,
        setlist,
        userId: 'me', // Will be resolved by Spotify API
      });
      
      alert(`Playlist created! ${response.data.tracksAdded}/${response.data.totalSongs} tracks added.`);
    } catch (error) {
      console.error('Failed to create playlist:', error);
      alert('Failed to create playlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      {!accessToken ? (
        <div className="auth-section">
          <p>Connect your Spotify account to create playlists</p>
          <button onClick={handleSpotifyLogin}>
            Login with Spotify
          </button>
        </div>
      ) : (
        <div className="main-content">
          <div className="search-section">
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Enter artist name"
            />
            <button onClick={searchSetlists} disabled={loading}>
              {loading ? 'Searching...' : 'Search Setlists'}
            </button>
          </div>

          {setlists.length > 0 && (
            <div className="setlists-section">
              <h2>Recent Setlists for {artist}</h2>
              {setlists.map((setlist: any) => (
                <div key={setlist.id} className="setlist-card">
                  <h3>{setlist.venue.name}</h3>
                  <p>{setlist.venue.city.name}, {setlist.venue.city.country.name}</p>
                  <p>{setlist.eventDate}</p>
                  <p>{setlist.sets.set.reduce((total: number, set: any) => 
                    total + set.song.length, 0)} songs</p>
                  <button onClick={() => createPlaylist(setlist)}>
                    Create Playlist
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;