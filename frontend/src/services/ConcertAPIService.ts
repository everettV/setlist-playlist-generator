// Real concert/tour data integration service
import { TourDate } from './ArtistsOnTourService';

export interface TicketmasterEvent {
  id: string;
  name: string;
  dates: {
    start: {
      localDate: string;
      localTime?: string;
    };
  };
  _embedded?: {
    venues?: Array<{
      name: string;
      city: {
        name: string;
      };
      state: {
        stateCode: string;
      };
      location?: {
        latitude: string;
        longitude: string;
      };
    }>;
    attractions?: Array<{
      name: string;
    }>;
  };
  priceRanges?: Array<{
    min: number;
    max: number;
    currency: string;
  }>;
  sales?: {
    public?: {
      startDateTime?: string;
      endDateTime?: string;
    };
  };
  url?: string;
}

export interface SongkickEvent {
  id: number;
  displayName: string;
  start: {
    date: string;
    time?: string;
  };
  venue: {
    displayName: string;
    lat?: number;
    lng?: number;
  };
  location: {
    city: string;
  };
  uri?: string;
}

export interface BandsinTownEvent {
  id: string;
  datetime: string;
  venue: {
    name: string;
    city: string;
    region: string;
    latitude?: string;
    longitude?: string;
  };
  offers?: Array<{
    type: string;
    url: string;
    status: string;
  }>;
  url?: string;
}

export class ConcertAPIService {
  private static instance: ConcertAPIService;
  private readonly TICKETMASTER_API_KEY = process.env.REACT_APP_TICKETMASTER_API_KEY;
  private readonly SONGKICK_API_KEY = process.env.REACT_APP_SONGKICK_API_KEY;
  private readonly BANDSINTOWN_API_KEY = process.env.REACT_APP_BANDSINTOWN_API_KEY;
  
  private constructor() {}

  static getInstance(): ConcertAPIService {
    if (!ConcertAPIService.instance) {
      ConcertAPIService.instance = new ConcertAPIService();
    }
    return ConcertAPIService.instance;
  }

  // Get concerts for an artist using Ticketmaster API
  async getTicketmasterEvents(artistName: string, latitude: number, longitude: number, radius: number = 50): Promise<TourDate[]> {
    if (!this.TICKETMASTER_API_KEY) {
      console.warn('⚠️ Ticketmaster API key not configured');
      return [];
    }

    try {
      const params = new URLSearchParams({
        apikey: this.TICKETMASTER_API_KEY,
        keyword: artistName,
        latlong: `${latitude},${longitude}`,
        radius: radius.toString(),
        unit: 'miles',
        locale: '*',
        size: '20',
        sort: 'date,asc'
      });

      const response = await fetch(`https://app.ticketmaster.com/discovery/v2/events.json?${params}`);
      
      if (!response.ok) {
        throw new Error(`Ticketmaster API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseTicketmasterEvents(data._embedded?.events || []);
      
    } catch (error) {
      console.error('Failed to fetch Ticketmaster events:', error);
      return [];
    }
  }

  // Get concerts using Songkick API
  async getSongkickEvents(artistName: string, latitude: number, longitude: number): Promise<TourDate[]> {
    if (!this.SONGKICK_API_KEY) {
      console.warn('⚠️ Songkick API key not configured');
      return [];
    }

    try {
      // First, search for the artist
      const artistResponse = await fetch(
        `https://api.songkick.com/api/3.0/search/artists.json?apikey=${this.SONGKICK_API_KEY}&query=${encodeURIComponent(artistName)}`
      );
      
      if (!artistResponse.ok) {
        throw new Error(`Songkick artist search error: ${artistResponse.status}`);
      }

      const artistData = await artistResponse.json();
      const artist = artistData.resultsPage?.results?.artist?.[0];
      
      if (!artist) {
        console.log(`🎪 No Songkick artist found for: ${artistName}`);
        return [];
      }

      // Get events for the artist
      const eventsResponse = await fetch(
        `https://api.songkick.com/api/3.0/artists/${artist.id}/calendar.json?apikey=${this.SONGKICK_API_KEY}`
      );

      if (!eventsResponse.ok) {
        throw new Error(`Songkick events error: ${eventsResponse.status}`);
      }

      const eventsData = await eventsResponse.json();
      const events = eventsData.resultsPage?.results?.event || [];
      
      return this.parseSongkickEvents(events, latitude, longitude);
      
    } catch (error) {
      console.error('Failed to fetch Songkick events:', error);
      return [];
    }
  }

  // Get concerts using Bandsintown API
  async getBandsinTownEvents(artistName: string): Promise<TourDate[]> {
    if (!this.BANDSINTOWN_API_KEY) {
      console.warn('⚠️ Bandsintown API key not configured');
      return [];
    }

    try {
      const response = await fetch(
        `https://rest.bandsintown.com/artists/${encodeURIComponent(artistName)}/events?app_id=${this.BANDSINTOWN_API_KEY}&date=upcoming`
      );

      if (!response.ok) {
        throw new Error(`Bandsintown API error: ${response.status}`);
      }

      const events: BandsinTownEvent[] = await response.json();
      return this.parseBandsinTownEvents(events);
      
    } catch (error) {
      console.error('Failed to fetch Bandsintown events:', error);
      return [];
    }
  }

  // Combine all APIs for comprehensive results
  async getConcertsForArtist(artistName: string, userLatitude: number, userLongitude: number): Promise<TourDate[]> {
    console.log(`🎪 Fetching real concert data for: ${artistName}`);
    
    const [ticketmasterEvents, songkickEvents, bandsinTownEvents] = await Promise.allSettled([
      this.getTicketmasterEvents(artistName, userLatitude, userLongitude),
      this.getSongkickEvents(artistName, userLatitude, userLongitude),
      this.getBandsinTownEvents(artistName)
    ]);

    const allEvents: TourDate[] = [];

    // Combine results from all APIs
    if (ticketmasterEvents.status === 'fulfilled') {
      allEvents.push(...ticketmasterEvents.value);
    }
    if (songkickEvents.status === 'fulfilled') {
      allEvents.push(...songkickEvents.value);
    }
    if (bandsinTownEvents.status === 'fulfilled') {
      allEvents.push(...bandsinTownEvents.value);
    }

    // Remove duplicates and sort by date
    const uniqueEvents = this.removeDuplicateEvents(allEvents);
    return uniqueEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  // Parse Ticketmaster events
  private parseTicketmasterEvents(events: TicketmasterEvent[]): TourDate[] {
    return events.map(event => {
      const venue = event._embedded?.venues?.[0];
      const priceRange = event.priceRanges?.[0];
      
      // Calculate distance (simplified - in real app would use proper geolocation)
      const distance = venue?.location ? 
        this.calculateDistance(37.7749, -122.4194, parseFloat(venue.location.latitude), parseFloat(venue.location.longitude)) : 
        Math.random() * 100; // Fallback for demo

      return {
        date: event.dates.start.localDate,
        venue: venue?.name || 'Unknown Venue',
        city: venue ? `${venue.city.name}, ${venue.state.stateCode}` : 'Unknown City',
        distance: Math.round(distance),
        ticketUrl: event.url,
        priceRange: priceRange ? `$${priceRange.min} - $${priceRange.max}` : undefined,
        soldOut: event.sales?.public?.endDateTime ? new Date(event.sales.public.endDateTime) < new Date() : false
      };
    });
  }

  // Parse Songkick events
  private parseSongkickEvents(events: SongkickEvent[], userLat: number, userLng: number): TourDate[] {
    return events
      .filter(event => event.venue.lat && event.venue.lng) // Only events with location data
      .map(event => {
        const distance = this.calculateDistance(userLat, userLng, event.venue.lat!, event.venue.lng!);
        
        return {
          date: event.start.date,
          venue: event.venue.displayName,
          city: event.location.city,
          distance: Math.round(distance),
          ticketUrl: event.uri,
          soldOut: false // Songkick doesn't provide sold out status easily
        };
      })
      .filter(event => event.distance <= 100); // Filter to nearby events
  }

  // Parse Bandsintown events
  private parseBandsinTownEvents(events: BandsinTownEvent[]): TourDate[] {
    return events.map(event => {
      const distance = event.venue.latitude && event.venue.longitude ?
        this.calculateDistance(37.7749, -122.4194, parseFloat(event.venue.latitude), parseFloat(event.venue.longitude)) :
        Math.random() * 100; // Fallback for demo

      return {
        date: event.datetime.split('T')[0], // Extract date part
        venue: event.venue.name,
        city: `${event.venue.city}, ${event.venue.region}`,
        distance: Math.round(distance),
        ticketUrl: event.url,
        soldOut: event.offers?.some(offer => offer.status === 'unavailable') || false
      };
    });
  }

  // Remove duplicate events (same date/venue)
  private removeDuplicateEvents(events: TourDate[]): TourDate[] {
    const seen = new Set<string>();
    return events.filter(event => {
      const key = `${event.date}-${event.venue}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  // Calculate distance between two coordinates (Haversine formula)
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
}

export default ConcertAPIService;