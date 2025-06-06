import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Callback from './pages/Callback';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>🎵 Setlist Playlist Generator</h1>
          <p>Create Spotify playlists from concert setlists</p>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/callback" element={<Callback />} />
          </Routes>
        </main>
        <footer className="App-footer">
          <p>Powered by Setlist.fm and Spotify APIs</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;