// Simple API service that handles CORS issues better

const getApiUrl = (): string => {
  // For production on Render
  if (window.location.hostname.includes('onrender.com')) {
    return 'https://setlist-playlist-generator-backend-p6bdw.onrender.com';
  }
  
  // For development
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:3001';
  }
  
  // Fallback
  return process.env.REACT_APP_API_URL || 'http://localhost:3001';
};

const apiUrl = getApiUrl();

console.log('🔗 API URL:', apiUrl);

// Simple fetch wrapper with better error handling
const apiCall = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const url = `${apiUrl}${endpoint}`;
  
  console.log(`🌐 Making ${options.method || 'GET'} request to:`, url);
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    mode: 'cors',
    credentials: 'include',
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    console.log(`📡 Response status: ${response.status}`);
    console.log(`📡 Response headers:`, Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error: ${response.status} - ${errorText}`);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`✅ API Success:`, data);
    return data;
  } catch (error: any) {
    console.error(`❌ API Call failed:`, error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error - could not connect to backend');
    }
    
    throw error;
  }
};

export const spotifyApi = {
  getAuthURL: async () => {
    return apiCall('/api/auth/url');
  },
  
  handleCallback: async (code: string) => {
    return apiCall(`/api/auth/callback?code=${encodeURIComponent(code)}`);
  },
};

export const setlistApi = {
  searchSetlists: async (artist: string, limit: number = 10) => {
    return apiCall(`/api/setlist/search?artist=${encodeURIComponent(artist)}&limit=${limit}`);
  },
};

export const playlistApi = {
  createFromSetlist: async (data: any) => {
    return apiCall('/api/playlist/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Test connection function
export const testConnection = async (): Promise<boolean> => {
  try {
    await apiCall('/health');
    return true;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
};

export { apiUrl };