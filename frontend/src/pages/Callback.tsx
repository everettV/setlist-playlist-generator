import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Callback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<string>('Processing authentication...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Parse URL parameters
        const urlParams = new URLSearchParams(location.search);
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');
        const error = urlParams.get('error');
        
        console.log('Callback received:');
        console.log('Full URL:', window.location.href);
        console.log('Access Token:', accessToken ? 'Present' : 'Missing');
        console.log('Error:', error);
        
        if (error) {
          setStatus('❌ Authentication failed');
          setError(`Authentication error: ${error}`);
          console.error('Auth error:', error);
          setTimeout(() => navigate('/'), 5000);
          return;
        }
        
        if (accessToken) {
          // Direct token from backend redirect
          console.log('✅ Received access token from backend');
          localStorage.setItem('spotify_access_token', accessToken);
          if (refreshToken) {
            localStorage.setItem('spotify_refresh_token', refreshToken);
          }
          setStatus('✅ Successfully connected to Spotify!');
          setTimeout(() => navigate('/'), 2000);
          return;
        }
        
        // Fallback: try to exchange code if no token (shouldn't happen with new flow)
        const code = urlParams.get('code');
        if (code) {
          setStatus('🔄 Exchanging authorization code...');
          console.log('Attempting to exchange code...');
          
          const apiUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:3001' 
            : 'https://setlist-playlist-generator.onrender.com';
          
          const response = await fetch(`${apiUrl}/api/auth/callback?code=${encodeURIComponent(code)}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            mode: 'cors',
            credentials: 'include',
          });
          
          if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorData}`);
          }
          
          const data = await response.json();
          console.log('Token exchange response:', data);
          
          if (data.access_token) {
            localStorage.setItem('spotify_access_token', data.access_token);
            if (data.refresh_token) {
              localStorage.setItem('spotify_refresh_token', data.refresh_token);
            }
            setStatus('✅ Successfully connected to Spotify!');
            setTimeout(() => navigate('/'), 2000);
          } else {
            throw new Error('No access token in response');
          }
        } else {
          setStatus('❌ No authentication data received');
          setError('No token or code found in callback');
          setTimeout(() => navigate('/'), 5000);
        }
        
      } catch (error: any) {
        console.error('Authentication failed:', error);
        setStatus(`❌ Authentication failed`);
        setError(error.message || 'Unknown error');
        setTimeout(() => navigate('/'), 10000);
      }
    };

    handleCallback();
  }, [location, navigate]);

  return (
    <div style={{ 
      maxWidth: '500px', 
      margin: '50px auto', 
      padding: '20px', 
      textAlign: 'center',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#f9f9f9'
    }}>
      <h2>🎵 Spotify Authentication</h2>
      <p style={{ fontSize: '18px', marginBottom: '20px' }}>{status}</p>
      {error && (
        <div style={{ 
          backgroundColor: '#ffe6e6', 
          border: '1px solid #ff9999', 
          borderRadius: '4px', 
          padding: '10px', 
          marginTop: '20px',
          fontSize: '14px',
          color: '#cc0000'
        }}>
          <strong>Error details:</strong> {error}
        </div>
      )}
      <div style={{ fontSize: '24px', margin: '20px 0' }}>⏳</div>
      <p style={{ fontSize: '14px', color: '#666' }}>
        {status.includes('❌') ? 'Redirecting to home page...' : 'Please wait...'}
      </p>
    </div>
  );
};

export default Callback;