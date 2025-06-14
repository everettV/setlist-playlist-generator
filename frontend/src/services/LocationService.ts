// User location service for proximity-based concert recommendations
export interface UserLocation {
  latitude: number;
  longitude: number;
  city: string;
  accuracy?: number;
}

export class LocationService {
  private static instance: LocationService;
  private cachedLocation: UserLocation | null = null;
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour
  private cacheExpiry = 0;

  private constructor() {}

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  // Get user's current location
  async getUserLocation(): Promise<UserLocation> {
    // Check cache first
    if (this.cachedLocation && Date.now() < this.cacheExpiry) {
      console.log('📍 Using cached location');
      return this.cachedLocation;
    }

    try {
      // Try to get user's actual location
      const position = await this.getCurrentPosition();
      const location: UserLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        city: await this.getCityFromCoordinates(position.coords.latitude, position.coords.longitude),
        accuracy: position.coords.accuracy
      };

      // Cache the location
      this.cachedLocation = location;
      this.cacheExpiry = Date.now() + this.CACHE_DURATION;

      console.log('📍 Got user location:', location);
      return location;

    } catch (error) {
      console.warn('📍 Could not get user location, using fallback:', error);
      return this.getFallbackLocation();
    }
  }

  // Request user's current position using Geolocation API
  private getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000, // 10 seconds
        maximumAge: 5 * 60 * 1000 // 5 minutes
      };

      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        options
      );
    });
  }

  // Convert coordinates to city name using reverse geocoding
  private async getCityFromCoordinates(latitude: number, longitude: number): Promise<string> {
    try {
      // Using a free geocoding service (you can replace with Google Maps API if you have a key)
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );

      if (response.ok) {
        const data = await response.json();
        const city = data.city || data.locality || 'Unknown City';
        const region = data.principalSubdivision || '';
        return region ? `${city}, ${region}` : city;
      }
    } catch (error) {
      console.warn('Failed to get city from coordinates:', error);
    }

    return 'Unknown Location';
  }

  // Fallback location (San Francisco Bay Area)
  private getFallbackLocation(): UserLocation {
    return {
      latitude: 37.7749,
      longitude: -122.4194,
      city: 'San Francisco, CA'
    };
  }

  // Request permission for location access
  async requestLocationPermission(): Promise<boolean> {
    try {
      if (!navigator.geolocation) {
        return false;
      }

      // Check current permission status
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        
        if (permission.state === 'granted') {
          return true;
        } else if (permission.state === 'denied') {
          return false;
        }
      }

      // Try to get position to trigger permission prompt
      await this.getCurrentPosition();
      return true;

    } catch (error) {
      console.warn('Location permission denied:', error);
      return false;
    }
  }

  // Clear cached location
  clearCache(): void {
    this.cachedLocation = null;
    this.cacheExpiry = 0;
  }

  // Calculate distance between two points
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

export default LocationService;