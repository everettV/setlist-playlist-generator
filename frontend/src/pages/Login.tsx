import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MusicKitService from '../services/MusicKitService';

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
  const [initializing, setInitializing] = useState(true);
  const navigate = useNavigate();
  const musicKit = MusicKitService.getInstance();

  // Initialize MusicKit on component mount
  useEffect(() => {
    const initializeMusicKit = async () => {
      try {
        setInitializing(true);
        console.log('🍎 Initializing MusicKit...');
        await musicKit.initialize();
        
        // Check if user is already authorized
        if (musicKit.isAuthorized()) {
          const userToken = musicKit.getUserToken();
          if (userToken) {
            console.log('✅ User already authorized');
            onLogin(userToken, 'apple');
            navigate('/sets');
            return;
          }
        }
        
        console.log('✅ MusicKit ready for authentication');
      } catch (error) {
        console.error('❌ MusicKit initialization failed:', error);
        setError('Failed to initialize Apple Music. Please check your connection and try again.');
      } finally {
        setInitializing(false);
      }
    };

    initializeMusicKit();
  }, [musicKit, onLogin, navigate]);

  const handleAppleMusicLogin = async () => {
    try {
      setError('');
      setLoading(true);
      
      console.log('🍎 Starting Apple Music authentication...');
      
      // Request user authorization through MusicKit
      const userToken = await musicKit.authorize();
      
      if (userToken) {
        console.log('✅ Apple Music authentication successful');
        onLogin(userToken, 'apple');
        navigate('/sets');
      } else {
        throw new Error('Failed to get user token');
      }
      
    } catch (error: any) {
      console.error('❌ Apple Music authentication failed:', error);
      
      let errorMessage = 'Failed to connect to Apple Music';
      
      if (error.message.includes('User denied')) {
        errorMessage = 'Please allow access to Apple Music to continue';
      } else if (error.message.includes('not available')) {
        errorMessage = 'Apple Music is not available in your region';
      } else if (error.message.includes('subscription')) {
        errorMessage = 'Apple Music subscription required';
      }
      
      setError(errorMessage);
    } finally {
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
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Get Started</h2>
              <p className="text-sm text-gray-500">
                {initializing 
                  ? "Setting up Apple Music integration..." 
                  : "Connect with Apple Music to start building your concert collection"
                }
              </p>
            </div>


            <button
              onClick={handleAppleMusicLogin}
              disabled={loading || initializing}
              className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none shadow-lg flex items-center justify-center gap-3 text-sm"
            >
              {initializing ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Initializing...
                </span>
              ) : loading ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Authenticating...
                </span>
              ) : (
                <>
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <span>Sign in with Apple Music</span>
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
                <strong>Note:</strong> An active Apple Music subscription is required to create playlists.
              </p>
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
            <p className="mt-1">Using Setlist.fm and Apple Music APIs</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;