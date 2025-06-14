import ReactGA from 'react-ga4';
import Cookies from 'js-cookie';

interface ConsentPreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  lastUpdated: string;
}

interface AffiliateClickEvent {
  partner: string;
  product_type: 'ticket' | 'hotel' | 'flight' | 'merch' | 'dining';
  artist?: string;
  venue?: string;
  price_range?: string;
  user_id?: string;
}

interface PlaylistCreateEvent {
  platform: 'spotify' | 'apple';
  artist: string;
  venue: string;
  song_count: number;
  songs_found: number;
  conversion_source?: string;
}

class AnalyticsManager {
  private initialized = false;
  private consent: ConsentPreferences | null = null;

  constructor() {
    this.loadConsent();
  }

  private loadConsent(): ConsentPreferences | null {
    try {
      const consentCookie = Cookies.get('cookie-consent');
      if (consentCookie) {
        this.consent = JSON.parse(consentCookie);
        return this.consent;
      }
    } catch (error) {
      console.error('Error loading consent preferences:', error);
    }
    return null;
  }

  public initialize(measurementId: string) {
    if (this.initialized) return;

    const consent = this.loadConsent();
    if (!consent?.analytics) {
      console.log('Analytics disabled by user consent');
      return;
    }

    try {
      ReactGA.initialize(measurementId, {
        gtagOptions: {
          anonymize_ip: true,
          cookie_flags: 'secure;samesite=strict',
        }
      });
      
      this.initialized = true;
      console.log('Analytics initialized');
    } catch (error) {
      console.error('Analytics initialization failed:', error);
    }
  }

  public updateConsent(newConsent: ConsentPreferences) {
    this.consent = newConsent;
    
    if (!newConsent.analytics && this.initialized) {
      // Disable analytics if consent withdrawn
      this.initialized = false;
      console.log('Analytics disabled by user');
    } else if (newConsent.analytics && !this.initialized) {
      // Re-initialize if consent given
      const measurementId = process.env.REACT_APP_GA_MEASUREMENT_ID;
      if (measurementId) {
        this.initialize(measurementId);
      }
    }
  }

  private canTrack(type: 'analytics' | 'marketing'): boolean {
    return this.consent?.[type] === true;
  }

  // Page view tracking
  public trackPageView(path: string, title?: string) {
    if (!this.canTrack('analytics') || !this.initialized) return;

    ReactGA.send({
      hitType: 'pageview',
      page: path,
      title: title
    });
  }

  // Core user flow events
  public trackArtistSearch(query: string, resultsCount: number) {
    if (!this.canTrack('analytics') || !this.initialized) return;

    ReactGA.event({
      category: 'User Engagement',
      action: 'artist_search',
      label: query,
      value: resultsCount
    });
  }

  public trackSetlistView(artist: string, venue: string, date?: string) {
    if (!this.canTrack('analytics') || !this.initialized) return;

    ReactGA.event('setlist_view', {
      category: 'Content Engagement',
      artist: artist,
      venue: venue,
      date: date
    });
  }

  public trackPlaylistCreate(data: PlaylistCreateEvent) {
    if (!this.canTrack('analytics') || !this.initialized) return;

    ReactGA.event('playlist_create', {
      category: 'Conversion',
      value: data.song_count,
      platform: data.platform,
      artist: data.artist,
      venue: data.venue,
      song_count: data.song_count,
      songs_found: data.songs_found,
      conversion_rate: (data.songs_found / data.song_count) * 100
    });
  }

  // Affiliate marketing events
  public trackAffiliateClick(data: AffiliateClickEvent) {
    // Analytics tracking (if consent given)
    if (this.canTrack('analytics') && this.initialized) {
      ReactGA.event('affiliate_click', {
        category: 'Affiliate',
        partner: data.partner,
        product_type: data.product_type,
        artist: data.artist,
        venue: data.venue,
        price_range: data.price_range
      });
    }

    // Marketing tracking (requires separate consent)
    if (this.canTrack('marketing')) {
      this.sendAffiliatePixel(data);
    }
  }

  private sendAffiliatePixel(data: AffiliateClickEvent) {
    // Send data to affiliate partners for attribution
    if (data.partner === 'vivid_seats') {
      // Vivid Seats tracking pixel
      const pixelUrl = `https://partner.vivid-seats.com/pixel?event=click&product=${data.product_type}&artist=${encodeURIComponent(data.artist || '')}`;
      this.sendPixel(pixelUrl);
    }
  }

  private sendPixel(url: string) {
    const img = new Image();
    img.src = url;
    // Image will automatically fire the pixel when src is set
  }

  public trackTicketPurchase(
    partner: string, 
    artist: string, 
    price: number, 
    commission: number
  ) {
    if (!this.canTrack('marketing')) return;

    // Enhanced ecommerce tracking for affiliate revenue
    if (this.initialized) {
      ReactGA.event('purchase', {
        category: 'Ecommerce',
        value: commission,
        partner: partner,
        artist: artist,
        ticket_price: price,
        commission_amount: commission,
        currency: 'USD'
      });
    }

    // Partner-specific conversion tracking
    this.sendConversionPixel(partner, price, commission);
  }

  private sendConversionPixel(partner: string, price: number, commission: number) {
    if (partner === 'vivid_seats') {
      const conversionUrl = `https://partner.vivid-seats.com/pixel?event=conversion&price=${price}&commission=${commission}`;
      this.sendPixel(conversionUrl);
    }
  }

  // User engagement metrics
  public trackTimeOnSite(seconds: number) {
    if (!this.canTrack('analytics') || !this.initialized) return;

    ReactGA.event({
      category: 'User Engagement',
      action: 'time_on_site',
      value: Math.round(seconds)
    });
  }

  public trackScrollDepth(percentage: number) {
    if (!this.canTrack('analytics') || !this.initialized) return;

    ReactGA.event({
      category: 'User Engagement',
      action: 'scroll_depth',
      value: percentage
    });
  }

  // Error tracking
  public trackError(error: string, fatal: boolean = false) {
    if (!this.canTrack('analytics') || !this.initialized) return;

    ReactGA.event(fatal ? 'fatal_error' : 'error', {
      category: 'Error',
      error_message: error,
      fatal: fatal
    });
  }

  // Custom user identification (GDPR compliant)
  public setUserId(userId: string) {
    if (!this.canTrack('analytics') || !this.initialized) return;

    ReactGA.set({ user_id: userId });
  }

  // Performance monitoring
  public trackPerformance(metric: string, value: number) {
    if (!this.canTrack('analytics') || !this.initialized) return;

    ReactGA.event({
      category: 'Performance',
      action: metric,
      value: Math.round(value)
    });
  }
}

// Singleton instance
export const analytics = new AnalyticsManager();

// Convenience functions for common tracking patterns
export const trackAffiliateRevenue = (
  partner: string, 
  productType: string, 
  revenue: number
) => {
  analytics.trackTicketPurchase(partner, productType, revenue, revenue * 0.06); // 6% commission
};

export const initializeAnalytics = () => {
  const measurementId = process.env.REACT_APP_GA_MEASUREMENT_ID;
  if (measurementId) {
    analytics.initialize(measurementId);
  } else {
    console.warn('GA_MEASUREMENT_ID not found in environment variables');
  }
};

export default analytics;