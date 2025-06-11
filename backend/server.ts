
app.get('/api/artist/search', async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    console.log('🔍 Searching artists for:', q);
    
    const response = await axios.get(`https://api.setlist.fm/rest/1.0/search/artists`, {
      params: {
        artistName: q.trim(),
        p: 1,
        sort: 'relevance'
      },
      headers: {
        'x-api-key': process.env.SETLISTFM_API_KEY,
        'Accept': 'application/json'
      }
    });

    const artists = response.data.artist || [];
    
    const formattedArtists = artists.slice(0, 10).map((artist: any) => ({
      id: artist.mbid,
      name: artist.name,
      disambiguation: artist.disambiguation || '',
      sortName: artist.sortName || artist.name
    }));

    console.log('✅ Found artists:', formattedArtists.length);
    res.json(formattedArtists);
    
  } catch (error: any) {
    console.error('❌ Artist search failed:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to search artists', 
      message: error.response?.data?.message || error.message 
    });
  }
});

app.get('/api/debug/artist/:name', async (req: Request, res: Response) => {
  try {
    const artistName = req.params.name;
    console.log('🔍 DEBUG: Searching for:', artistName);
    console.log('🔑 API Key present:', !!process.env.SETLISTFM_API_KEY);
    
    const response = await axios.get(`https://api.setlist.fm/rest/1.0/search/artists`, {
      params: {
        artistName: artistName,
        p: 1,
        sort: 'relevance'
      },
      headers: {
        'x-api-key': process.env.SETLISTFM_API_KEY,
        'Accept': 'application/json'
      }
    });

    console.log('📡 Raw Setlist.fm response:', JSON.stringify(response.data, null, 2));
    
    res.json({
      debug: true,
      query: artistName,
      apiKeyPresent: !!process.env.SETLISTFM_API_KEY,
      statusCode: response.status,
      rawResponse: response.data
    });
    
  } catch (error: any) {
    console.error('❌ DEBUG: Full error:', error.response?.data || error.message);
    res.status(500).json({ 
      debug: true,
      error: 'Debug search failed',
      details: error.response?.data || error.message,
      statusCode: error.response?.status
    });
  }
});
