import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Callback from './pages/Callback';
import './App.css';

interface AuthState {
  isAuthenticated: boolean;
  platform?: 'spotify' | 'apple';
  token?: string;
}

function App() {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false
  });

  useEffect(() => {
    // Check for existing auth tokens on mount
    const spotifyToken = localStorage.getItem('spotify_access_token');
    const appleToken = localStorage.getItem('apple_music_token');
    
    if (spotifyToken) {
      setAuth({
        isAuthenticated: true,
        platform: 'spotify',
        token: spotifyToken
      });
    } else if (appleToken) {
      setAuth({
        isAuthenticated: true,
        platform: 'apple',
        token: appleToken
      });
    }
  }, []);

  const handleLogin = (token: string, platform: 'spotify' | 'apple') => {
    setAuth({
      isAuthenticated: true,
      platform,
      token
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('apple_music_token');
    setAuth({
      isAuthenticated: false
    });
  };

  return (
    <Router>
      <div className="App">
        <main>
          <Routes>
            <Route 
              path="/" 
              element={
                auth.isAuthenticated ? 
                  <Navigate to="/sets" replace /> : 
                  <Login onLogin={handleLogin} />
              } 
            />
            <Route 
              path="/sets" 
              element={
                <Home />
              } 
            />
            <Route path="/callback" element={<Callback />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
