import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Callback from './pages/Callback';
import MusicKitService from './services/MusicKitService';
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
    
    // Check for Apple Music user token
    const musicKit = MusicKitService.getInstance();
    const appleUserToken = musicKit.getUserToken();
    
    if (spotifyToken) {
      setAuth({
        isAuthenticated: true,
        platform: 'spotify',
        token: spotifyToken
      });
    } else if (appleUserToken) {
      setAuth({
        isAuthenticated: true,
        platform: 'apple',
        token: appleUserToken
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

  const handleLogout = async () => {
    try {
      // Clean up Spotify tokens
      localStorage.removeItem('spotify_access_token');
      localStorage.removeItem('spotify_refresh_token');
      
      // Sign out from Apple Music using MusicKit
      const musicKit = MusicKitService.getInstance();
      await musicKit.signOut();
      
      setAuth({
        isAuthenticated: false
      });
      
      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Still update auth state even if logout fails
      setAuth({
        isAuthenticated: false
      });
    }
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
