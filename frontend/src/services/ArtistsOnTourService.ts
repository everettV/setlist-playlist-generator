// Service to find artists on tour near user based on their Apple Music listening history
import { Artist } from './ClientArtistSearch';
import MusicKitService from './MusicKitService';
import ConcertAPIService from './ConcertAPIService';
import LocationService from './LocationService';

export interface TourDate {
  date: string;
  venue: string;
  city: string;
  distance: number; // miles from user
  ticketUrl?: string;
  priceRange?: string;
  soldOut?: boolean;
}

export interface ArtistOnTour extends Artist {
  tourDates: TourDate[];
  userAffinityScore: number; // 0-100 score based on listening history
  lastPlayed?: string;
  playCount?: number;
  isLiked?: boolean;
  ticketingUrgency?: 'high' | 'medium' | 'low'; // based on show dates and availability
}

export interface UserListeningData {
  likedSongs: any[];
  heavyRotation: any[];
  recentlyPlayed: any[];
  userLocation?: {
    latitude: number;
    longitude: number;
    city: string;
  };
}

export class ArtistsOnTourService {
  private static instance: ArtistsOnTourService;
  private cache: ArtistOnTour[] | null = null;
  private cacheExpiry = 0;
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour

  private constructor() {}

  static getInstance(): ArtistsOnTourService {
    if (!ArtistsOnTourService.instance) {
      ArtistsOnTourService.instance = new ArtistsOnTourService();
    }
    return ArtistsOnTourService.instance;
  }

  // Main method to get artists on tour near user
  async getArtistsOnTourNearby(): Promise<ArtistOnTour[]> {
    // Check cache first
    if (this.cache && Date.now() < this.cacheExpiry) {
      console.log('🎪 Using cached artists on tour');
      return this.cache;
    }

    try {
      console.log('🎪 Finding artists on tour near you...');

      // Step 1: Get user's listening data from Apple Music
      const listeningData = await this.getUserListeningData();
      
      // Step 2: Extract unique artists from listening data
      const userArtists = this.extractUserArtists(listeningData);
      
      // Step 3: Get user's location (mock for now)
      const userLocation = await this.getUserLocation();
      
      // Step 4: Check which artists are on tour nearby
      const artistsOnTour = await this.findArtistsOnTour(userArtists, userLocation);
      
      // Step 5: Calculate affinity scores and sort by conversion likelihood
      const scoredArtists = this.calculateAffinityScores(artistsOnTour, listeningData);
      
      // Step 6: Sort by likelihood to generate playlist/buy tickets
      const sortedArtists = this.sortByConversionLikelihood(scoredArtists);
      
      // Cache the results
      this.cache = sortedArtists;
      this.cacheExpiry = Date.now() + this.CACHE_DURATION;
      
      console.log(`✅ Found ${sortedArtists.length} artists on tour near you`);
      return sortedArtists;
      
    } catch (error) {
      console.error('❌ Failed to get artists on tour:', error);
      return this.getFallbackArtistsOnTour();
    }
  }

  // Get user's Apple Music listening data
  private async getUserListeningData(): Promise<UserListeningData> {
    const musicKit = MusicKitService.getInstance();
    const userToken = musicKit.getUserToken();
    
    if (!userToken) {
      console.log('❌ No user token for listening data');
      return { likedSongs: [], heavyRotation: [], recentlyPlayed: [] };
    }

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const developerTokenResponse = await fetch(`${apiUrl}/api/apple-music/developer-token`);
      const { token: developerToken } = await developerTokenResponse.json();

      // Get multiple data sources to build comprehensive listening profile
      const [likedSongs, heavyRotation, recentlyPlayed] = await Promise.allSettled([
        this.fetchAppleMusicData('https://api.music.apple.com/v1/me/library/songs?limit=50', developerToken, userToken),
        this.fetchAppleMusicData('https://api.music.apple.com/v1/me/history/heavy-rotation', developerToken, userToken),
        this.fetchAppleMusicData('https://api.music.apple.com/v1/me/recent/played/tracks?limit=20', developerToken, userToken)
      ]);

      return {
        likedSongs: likedSongs.status === 'fulfilled' ? likedSongs.value : [],
        heavyRotation: heavyRotation.status === 'fulfilled' ? heavyRotation.value : [],
        recentlyPlayed: recentlyPlayed.status === 'fulfilled' ? recentlyPlayed.value : []
      };
      
    } catch (error) {
      console.error('Failed to get listening data:', error);
      return { likedSongs: [], heavyRotation: [], recentlyPlayed: [] };
    }
  }

  // Helper to fetch Apple Music data
  private async fetchAppleMusicData(url: string, developerToken: string, userToken: string): Promise<any[]> {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${developerToken}`,
        'Music-User-Token': userToken,
        'User-Agent': 'SetlistPlaylistGenerator/1.0'
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data.data || [];
    }
    return [];
  }

  // Extract unique artists from user's listening data
  private extractUserArtists(listeningData: UserListeningData): Map<string, any> {
    const artistMap = new Map();
    
    // Process liked songs (highest weight)
    listeningData.likedSongs.forEach(song => {
      const artistName = song.attributes?.artistName;
      if (artistName && this.isValidArtistName(artistName)) {
        const key = artistName.toLowerCase();
        if (!artistMap.has(key)) {
          artistMap.set(key, {
            name: artistName,
            likedSongs: 0,
            heavyRotation: 0,
            recentlyPlayed: 0,
            artwork: song.attributes?.artwork
          });
        }
        artistMap.get(key).likedSongs++;
      }
    });

    // Process heavy rotation (medium weight)
    listeningData.heavyRotation.forEach(item => {
      const artistName = item.attributes?.artistName;
      if (artistName && this.isValidArtistName(artistName)) {
        const key = artistName.toLowerCase();
        if (!artistMap.has(key)) {
          artistMap.set(key, {
            name: artistName,
            likedSongs: 0,
            heavyRotation: 0,
            recentlyPlayed: 0,
            artwork: item.attributes?.artwork
          });
        }
        artistMap.get(key).heavyRotation++;
      }
    });

    // Process recently played (lower weight)
    listeningData.recentlyPlayed.forEach(track => {
      const artistName = track.attributes?.artistName;
      if (artistName && this.isValidArtistName(artistName)) {
        const key = artistName.toLowerCase();
        if (!artistMap.has(key)) {
          artistMap.set(key, {
            name: artistName,
            likedSongs: 0,
            heavyRotation: 0,
            recentlyPlayed: 0,
            artwork: track.attributes?.artwork
          });
        }
        artistMap.get(key).recentlyPlayed++;
      }
    });

    return artistMap;
  }

  // Validate artist names (filter out invalid entries)
  private isValidArtistName(artistName: string): boolean {
    const normalized = artistName.toLowerCase().trim();
    const invalid = ['unknown artist', 'unknown', 'various artists', ''];
    return !invalid.includes(normalized) && normalized.length >= 2;
  }

  // Get user's location using LocationService
  private async getUserLocation(): Promise<{ latitude: number; longitude: number; city: string }> {
    const locationService = LocationService.getInstance();
    const location = await locationService.getUserLocation();
    return location;
  }

  // Find which artists are on tour nearby (real + mock implementation)
  private async findArtistsOnTour(userArtists: Map<string, any>, userLocation: any): Promise<ArtistOnTour[]> {
    const artistsOnTour: ArtistOnTour[] = [];
    const concertAPI = ConcertAPIService.getInstance();
    const useRealData = process.env.REACT_APP_TICKETMASTER_API_KEY || 
                       process.env.REACT_APP_SONGKICK_API_KEY || 
                       process.env.REACT_APP_BANDSINTOWN_API_KEY;
    
    console.log(`🎪 Using ${useRealData ? 'real' : 'mock'} concert data`);
    
    // Real API data (if API keys are configured)
    if (useRealData) {
      console.log('🎪 Fetching real concert data from APIs...');
      
      for (const [artistKey, artistData] of Array.from(userArtists.entries())) {
        try {
          const realTourDates = await concertAPI.getConcertsForArtist(
            artistData.name, 
            userLocation.latitude, 
            userLocation.longitude
          );
          
          if (realTourDates.length > 0) {
            console.log(`🎪 Found ${realTourDates.length} real shows for ${artistData.name}`);
            
            artistsOnTour.push({
              mbid: `real_tour_${artistKey.replace(/\s+/g, '_')}`,
              name: artistData.name,
              sortName: artistData.name,
              verified: true,
              source: 'apple',
              artwork: artistData.artwork ? {
                url: artistData.artwork.url?.replace('{w}x{h}', '600x600') || '',
                width: 600,
                height: 600
              } : undefined,
              tourDates: realTourDates,
              userAffinityScore: 0, // Will be calculated later
              playCount: artistData.likedSongs + artistData.heavyRotation + artistData.recentlyPlayed,
              isLiked: artistData.likedSongs > 0
            });
          }
        } catch (error) {
          console.error(`Failed to fetch real tour data for ${artistData.name}:`, error);
        }
      }
      
      // If we got real data, return it
      if (artistsOnTour.length > 0) {
        console.log(`🎪 Successfully found ${artistsOnTour.length} artists with real tour data`);
        return artistsOnTour;
      }
      
      console.log('🎪 No real tour data found, falling back to mock data');
    }
    
    // Mock tour data fallback
    const mockTourData = [
      {
        artistName: 'The Beatles',
        tourDates: [
          {
            date: '2024-07-20',
            venue: 'Bill Graham Civic Auditorium',
            city: 'San Francisco, CA',
            distance: 3,
            ticketUrl: 'https://www.ticketmaster.com/the-beatles-celebration-tickets/artist/123456',
            priceRange: '$75 - $200',
            soldOut: false
          }
        ]
      },
      {
        artistName: 'Khruangbin',
        tourDates: [
          {
            date: '2024-08-15',
            venue: 'The Fillmore',
            city: 'San Francisco, CA',
            distance: 2,
            ticketUrl: 'https://www.ticketmaster.com/khruangbin-live-tickets/artist/789012',
            priceRange: '$45 - $85',
            soldOut: false
          }
        ]
      },
      {
        artistName: 'Juniore',
        tourDates: [
          {
            date: '2024-09-05',
            venue: 'The Independent',
            city: 'San Francisco, CA',
            distance: 4,
            ticketUrl: 'https://www.ticketmaster.com/juniore-concert-tickets/artist/345678',
            priceRange: '$35 - $65',
            soldOut: false
          }
        ]
      },
      {
        artistName: 'Stereolab',
        tourDates: [
          {
            date: '2024-07-28',
            venue: 'Warfield Theatre',
            city: 'San Francisco, CA',
            distance: 2,
            ticketUrl: 'https://www.ticketmaster.com/stereolab-tour-tickets/artist/456789',
            priceRange: '$55 - $95',
            soldOut: true
          }
        ]
      },
      {
        artistName: 'Arthur Russell',
        tourDates: [
          {
            date: '2024-08-10',
            venue: 'Great American Music Hall',
            city: 'San Francisco, CA',
            distance: 3,
            ticketUrl: 'https://www.ticketmaster.com/arthur-russell-tribute-tickets/artist/567890',
            priceRange: '$40 - $75',
            soldOut: false
          }
        ]
      },
      {
        artistName: 'Taylor Swift',
        tourDates: [
          {
            date: '2024-07-15',
            venue: 'Levi\'s Stadium',
            city: 'Santa Clara, CA',
            distance: 45,
            ticketUrl: 'https://www.ticketmaster.com/taylor-swift-eras-tour-tickets/artist/678901',
            priceRange: '$85 - $450',
            soldOut: false
          }
        ]
      }
    ];

    // Match user artists with tour data
    console.log('🎪 Matching user artists with tour data...');
    console.log('🎪 User artists:', Array.from(userArtists.keys()));
    console.log('🎪 Available tour artists:', mockTourData.map(t => t.artistName.toLowerCase()));
    
    for (const [artistKey, artistData] of Array.from(userArtists.entries())) {
      const tourInfo = mockTourData.find(tour => 
        tour.artistName.toLowerCase() === artistKey
      );
      
      if (tourInfo) {
        console.log(`🎪 Found match: ${artistData.name} has tour dates!`);
      }

      if (tourInfo) {
        artistsOnTour.push({
          mbid: `tour_${artistKey.replace(/\s+/g, '_')}`,
          name: artistData.name,
          sortName: artistData.name,
          verified: true,
          source: 'apple',
          artwork: artistData.artwork ? {
            url: artistData.artwork.url?.replace('{w}x{h}', '600x600') || '',
            width: 600,
            height: 600
          } : undefined,
          tourDates: tourInfo.tourDates,
          userAffinityScore: 0, // Will be calculated later
          playCount: artistData.likedSongs + artistData.heavyRotation + artistData.recentlyPlayed,
          isLiked: artistData.likedSongs > 0
        });
      }
    }

    return artistsOnTour;
  }

  // Calculate affinity scores based on listening behavior
  private calculateAffinityScores(artists: ArtistOnTour[], listeningData: UserListeningData): ArtistOnTour[] {
    return artists.map(artist => {
      const artistKey = artist.name.toLowerCase();
      
      // Find listening data for this artist
      const likedCount = listeningData.likedSongs.filter(s => 
        s.attributes?.artistName?.toLowerCase() === artistKey
      ).length;
      
      const heavyRotationCount = listeningData.heavyRotation.filter(s => 
        s.attributes?.artistName?.toLowerCase() === artistKey
      ).length;
      
      const recentCount = listeningData.recentlyPlayed.filter(s => 
        s.attributes?.artistName?.toLowerCase() === artistKey
      ).length;

      // Calculate weighted affinity score (0-100)
      const affinityScore = Math.min(100, 
        (likedCount * 10) +           // Liked songs: 10 points each
        (heavyRotationCount * 5) +    // Heavy rotation: 5 points each
        (recentCount * 2)             // Recent plays: 2 points each
      );

      // Determine ticketing urgency
      const soonestShow = artist.tourDates.reduce((soonest, show) => {
        const showDate = new Date(show.date);
        const soonestDate = new Date(soonest.date);
        return showDate < soonestDate ? show : soonest;
      });

      const daysUntilShow = Math.ceil(
        (new Date(soonestShow.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      let ticketingUrgency: 'high' | 'medium' | 'low' = 'low';
      if (daysUntilShow <= 7) ticketingUrgency = 'high';
      else if (daysUntilShow <= 30) ticketingUrgency = 'medium';

      return {
        ...artist,
        userAffinityScore: affinityScore,
        ticketingUrgency
      };
    });
  }

  // Sort by conversion likelihood (playlist generation + ticket purchase)
  private sortByConversionLikelihood(artists: ArtistOnTour[]): ArtistOnTour[] {
    return artists.sort((a, b) => {
      // Calculate conversion score
      const aScore = this.calculateConversionScore(a);
      const bScore = this.calculateConversionScore(b);
      
      return bScore - aScore; // Descending order
    });
  }

  // Calculate likelihood of user taking action (playlist + tickets)
  private calculateConversionScore(artist: ArtistOnTour): number {
    let score = 0;
    
    // Base affinity score (0-100)
    score += artist.userAffinityScore;
    
    // Distance penalty (closer = better)
    const avgDistance = artist.tourDates.reduce((sum, show) => sum + show.distance, 0) / artist.tourDates.length;
    score += Math.max(0, 50 - avgDistance); // Up to 50 bonus points for close shows
    
    // Urgency bonus
    if (artist.ticketingUrgency === 'high') score += 30;
    else if (artist.ticketingUrgency === 'medium') score += 15;
    
    // Availability bonus (available tickets = more likely to convert)
    const availableShows = artist.tourDates.filter(show => !show.soldOut).length;
    score += availableShows * 10;
    
    // Liked songs bonus (strong indicator of engagement)
    if (artist.isLiked) score += 25;
    
    return score;
  }

  // Fallback artists on tour (mock data)
  private getFallbackArtistsOnTour(): ArtistOnTour[] {
    console.log('🎪 Using fallback artists on tour');
    
    return [
      {
        mbid: 'fallback-taylor',
        name: 'Taylor Swift',
        sortName: 'Swift, Taylor',
        verified: true,
        source: 'apple',
        tourDates: [
          {
            date: '2024-07-15',
            venue: 'Levi\'s Stadium',
            city: 'Santa Clara, CA',
            distance: 45,
            priceRange: '$85 - $450'
          }
        ],
        userAffinityScore: 85,
        ticketingUrgency: 'medium',
        isLiked: true
      }
    ];
  }

  // Clear cache
  clearCache(): void {
    this.cache = null;
    this.cacheExpiry = 0;
  }
}

export default ArtistsOnTourService;