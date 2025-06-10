let appleMusicService: any = null;

try {
  if (process.env.APPLE_MUSIC_TEAM_ID && process.env.APPLE_MUSIC_KEY_ID && process.env.APPLE_MUSIC_PRIVATE_KEY) {
    // Use dynamic import for TypeScript
    import('./services/appleMusicService').then(({ AppleMusicService }) => {
      appleMusicService = new AppleMusicService();
      console.log('✅ Apple Music service initialized successfully');
    }).catch((error) => {
      console.log('⚠️ Apple Music service failed to initialize:', error);
    });
  } else {
    console.log('⚠️ Apple Music service disabled - missing environment variables');
    console.log('APPLE_MUSIC_TEAM_ID:', !!process.env.APPLE_MUSIC_TEAM_ID);
    console.log('APPLE_MUSIC_KEY_ID:', !!process.env.APPLE_MUSIC_KEY_ID);
    console.log('APPLE_MUSIC_PRIVATE_KEY:', !!process.env.APPLE_MUSIC_PRIVATE_KEY);
  }
} catch (error) {
  console.log('⚠️ Apple Music service failed to initialize:', error);
  appleMusicService = null;
}
