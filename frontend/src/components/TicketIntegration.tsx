import React, { useState } from 'react';

interface Concert {
  id: string;
  artist: string;
  venue: string;
  city: string;
  date: string;
  ticketsAvailable: boolean;
  priceRange?: {
    min: number;
    max: number;
  };
  affiliateUrl?: string;
}

interface TicketIntegrationProps {
  setlistData: {
    artist: string;
    venue: string;
    city: string;
    date: string;
  };
  onTicketClick?: (concert: Concert) => void;
}

const TicketIntegration: React.FC<TicketIntegrationProps> = ({ 
  setlistData, 
  onTicketClick 
}) => {
  const [loading, setLoading] = useState(false);
  const [showDisclosure, setShowDisclosure] = useState(false);

  // Mock upcoming concerts based on setlist data
  const upcomingConcerts: Concert[] = [
    {
      id: '1',
      artist: setlistData.artist,
      venue: 'Madison Square Garden',
      city: 'New York, NY',
      date: '2025-03-15',
      ticketsAvailable: true,
      priceRange: { min: 89, max: 350 },
      affiliateUrl: 'https://partner.vivid-seats.com?artist=' + encodeURIComponent(setlistData.artist)
    },
    {
      id: '2', 
      artist: setlistData.artist,
      venue: 'Red Rocks Amphitheatre',
      city: 'Morrison, CO',
      date: '2025-04-22',
      ticketsAvailable: true,
      priceRange: { min: 125, max: 425 },
      affiliateUrl: 'https://partner.vivid-seats.com?artist=' + encodeURIComponent(setlistData.artist)
    }
  ];

  const handleTicketClick = (concert: Concert) => {
    if (onTicketClick) {
      onTicketClick(concert);
    }
    
    // Track affiliate click
    if (concert.affiliateUrl) {
      // Analytics tracking here
      window.open(concert.affiliateUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
      {/* FTC Compliance Disclosure */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm">
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-blue-800 font-medium">Affiliate Partnership Notice</p>
            <p className="text-blue-700 mt-1">
              🎫 Concert Recap earns a commission when you purchase tickets through our links. 
              This helps us keep the service free while supporting artists and venues.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">Find Similar Shows</h3>
        <button
          onClick={() => setShowDisclosure(!showDisclosure)}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          About Our Partnerships
        </button>
      </div>

      {showDisclosure && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm text-gray-700">
          <h4 className="font-semibold mb-2">How Concert Recap Makes Money</h4>
          <ul className="space-y-1 list-disc list-inside">
            <li>We partner with ticket platforms like Vivid Seats</li>
            <li>When you buy tickets through our links, we earn a small commission</li>
            <li>This doesn't change your ticket price</li>
            <li>It helps us keep Concert Recap free for everyone</li>
          </ul>
        </div>
      )}

      <p className="text-gray-600 mb-6">
        Love this setlist? Check out upcoming {setlistData.artist} concerts near you:
      </p>

      <div className="space-y-4">
        {upcomingConcerts.map((concert) => (
          <div
            key={concert.id}
            className="border border-gray-200 rounded-xl p-4 hover:border-teal-500 hover:shadow-md transition-all cursor-pointer"
            onClick={() => handleTicketClick(concert)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-bold text-gray-800 text-lg">{concert.artist}</h4>
                <p className="text-gray-600 font-medium">{concert.venue}</p>
                <p className="text-gray-500 text-sm">{concert.city}</p>
                <p className="text-gray-500 text-sm">
                  {new Date(concert.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric', 
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              
              <div className="text-right">
                {concert.ticketsAvailable && concert.priceRange ? (
                  <>
                    <div className="text-right mb-2">
                      <p className="text-sm text-gray-500">From</p>
                      <p className="text-2xl font-bold text-teal-600">
                        ${concert.priceRange.min}
                      </p>
                      <p className="text-xs text-gray-400">
                        Up to ${concert.priceRange.max}
                      </p>
                    </div>
                    <button
                      className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                      rel="sponsored"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                      Find Tickets
                    </button>
                  </>
                ) : (
                  <div className="text-gray-400">
                    <p className="text-sm">Sold Out</p>
                    <button className="text-teal-600 hover:text-teal-700 text-sm underline">
                      Get Notified
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Revenue Opportunities */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-3">Complete Your Concert Experience</h4>
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:border-teal-500 hover:bg-gray-50 transition-all text-sm">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-gray-700">Hotels</span>
          </button>
          
          <button className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:border-teal-500 hover:bg-gray-50 transition-all text-sm">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <span className="text-gray-700">Flights</span>
          </button>
          
          <button className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:border-teal-500 hover:bg-gray-50 transition-all text-sm">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="text-gray-700">Merch</span>
          </button>
          
          <button className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:border-teal-500 hover:bg-gray-50 transition-all text-sm">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="text-gray-700">Dining</span>
          </button>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>Secure Checkout</span>
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          <span>Mobile Tickets</span>
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-3 h-3 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
          </svg>
          <span>24/7 Support</span>
        </div>
      </div>
    </div>
  );
};

export default TicketIntegration;