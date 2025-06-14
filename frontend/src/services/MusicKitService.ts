// MusicKit service for real Apple Music authentication
declare global {
  interface Window {
    MusicKit: any;
  }
}

export interface MusicKitConfiguration {
  developerToken: string;
  app: {
    name: string;
    build: string;
  };
}

export interface UserToken {
  token: string;
  expiresAt: number;
}

export class MusicKitService {
  private static instance: MusicKitService;
  private musicKit: any = null;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): MusicKitService {
    if (!MusicKitService.instance) {
      MusicKitService.instance = new MusicKitService();
    }
    return MusicKitService.instance;
  }

  // Load MusicKit JS from Apple's CDN
  private async loadMusicKit(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.MusicKit) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js-cdn.music.apple.com/musickit/v1/musickit.js';
      script.async = true;
      script.onload = () => {
        console.log('✅ MusicKit JS loaded successfully');
        resolve();
      };
      script.onerror = () => {
        console.error('❌ Failed to load MusicKit JS');
        reject(new Error('Failed to load MusicKit JS'));
      };
      
      document.head.appendChild(script);
    });
  }

  // Get developer token from backend
  private async getDeveloperToken(): Promise<string> {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/apple-music/developer-token`);
      
      if (!response.ok) {
        throw new Error(`Failed to get developer token: ${response.status}`);
      }
      
      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error('Failed to get developer token:', error);
      throw error;
    }
  }

  // Initialize MusicKit with proper configuration
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._initialize();
    return this.initPromise;
  }

  private async _initialize(): Promise<void> {
    try {
      console.log('🍎 Initializing MusicKit...');
      
      // Load MusicKit JS
      await this.loadMusicKit();
      
      // Get developer token from backend
      const developerToken = await this.getDeveloperToken();
      console.log('🍎 Developer token obtained');

      // Configure MusicKit
      const config: MusicKitConfiguration = {
        developerToken,
        app: {
          name: 'Concert Recap',
          build: '1.0.0'
        }
      };

      // Initialize MusicKit
      await window.MusicKit.configure(config);
      this.musicKit = window.MusicKit.getInstance();
      
      console.log('✅ MusicKit initialized successfully');
      this.isInitialized = true;

      // Set up event listeners
      this.musicKit.addEventListener('authorizationStatusDidChange', this.handleAuthStatusChange.bind(this));
      this.musicKit.addEventListener('userTokenDidChange', this.handleUserTokenChange.bind(this));
      
    } catch (error) {
      console.error('❌ MusicKit initialization failed:', error);
      this.initPromise = null;
      throw error;
    }
  }

  // Handle authorization status changes
  private handleAuthStatusChange(event: any): void {
    console.log('🍎 Auth status changed:', event.authorizationStatus);
    
    // MusicKit authorization status constants
    const AuthStatus = {
      notDetermined: 0,
      denied: 1,
      restricted: 2,
      authorized: 3
    };
    
    switch (event.authorizationStatus) {
      case AuthStatus.authorized:
        console.log('✅ User is authorized');
        break;
      case AuthStatus.denied:
        console.log('❌ User denied authorization');
        break;
      case AuthStatus.restricted:
        console.log('⚠️ Authorization restricted');
        break;
      case AuthStatus.notDetermined:
        console.log('⏳ Authorization not determined');
        break;
      default:
        console.log('🔄 Unknown authorization status:', event.authorizationStatus);
        break;
    }
  }

  // Handle user token changes
  private handleUserTokenChange(event: any): void {
    console.log('🍎 User token changed');
    
    if (event.userToken) {
      // Store user token in localStorage with expiry
      const userToken: UserToken = {
        token: event.userToken,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      };
      localStorage.setItem('apple_music_user_token', JSON.stringify(userToken));
      console.log('✅ User token stored');
    } else {
      localStorage.removeItem('apple_music_user_token');
      console.log('🗑️ User token removed');
    }
  }

  // Authorize user (request permission)
  async authorize(): Promise<string> {
    try {
      await this.initialize();
      
      console.log('🍎 Requesting user authorization...');
      const userToken = await this.musicKit.authorize();
      
      if (!userToken) {
        throw new Error('Failed to get user token after authorization');
      }
      
      console.log('✅ User authorized successfully');
      return userToken;
      
    } catch (error) {
      console.error('❌ Authorization failed:', error);
      throw error;
    }
  }

  // Get current user token (from localStorage or MusicKit)
  getUserToken(): string | null {
    try {
      // First check localStorage
      const storedToken = localStorage.getItem('apple_music_user_token');
      if (storedToken) {
        const userToken: UserToken = JSON.parse(storedToken);
        
        // Check if token is still valid
        if (userToken.expiresAt > Date.now()) {
          return userToken.token;
        } else {
          // Token expired, remove it
          localStorage.removeItem('apple_music_user_token');
          console.log('🍎 Stored user token expired');
        }
      }

      // Fallback to MusicKit if available
      if (this.musicKit && this.musicKit.isAuthorized) {
        return this.musicKit.userToken;
      }

      return null;
    } catch (error) {
      console.error('Failed to get user token:', error);
      return null;
    }
  }

  // Check if user is currently authorized
  isAuthorized(): boolean {
    try {
      const userToken = this.getUserToken();
      return !!userToken;
    } catch (error) {
      console.error('Failed to check authorization status:', error);
      return false;
    }
  }

  // Sign out user
  async signOut(): Promise<void> {
    try {
      if (this.musicKit) {
        await this.musicKit.unauthorize();
      }
      
      localStorage.removeItem('apple_music_user_token');
      console.log('✅ User signed out successfully');
      
    } catch (error) {
      console.error('❌ Sign out failed:', error);
      throw error;
    }
  }

  // Get authorization status
  getAuthorizationStatus(): number {
    if (!this.musicKit) {
      return 0; // Not determined
    }
    
    return this.musicKit.authorizationStatus || 0;
  }
}

export default MusicKitService;