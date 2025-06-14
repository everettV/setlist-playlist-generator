import React, { useState, useRef } from 'react';
import { Artist } from '../services/ClientArtistSearch';
import { ArtistOnTour } from '../services/ArtistsOnTourService';
import { CompactTicketButton } from './TicketButton';

interface RecentlyPlayedCarouselProps {
  artists: (Artist | ArtistOnTour)[];
  onArtistSelect: (artist: Artist) => void;
  loading?: boolean;
  title?: string;
  subtitle?: string;
}

const RecentlyPlayedCarousel: React.FC<RecentlyPlayedCarouselProps> = ({
  artists,
  onArtistSelect,
  loading = false,
  title = "Recently Played Artists",
  subtitle
}) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!containerRef.current) return;
    
    const scrollAmount = 300;
    const newPosition = direction === 'left' 
      ? Math.max(0, scrollPosition - scrollAmount)
      : scrollPosition + scrollAmount;
    
    containerRef.current.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });
    setScrollPosition(newPosition);
  };

  const handleScroll = () => {
    if (containerRef.current) {
      setScrollPosition(containerRef.current.scrollLeft);
    }
  };

  // Loading Skeleton Component
  const LoadingSkeleton = () => (
    <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="flex-shrink-0 w-32">
          <div className="w-32 h-32 bg-gray-200 animate-pulse rounded-xl mb-3"></div>
          <div className="text-center">
            <div className="h-4 bg-gray-200 animate-pulse rounded mb-2"></div>
            <div className="h-3 bg-gray-200 animate-pulse rounded w-3/4 mx-auto"></div>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading && artists.length === 0) {
    return (
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  if (artists.length === 0 && !loading) {
    console.log('🎪 No artists and not loading, returning null');
    return null;
  }

  // Helper function to check if artist is on tour
  const isArtistOnTour = (artist: Artist | ArtistOnTour): artist is ArtistOnTour => {
    return 'tourDates' in artist && Array.isArray(artist.tourDates);
  };

  // Debug logging
  console.log('🎪 RecentlyPlayedCarousel received:', {
    title,
    subtitle,
    loading,
    artistsCount: artists.length,
    artists: artists.slice(0, 3) // Show first 3 for debugging
  });

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={scrollPosition <= 0}
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
      >
        {artists.map((artist, index) => (
          <div
            key={artist.mbid || index}
            className="flex-shrink-0 w-32 group"
          >
            <div 
              onClick={() => onArtistSelect(artist)}
              className={`w-32 h-32 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-105 mb-3 relative overflow-hidden cursor-pointer ${
              isArtistOnTour(artist) && artist.tourDates.length > 0
                ? artist.ticketingUrgency === 'high' 
                  ? 'bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 ring-2 ring-red-400'
                  : artist.ticketingUrgency === 'medium'
                  ? 'bg-gradient-to-br from-orange-400 via-pink-400 to-red-400 ring-2 ring-orange-300'
                  : 'bg-gradient-to-br from-green-400 via-teal-400 to-blue-400 ring-2 ring-green-300'
                : 'bg-gradient-to-br from-purple-400 via-pink-400 to-red-400'
            }`}>
              {/* Artist Image */}
              {artist.artwork?.url ? (
                <img 
                  src={artist.artwork.url}
                  alt={artist.name}
                  className="w-full h-full object-cover"
                  onLoad={() => console.log(`✅ Image loaded for ${artist.name}:`, artist.artwork?.url)}
                  onError={(e) => {
                    console.log(`❌ Image failed for ${artist.name}:`, artist.artwork?.url);
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.setAttribute('style', 'display: flex');
                  }}
                />
              ) : null}
              {/* Fallback Placeholder */}
              <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold" style={{display: artist.artwork?.url ? 'none' : 'flex'}}>
                {artist.name.charAt(0).toUpperCase()}
              </div>
              
            </div>
            
            <div className="text-center">
              <h4 className="font-medium text-gray-900 text-sm truncate group-hover:text-teal-600 transition-colors">
                {artist.name}
              </h4>
              {isArtistOnTour(artist) && artist.tourDates.length > 0 ? (
                <div className="mt-1 space-y-1">
                  <p className="text-xs text-gray-500 truncate">
                    {new Date(artist.tourDates[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {artist.tourDates[0].venue}
                  </p>
                  <CompactTicketButton
                    artistName={artist.name}
                    venue={artist.tourDates[0].venue}
                    date={artist.tourDates[0].date}
                    ticketUrl={artist.tourDates[0].ticketUrl}
                    priceRange={artist.tourDates[0].priceRange}
                    soldOut={artist.tourDates[0].soldOut}
                    conversionSource="nearby_shows"
                    className="w-full"
                  />
                </div>
              ) : artist.disambiguation ? (
                <p className="text-xs text-gray-500 truncate mt-1">
                  {artist.disambiguation}
                </p>
              ) : (
                <p className="text-xs text-gray-500 truncate mt-1">
                  Recently played
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentlyPlayedCarousel;