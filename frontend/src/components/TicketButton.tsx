import React from 'react';
import AffiliateService from '../services/AffiliateService';

interface TicketButtonProps {
  artistName: string;
  venue: string;
  date: string;
  ticketUrl?: string;
  priceRange?: string;
  soldOut?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'minimal';
  conversionSource?: 'nearby_shows' | 'setlist_view' | 'search_result';
  className?: string;
}

const TicketButton: React.FC<TicketButtonProps> = ({
  artistName,
  venue,
  date,
  ticketUrl,
  priceRange,
  soldOut = false,
  size = 'medium',
  variant = 'primary',
  conversionSource = 'nearby_shows',
  className = ''
}) => {
  const affiliateService = AffiliateService.getInstance();

  const handleTicketClick = () => {
    // Generate affiliate URL
    const affiliateUrl = affiliateService.generateTicketUrl(
      ticketUrl,
      artistName,
      venue,
      date,
      'auto'
    );

    // Track the click for analytics
    affiliateService.trackTicketClick({
      eventId: `${artistName}_${venue}_${date}`.replace(/\s+/g, '_').toLowerCase(),
      artistName,
      venue,
      date,
      estimatedPrice: priceRange,
      platform: ticketUrl?.includes('ticketmaster') ? 'ticketmaster' :
                 ticketUrl?.includes('stubhub') ? 'stubhub' :
                 ticketUrl?.includes('seatgeek') ? 'seatgeek' : 'ticketmaster',
      conversionSource
    });

    // Open ticket URL in new tab
    window.open(affiliateUrl, '_blank', 'noopener,noreferrer');
  };

  // Button sizing
  const sizeClasses = {
    small: 'px-3 py-1.5 text-xs',
    medium: 'px-4 py-2 text-sm',
    large: 'px-6 py-3 text-base'
  };

  // Button variants
  const variantClasses = {
    primary: soldOut 
      ? 'bg-gray-400 text-white cursor-not-allowed' 
      : 'bg-green-600 hover:bg-green-700 text-white hover:shadow-lg transform hover:scale-105',
    secondary: soldOut
      ? 'bg-gray-200 text-gray-500 cursor-not-allowed border border-gray-300'
      : 'bg-white text-green-600 border-2 border-green-600 hover:bg-green-50',
    minimal: soldOut
      ? 'text-gray-400 underline cursor-not-allowed'
      : 'text-green-600 underline hover:text-green-700'
  };

  // Icon based on sold out status
  const icon = soldOut ? '🚫' : '🎫';

  // Button text
  const buttonText = soldOut 
    ? 'Sold Out' 
    : priceRange 
      ? `${icon} Tickets ${priceRange}`
      : `${icon} Get Tickets`;

  return (
    <button
      onClick={handleTicketClick}
      disabled={soldOut}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        font-semibold rounded-lg transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50
        ${className}
      `}
      title={soldOut ? 'This show is sold out' : `Buy tickets for ${artistName} at ${venue}`}
    >
      {buttonText}
    </button>
  );
};

// Compact version for carousel cards
export const CompactTicketButton: React.FC<Omit<TicketButtonProps, 'size' | 'variant'>> = (props) => (
  <TicketButton {...props} size="small" variant="primary" />
);

// Minimal version for inline text
export const MinimalTicketButton: React.FC<Omit<TicketButtonProps, 'size' | 'variant'>> = (props) => (
  <TicketButton {...props} size="small" variant="minimal" />
);

export default TicketButton;