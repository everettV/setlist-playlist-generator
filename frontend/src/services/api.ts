import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const spotifyApi = {
  getAuthURL: () => api.get('/auth/url'),
  handleCallback: (code: string) => 
    api.get(`/auth/callback?code=${code}`),
};

export const setlistApi = {
  searchSetlists: (artist: string, limit: number = 10) =>
    api.get(`/setlist/search?artist=${encodeURIComponent(artist)}&limit=${limit}`),
};

export const playlistApi = {
  createFromSetlist: (data: any) =>
    api.post('/playlist/create', data),
};

export default api;