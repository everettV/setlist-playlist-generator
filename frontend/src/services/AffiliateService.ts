// Ticket affiliate service for monetization
export interface AffiliateConfig {
  ticketmaster: {
    affiliateId: string;
    trackingCode: string;
  };
  stubhub: {
    affiliateId: string;
    trackingCode: string;
  };
  seatgeek: {
    affiliateId: string;
    trackingCode: string;
  };
}

export interface TicketPurchaseEvent {
  eventId: string;
  artistName: string;
  venue: string;
  date: string;
  estimatedPrice?: string;
  platform: 'ticketmaster' | 'stubhub' | 'seatgeek' | 'direct';
  userId?: string;
  timestamp: Date;
  conversionSource: 'nearby_shows' | 'setlist_view' | 'search_result';
}

export class AffiliateService {
  private static instance: AffiliateService;
  private config: AffiliateConfig;

  private constructor() {
    this.config = {
      ticketmaster: {
        affiliateId: process.env.REACT_APP_TICKETMASTER_AFFILIATE_ID || 'setlist001',
        trackingCode: process.env.REACT_APP_TICKETMASTER_TRACKING || 'SLP001'
      },
      stubhub: {
        affiliateId: process.env.REACT_APP_STUBHUB_AFFILIATE_ID || 'setlist001',
        trackingCode: process.env.REACT_APP_STUBHUB_TRACKING || 'SLP001'
      },
      seatgeek: {
        affiliateId: process.env.REACT_APP_SEATGEEK_AFFILIATE_ID || 'setlist001',
        trackingCode: process.env.REACT_APP_SEATGEEK_TRACKING || 'SLP001'
      }
    };
  }

  static getInstance(): AffiliateService {
    if (!AffiliateService.instance) {
      AffiliateService.instance = new AffiliateService();
    }
    return AffiliateService.instance;
  }

  // Generate affiliate ticket URL
  generateTicketUrl(
    originalUrl: string | undefined,
    artistName: string,
    venue: string,
    date: string,
    platform: 'ticketmaster' | 'stubhub' | 'seatgeek' | 'auto' = 'auto'
  ): string {
    // If we have a direct URL, enhance it with affiliate params
    if (originalUrl && originalUrl.includes('ticketmaster.com')) {
      return this.enhanceTicketmasterUrl(originalUrl);
    }
    if (originalUrl && originalUrl.includes('stubhub.com')) {
      return this.enhanceStubHubUrl(originalUrl);
    }
    if (originalUrl && originalUrl.includes('seatgeek.com')) {
      return this.enhanceSeatGeekUrl(originalUrl);
    }

    // Generate search URL if no direct link
    const searchTerm = encodeURIComponent(`${artistName} ${venue}`);
    const searchDate = encodeURIComponent(date);

    switch (platform) {
      case 'ticketmaster':
        return `https://www.ticketmaster.com/search?q=${searchTerm}&daterange=${searchDate}&affiliate=${this.config.ticketmaster.affiliateId}&tracking=${this.config.ticketmaster.trackingCode}`;
      
      case 'stubhub':
        return `https://www.stubhub.com/find/s/?q=${searchTerm}&date=${searchDate}&pid=${this.config.stubhub.affiliateId}`;
      
      case 'seatgeek':
        return `https://seatgeek.com/search?q=${searchTerm}&date=${searchDate}&aid=${this.config.seatgeek.affiliateId}`;
      
      default:
        // Auto-detect best platform or default to Ticketmaster
        return `https://www.ticketmaster.com/search?q=${searchTerm}&daterange=${searchDate}&affiliate=${this.config.ticketmaster.affiliateId}&tracking=${this.config.ticketmaster.trackingCode}`;
    }
  }

  // Track ticket click for analytics
  trackTicketClick(event: Omit<TicketPurchaseEvent, 'timestamp'>): void {
    const trackingEvent: TicketPurchaseEvent = {
      ...event,
      timestamp: new Date()
    };

    // Store in localStorage for analytics
    const existingEvents = this.getStoredEvents();
    existingEvents.push(trackingEvent);
    
    // Keep only last 100 events to avoid storage bloat
    const recentEvents = existingEvents.slice(-100);
    localStorage.setItem('ticket_clicks', JSON.stringify(recentEvents));

    // Send to analytics service (implement based on your choice)
    this.sendToAnalytics(trackingEvent);

    console.log('🎫 Ticket click tracked:', trackingEvent);
  }

  // Get conversion analytics
  getConversionAnalytics(): {
    totalClicks: number;
    clicksByPlatform: Record<string, number>;
    clicksBySource: Record<string, number>;
    recentClicks: TicketPurchaseEvent[];
  } {
    const events = this.getStoredEvents();
    
    const clicksByPlatform = events.reduce((acc, event) => {
      acc[event.platform] = (acc[event.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const clicksBySource = events.reduce((acc, event) => {
      acc[event.conversionSource] = (acc[event.conversionSource] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalClicks: events.length,
      clicksByPlatform,
      clicksBySource,
      recentClicks: events.slice(-10)
    };
  }

  // Enhance existing Ticketmaster URLs with affiliate params
  private enhanceTicketmasterUrl(url: string): string {
    const urlObj = new URL(url);
    urlObj.searchParams.set('affiliate', this.config.ticketmaster.affiliateId);
    urlObj.searchParams.set('tracking', this.config.ticketmaster.trackingCode);
    return urlObj.toString();
  }

  // Enhance existing StubHub URLs with affiliate params
  private enhanceStubHubUrl(url: string): string {
    const urlObj = new URL(url);
    urlObj.searchParams.set('pid', this.config.stubhub.affiliateId);
    return urlObj.toString();
  }

  // Enhance existing SeatGeek URLs with affiliate params
  private enhanceSeatGeekUrl(url: string): string {
    const urlObj = new URL(url);
    urlObj.searchParams.set('aid', this.config.seatgeek.affiliateId);
    return urlObj.toString();
  }

  // Get stored tracking events
  private getStoredEvents(): TicketPurchaseEvent[] {
    try {
      const stored = localStorage.getItem('ticket_clicks');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to parse stored ticket events:', error);
      return [];
    }
  }

  // Send event to analytics service
  private sendToAnalytics(event: TicketPurchaseEvent): void {
    // Implement based on your analytics choice (Google Analytics, Mixpanel, etc.)
    
    // Example: Google Analytics 4
    if ((window as any).gtag) {
      (window as any).gtag('event', 'ticket_click', {
        event_category: 'monetization',
        event_label: event.artistName,
        custom_parameters: {
          artist: event.artistName,
          venue: event.venue,
          platform: event.platform,
          source: event.conversionSource,
          estimated_value: event.estimatedPrice || 'unknown'
        }
      });
    }

    // Example: Mixpanel
    if ((window as any).mixpanel) {
      (window as any).mixpanel.track('Ticket Click', {
        artist: event.artistName,
        venue: event.venue,
        date: event.date,
        platform: event.platform,
        source: event.conversionSource,
        estimated_price: event.estimatedPrice
      });
    }

    // Send to your backend for server-side tracking
    if (process.env.REACT_APP_API_URL) {
      fetch(`${process.env.REACT_APP_API_URL}/api/analytics/ticket-click`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      }).catch(error => {
        console.warn('Failed to send ticket click to backend:', error);
      });
    }
  }

  // Get estimated commission for display purposes
  getEstimatedCommission(priceRange?: string): { min: number; max: number } | null {
    if (!priceRange) return null;

    // Extract price numbers from string like "$45 - $85"
    const prices = priceRange.match(/\$(\d+)/g);
    if (!prices || prices.length === 0) return null;

    const minPrice = parseInt(prices[0].replace('$', ''));
    const maxPrice = prices.length > 1 ? parseInt(prices[1].replace('$', '')) : minPrice;

    // Typical affiliate commission is 3-8%, let's use 5% average
    const commissionRate = 0.05;

    return {
      min: Math.round(minPrice * commissionRate),
      max: Math.round(maxPrice * commissionRate)
    };
  }

  // Clear all tracking data (for privacy compliance)
  clearTrackingData(): void {
    localStorage.removeItem('ticket_clicks');
    console.log('🎫 Ticket tracking data cleared');
  }
}

export default AffiliateService;