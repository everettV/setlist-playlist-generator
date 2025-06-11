// UI TEMPLATE - PRESERVE THIS STRUCTURE
import React, { useState } from 'react';
// Add your custom components here

// REQUIRED: Abstract background component
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

// REQUIRED: HeadphonesLogo component (DO NOT MODIFY)
const HeadphonesLogo: React.FC<{ className?: string }> = React.memo(({ className = "w-16 h-16" }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none">
    <path
      d="M32 8C21.5 8 13 16.5 13 27v10c0 2.2 1.8 4 4 4h4c2.2 0 4-1.8 4-4V31c0-2.2-1.8-4-4-4h-1c0-8.8 7.2-16 16-16s16 7.2 16 16h-1c-2.2 0-4 1.8-4 4v6c0 2.2 1.8 4 4 4h4c2.2 0 4-1.8 4-4V27c0-10.5-8.5-19-19-19z"
      fill="currentColor"
    />
  </svg>
));

const Home: React.FC = () => {
  // Add your state and logic here
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <BackgroundPattern />
      
      <div className="w-full max-w-md mx-auto bg-white-95 backdrop-blur-sm rounded-2xl shadow-xl p-8 relative z-10">
        <div className="text-center mb-8">
          <HeadphonesLogo className="w-16 h-16 mx-auto mb-4 text-gray-800" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🎵 Setlist Playlist Generator</h1>
          <p className="text-gray-600">
            Create Spotify playlists from concert setlists
          </p>
        </div>

        <div className="border-t border-gray-200 pt-8">
          {/* YOUR FORM CONTENT HERE */}
          <div className="space-y-6">
            {/* Add form fields, autocomplete, etc. */}
            
            {/* REQUIRED: Button section with exact styling */}
            <div className="space-y-3">
              <button
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none shadow-lg"
              >
                🎵 Create Spotify Playlist
              </button>

              <button
                className="w-full bg-gray-800 hover:bg-gray-900 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none shadow-lg"
              >
                🍎 Create Apple Music Playlist
              </button>
            </div>
          </div>
        </div>

        {/* REQUIRED: Footer (DO NOT MODIFY) */}
        <div className="border-t border-gray-200 mt-8 pt-6 text-center text-sm text-gray-600">
          <p>Made by <strong>Elli Rego</strong> using <strong>Setlist.fm</strong>,</p>
          <p><strong>Spotify</strong>, and <strong>Apple Music</strong> APIs.</p>
          <div className="mt-2">
            <a href="#" className="text-teal-600">Attributions</a>
            <span className="mx-2">•</span>
            <a href="#" className="text-teal-600">Feedback?</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
