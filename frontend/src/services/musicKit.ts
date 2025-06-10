declare global {
  interface Window {
    MusicKit: any;
  }
}

export class MusicKitService {
  private musicKitInstance: any = null;
  private isInitialized: boolean = false;

  async initialize(developerToken: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.MusicKit) {
        this.initializeMusicKit(developerToken).then(resolve).catch(reject);
        return;
      }

      const checkMusicKit = () => {
        if (window.MusicKit) {
          this.initializeMusicKit(developerToken).then(resolve).catch(reject);
        } else {
          setTimeout(checkMusicKit, 100);
        }
      };

      checkMusicKit();
    });
  }

  private async initializeMusicKit(developerToken: string): Promise<void> {
    if (this.isInitialized) {
      console.log('🍎 MusicKit already initialized');
      return;
    }

    try {
      console.log('🍎 Configuring MusicKit...');
      
      await window.MusicKit.configure({
        developerToken,
        app: {
          name: 'Setlist Playlist Generator',
          build: '1.0.0',
        },
        debug: process.env.NODE_ENV === 'development',
      });

      this.musicKitInstance = window.MusicKit.getInstance();
      this.isInitialized = true;
      
      console.log('✅ MusicKit configured successfully');
      
      if (this.musicKitInstance.isAuthorized) {
        console.log('✅ User already authorized with Apple Music');
      }
      
    } catch (error) {
      console.error('❌ Failed to configure MusicKit:', error);
      throw new Error(`MusicKit configuration failed: ${error}`);
    }
  }

  async authorize(): Promise<string> {
    if (!this.musicKitInstance) {
      throw new Error('MusicKit not initialized. Call initialize() first.');
    }

    try {
      console.log('🍎 Requesting Apple Music authorization...');
      
      const userToken = await this.musicKitInstance.authorize();
      
      if (!userToken) {
        throw new Error('Authorization failed - no user token received');
      }
      
      console.log('✅ Apple Music authorization successful');
      return userToken;
      
    } catch (error: any) {
      console.error('❌ Apple Music authorization failed:', error);
      
      if (error.errorCode === 'USER_CANCEL') {
        throw new Error('Authorization was cancelled by user');
      } else if (error.errorCode === 'SUBSCRIPTION_REQUIRED') {
        throw new Error('Apple Music subscription required');
      }
      
      throw new Error(`Authorization failed: ${error.message || error}`);
    }
  }

  isAuthorized(): boolean {
    return this.musicKitInstance?.isAuthorized || false;
  }

  getUserToken(): string | null {
    return this.musicKitInstance?.musicUserToken || null;
  }

  signOut(): void {
    if (this.musicKitInstance) {
      try {
        console.log('🍎 Signing out of Apple Music...');
        this.musicKitInstance.unauthorize();
        console.log('✅ Signed out of Apple Music');
      } catch (error) {
        console.error('❌ Error signing out:', error);
      }
    }
  }

  static isMusicKitLoaded(): boolean {
    return typeof window !== 'undefined' && !!window.MusicKit;
  }

  static async loadMusicKit(): Promise<void> {
    if (this.isMusicKitLoaded()) {
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://js-cdn.music.apple.com/musickit/v1/musickit.js';
      script.async = true;
      
      script.onload = () => {
        console.log('✅ MusicKit script loaded');
        resolve();
      };
      
      script.onerror = () => {
        console.error('❌ Failed to load MusicKit script');
        reject(new Error('Failed to load MusicKit script'));
      };
      
      document.head.appendChild(script);
    });
  }
}
