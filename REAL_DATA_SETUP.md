# 🎪 Real Concert Data Setup Guide

This guide explains how to integrate real concert/tour APIs to replace the mock data in the "Nearby Shows" section.

## 🔑 API Options (Choose One or Multiple)

### **Option 1: Ticketmaster Discovery API** (Recommended)
**Pros:** Most comprehensive, reliable, real ticket data  
**Cons:** Requires approval for higher limits  

1. **Sign up:** https://developer.ticketmaster.com/
2. **Get API Key:** Create a new app in your dashboard
3. **Free Tier:** 5,000 API calls/day
4. **Add to `.env`:**
   ```bash
   REACT_APP_TICKETMASTER_API_KEY=your_ticketmaster_api_key_here
   ```

### **Option 2: Songkick API**
**Pros:** Good indie/alternative artist coverage  
**Cons:** Limited mainstream coverage  

1. **Sign up:** https://www.songkick.com/developer
2. **Get API Key:** Apply for developer access
3. **Add to `.env`:**
   ```bash
   REACT_APP_SONGKICK_API_KEY=your_songkick_api_key_here
   ```

### **Option 3: Bandsintown API**
**Pros:** Great for emerging artists, easy approval  
**Cons:** Smaller venue coverage  

1. **Sign up:** https://www.bandsintown.com/api/overview
2. **Get API Key:** Register your app
3. **Add to `.env`:**
   ```bash
   REACT_APP_BANDSINTOWN_API_KEY=your_bandsintown_api_key_here
   ```

## 📍 Location Services Setup

### **Option 1: Browser Geolocation** (Already Implemented)
- Uses browser's built-in location API
- Prompts user for permission
- Free, no setup required

### **Option 2: Google Maps API** (Optional Enhancement)
1. **Get API Key:** https://developers.google.com/maps/documentation/javascript/get-api-key
2. **Enable APIs:** Geocoding API, Places API
3. **Add to `.env`:**
   ```bash
   REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   ```

## 🚀 Quick Start (Recommended)

### **Step 1: Get a Ticketmaster API Key**
1. Go to https://developer.ticketmaster.com/
2. Click "Get Your API Key"
3. Fill out the application (usually approved instantly)
4. Copy your Consumer Key

### **Step 2: Configure Environment**
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your API key:
   ```bash
   REACT_APP_TICKETMASTER_API_KEY=your_actual_api_key_here
   ```

### **Step 3: Test Real Data**
1. Restart your development server:
   ```bash
   npm start
   ```

2. Click "🎪 Refresh Nearby Shows" button
3. Check console for "🎪 Using real concert data"
4. You should see real concerts for artists in your Apple Music library!

## 🔧 How It Works

The system uses a **hybrid approach**:

1. **Real Data First:** If API keys are configured, fetches real concert data
2. **Mock Data Fallback:** If no API keys or no real data found, uses mock data
3. **Multiple APIs:** Combines results from all configured APIs
4. **Deduplication:** Removes duplicate events from different sources
5. **Distance Filtering:** Only shows concerts within reasonable distance

## 📊 What You'll Get

With real data integration, you'll see:

- **Actual concert dates** for artists in your Apple Music library
- **Real venues** and locations
- **Ticket availability** and pricing (where available)
- **Distance calculations** from your location
- **Multiple show options** per artist

## 🎯 Example Real Data Flow

1. **User Location:** "San Francisco, CA"
2. **Apple Music Artists:** ["Khruangbin", "Tame Impala", "Glass Animals"]
3. **API Calls:** 
   - Ticketmaster search for "Khruangbin near San Francisco"
   - Songkick search for "Tame Impala concerts"
   - Bandsintown search for "Glass Animals events"
4. **Results:** Real upcoming shows with actual venues and dates

## 🛠️ Troubleshooting

### **No Real Data Appearing?**
- Check console for "🎪 Using real concert data" message
- Verify API keys are correctly set in `.env`
- Restart development server after adding keys
- Check API quotas/limits

### **API Errors?**
- Verify API keys are valid
- Check if you've exceeded rate limits
- Some APIs require domain approval

### **Location Issues?**
- Allow location permission in browser
- Check console for location coordinates
- Falls back to San Francisco if location fails

## 💡 Next Steps

Once real data is working:

1. **Cache Management:** Implement smarter caching for API calls
2. **Error Handling:** Add user-friendly error messages
3. **Filtering Options:** Add distance/date filters
4. **Ticket Integration:** Direct ticket purchase links
5. **Notifications:** Alert users about new shows

## 🔒 Security Notes

- **Never commit API keys** to version control
- **Use environment variables** for all sensitive data
- **Respect API rate limits** to avoid being blocked
- **Consider backend proxy** for production to hide API keys

---

**Need Help?** The system is designed to work with mock data by default, so you can develop and test without API keys. Real data integration is optional but provides the full concert discovery experience!