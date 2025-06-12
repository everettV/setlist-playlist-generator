import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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


interface LoginProps {
  onLogin: (token: string, platform: 'spotify' | 'apple') => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSpotifyLogin = async () => {
    try {
      setError('');
      setLoading(true);
      
      // For demo purposes, simulate successful login
      console.log('🎵 Demo login - simulating successful Spotify connection...');
      
      setTimeout(() => {
        const mockToken = 'demo_token_spotify_' + Date.now();
        localStorage.setItem('spotify_access_token', mockToken);
        onLogin(mockToken, 'spotify');
        setLoading(false);
        navigate('/sets');
      }, 1000);
      
    } catch (error: any) {
      console.error('❌ Login error:', error);
      setError(`Login failed: ${error.message}`);
      setLoading(false);
    }
  };

  const handleAppleMusicLogin = async () => {
    try {
      setError('');
      setLoading(true);
      
      // For demo purposes, simulate successful login
      console.log('🍎 Demo login - simulating successful Apple Music connection...');
      
      setTimeout(() => {
        const mockToken = 'demo_token_apple_' + Date.now();
        localStorage.setItem('apple_music_token', mockToken);
        onLogin(mockToken, 'apple');
        setLoading(false);
        navigate('/sets');
      }, 1000);
      
    } catch (error: any) {
      console.error('❌ Login error:', error);
      setError(`Login failed: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <BackgroundPattern />
      
      <div className="w-full max-w-md mx-auto relative z-10">
        <div className="bg-white-95 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-3">Concert Recap</h1>
            <p className="text-lg text-gray-600">
              Never miss a song from live shows
            </p>
          </div>

          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Choose Your Platform</h2>
              <p className="text-sm text-gray-500">Start building your concert collection</p>
            </div>

            <button
              onClick={handleSpotifyLogin}
              disabled={loading}
              className="btn-spotify w-full disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3.5 px-6 rounded-full transition-all duration-200 transform hover:scale-105 disabled:transform-none shadow-lg flex items-center justify-center gap-3 text-sm uppercase tracking-wider"
            >
              {loading ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Connecting...
                </span>
              ) : (
                <>
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                  <span>Log in with Spotify</span>
                </>
              )}
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white-95 text-gray-500">OR</span>
              </div>
            </div>

            <button
              onClick={handleAppleMusicLogin}
              disabled={loading}
              className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none shadow-lg flex items-center justify-center gap-3 text-sm"
            >
              {loading ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Connecting...
                </span>
              ) : (
                <>
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <span>Sign in with Apple</span>
                </>
              )}
            </button>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-red-400">⚠️</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="text-center text-xs text-gray-500 mt-6">
              <p className="mb-2">
                By continuing, you agree to our{' '}
                <a href="/terms" className="text-teal-600 hover:text-teal-700">Terms of Service</a>{' '}
                and{' '}
                <a href="/privacy" className="text-teal-600 hover:text-teal-700">Privacy Policy</a>.
              </p>
            </div>
          </div>
        </div>
        
        {/* Attribution right below the card */}
        <div className="mt-4 text-center text-sm text-white">
          <div style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
            <p><strong>Made by Everett & Elli Van Buskirk</strong></p>
            <p className="mt-1">Using Setlist.fm, Spotify, and Apple Music APIs</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;