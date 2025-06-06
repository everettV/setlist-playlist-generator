import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { spotifyApi } from '../services/api';

const Callback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('Processing authentication...');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      
      console.log('Callback received - Code:', code ? 'Present' : 'Missing', 'Error:', error);
      
      if (error) {
        setStatus('❌ Authentication cancelled or failed');
        console.error('Spotify auth error:', error);
        setTimeout(() => navigate('/'), 3000);
        return;
      }
      
      if (!code) {
        setStatus('❌ No authorization code received');
        console.error('No code in callback');
        setTimeout(() => navigate('/'), 3000);
        return;
      }
      
      try {
        setStatus('🔄 Exchanging authorization code...');
        console.log('Attempting to exchange code...');
        
        const response = await spotifyApi.handleCallback(code);
        console.log('Token exchange response:', response.data);
        
        if (response.data.access_token) {
          localStorage.setItem('spotify_access_token', response.data.access_token);
          setStatus('✅ Successfully connected to Spotify!');
          setTimeout(() => navigate('/'), 2000);
        } else {
          throw new Error('No access token in response');
        }
      } catch (error: any) {
        console.error('Token exchange failed:', error);
        setStatus(`❌ Failed to connect: ${error.response?.data?.error || 'Unknown error'}`);
        setTimeout(() => navigate('/'), 5000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="callback-page">
      <div className="callback-card">
        <h2>🎵 Spotify Authentication</h2>
        <p>{status}</p>
        <div className="spinner">⏳</div>
      </div>
    </div>
  );
};

export default Callback;