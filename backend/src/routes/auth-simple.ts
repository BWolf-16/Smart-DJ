import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { asyncHandler } from '../middleware/asyncHandler';
import { sessionStore } from '../services/sessionStore';
import { aiService } from '../services/aiService';
import { spotifyController } from '../services/spotifyController';
import { logger } from '../utils/logger';

interface AuthenticatedRequest extends Request {
  user?: any;
}

const router = Router();

// Spotify OAuth routes
router.get('/spotify', passport.authenticate('spotify', {
  scope: [
    'user-read-email',
    'user-read-private', 
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'user-read-recently-played',
    'user-top-read',
    'playlist-read-private',
    'playlist-read-collaborative',
    'playlist-modify-public',
    'playlist-modify-private',
    'user-library-read',
    'user-library-modify'
  ]
}));

router.get('/callback', 
  passport.authenticate('spotify', { 
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=spotify_failed`,
    session: false
  }),
  (req: any, res: any) => {
    try {
      console.log('✅ Spotify callback successful for user:', req.user?.displayName);
      
      // Store session with Spotify tokens
      sessionStore.setSession(req.user.id, {
        accessToken: req.user.spotifyAccessToken,
        refreshToken: req.user.spotifyRefreshToken,
        expiresAt: req.user.spotifyTokenExpiry || new Date(Date.now() + 3600 * 1000), // 1 hour default
        profile: req.user
      });
      
      // Generate simple JWT token (without tokens for security)
      const token = jwt.sign(
        { 
          userId: req.user.id,
          email: req.user.email,
          displayName: req.user.displayName
        },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      console.log('✅ JWT token generated and session stored, sending success page');

      // Create a simple HTML page with immediate redirect
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Smart DJ - Authentication Success</title>
          <meta http-equiv="refresh" content="2;url=${process.env.FRONTEND_URL}/dashboard">
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            .container { max-width: 400px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #1db954; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 20px auto; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            button { margin-top: 20px; padding: 10px 20px; background: #1db954; color: white; border: none; border-radius: 5px; cursor: pointer; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>🎵 Authentication Successful!</h2>
            <div class="spinner"></div>
            <p>Redirecting to Smart DJ...</p>
            <button onclick="window.location.href='${process.env.FRONTEND_URL}/dashboard'">
              Continue to Dashboard
            </button>
          </div>
        </body>
        </html>
      `;
      
      // Store the token in a way the frontend can access it
      res.cookie('authToken', token, { 
        httpOnly: false, 
        secure: false, 
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      res.send(html);
    } catch (error) {
      console.error('❌ Callback error:', error);
      res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>Smart DJ - Authentication Error</title></head>
        <body>
          <h2>❌ Authentication Failed</h2>
          <p>There was an error during authentication. Redirecting back...</p>
          <script>
            setTimeout(() => {
              window.location.href = '${process.env.FRONTEND_URL}/?error=callback_failed';
            }, 2000);
          </script>
        </body>
        </html>
      `);
    }
  }
);

// Test endpoint to verify Spotify profile access
router.get('/spotify/profile', asyncHandler(async (req: any, res: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'NO_TOKEN',
        message: 'No authentication token provided'
      }
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Get session from store
    const session = sessionStore.getSession(decoded.userId);
    
    if (!session) {
      console.log('⚠️ No valid session found, user needs to re-authenticate');
      return res.json({
        success: true,
        data: {
          user: {
            id: decoded.userId,
            email: decoded.email,
            displayName: decoded.displayName,
            spotifyProfile: {
              display_name: decoded.displayName,
              email: decoded.email,
              followers: { total: 0 },
              images: [{ url: 'https://via.placeholder.com/150' }],
              id: decoded.userId
            }
          },
          spotify: {
            playlists: [],
            topTracks: [],
            recentTracks: [],
            connected: false,
            message: 'Please re-authenticate with Spotify to load your real data'
          }
        }
      });
    }

    console.log('🎵 Fetching real Spotify data for:', decoded.displayName);
    
    // Fetch user profile from Spotify
    const profileResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      }
    });

    if (!profileResponse.ok) {
      throw new Error(`Spotify API error: ${profileResponse.status}`);
    }

    const spotifyProfile = await profileResponse.json();
    
    // Fetch user's playlists
    const playlistsResponse = await fetch('https://api.spotify.com/v1/me/playlists?limit=20', {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      }
    });

    const playlistsData = playlistsResponse.ok ? await playlistsResponse.json() : { items: [] };
    
    // Fetch user's top tracks
    const topTracksResponse = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=10&time_range=medium_term', {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      }
    });

    const topTracksData = topTracksResponse.ok ? await topTracksResponse.json() : { items: [] };

    // Fetch recently played tracks
    const recentResponse = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=10', {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      }
    });

    const recentData = recentResponse.ok ? await recentResponse.json() : { items: [] };

    console.log(`✅ Fetched REAL Spotify data: ${playlistsData.items?.length || 0} playlists, ${topTracksData.items?.length || 0} top tracks, ${recentData.items?.length || 0} recent tracks`);

    res.json({
      success: true,
      data: {
        user: {
          id: decoded.userId,
          email: decoded.email,
          displayName: decoded.displayName,
          spotifyProfile: {
            display_name: spotifyProfile.display_name,
            email: spotifyProfile.email,
            followers: spotifyProfile.followers,
            images: spotifyProfile.images,
            id: spotifyProfile.id,
            country: spotifyProfile.country,
            product: spotifyProfile.product
          }
        },
        spotify: {
          playlists: playlistsData.items || [],
          topTracks: topTracksData.items || [],
          recentTracks: recentData.items || [],
          connected: true
        }
      }
    });

  } catch (error) {
    console.error('JWT verification error:', error);
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token'
      }
    });
  }
}));

// AI Chat endpoint - REAL OpenAI integration
router.post('/ai/chat', asyncHandler(async (req: any, res: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const { message } = req.body;
  
  if (!token || !message) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_DATA', message: 'Token and message required' }
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const session = sessionStore.getSession(decoded.userId);
    
    if (!session) {
      return res.status(401).json({
        success: false,
        error: { code: 'NO_SESSION', message: 'Please re-authenticate with Spotify' }
      });
    }

    console.log('🤖 Processing AI chat request from:', decoded.displayName);
    console.log('💬 User message:', message);

    // Get user's current Spotify data for AI context
    const [profileRes, playlistsRes, topTracksRes, recentRes] = await Promise.all([
      fetch('https://api.spotify.com/v1/me', {
        headers: { 'Authorization': `Bearer ${session.accessToken}` }
      }),
      fetch('https://api.spotify.com/v1/me/playlists?limit=20', {
        headers: { 'Authorization': `Bearer ${session.accessToken}` }
      }),
      fetch('https://api.spotify.com/v1/me/top/tracks?limit=10&time_range=medium_term', {
        headers: { 'Authorization': `Bearer ${session.accessToken}` }
      }),
      fetch('https://api.spotify.com/v1/me/player/recently-played?limit=10', {
        headers: { 'Authorization': `Bearer ${session.accessToken}` }
      })
    ]);

    const userProfile = profileRes.ok ? await profileRes.json() : {};
    const userPlaylists = playlistsRes.ok ? (await playlistsRes.json()).items || [] : [];
    const userTopTracks = topTracksRes.ok ? (await topTracksRes.json()).items || [] : [];
    const recentTracks = recentRes.ok ? (await recentRes.json()).items || [] : [];

    // Call AI service with real data
    const aiResponse = await aiService.processUserRequest({
      message,
      spotifyAccessToken: session.accessToken,
      userProfile,
      userPlaylists,
      userTopTracks,
      recentTracks
    });

    console.log('🎵 AI response generated with', aiResponse.spotifyResults?.length || 0, 'Spotify results');

    res.json({
      success: true,
      data: aiResponse
    });

  } catch (error) {
    console.error('❌ AI Chat error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'AI_ERROR', message: 'Failed to process AI request' }
    });
  }
}));

// Spotify Playback Control endpoints
router.post('/spotify/play', asyncHandler(async (req: any, res: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const { trackId, playlistId, deviceId } = req.body;
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const session = sessionStore.getSession(decoded.userId);
    
    if (!session) {
      return res.status(401).json({ success: false, error: 'No session found' });
    }

    if (trackId) {
      await spotifyController.playTrack(session.accessToken, trackId, deviceId);
      res.json({ success: true, message: 'Track started playing' });
    } else if (playlistId) {
      await spotifyController.playPlaylist(session.accessToken, playlistId, deviceId);
      res.json({ success: true, message: 'Playlist started playing' });
    } else {
      await spotifyController.resumePlayback(session.accessToken, deviceId);
      res.json({ success: true, message: 'Playback resumed' });
    }

  } catch (error) {
    console.error('Play error:', error);
    res.status(500).json({ success: false, error: 'Playback failed' });
  }
}));

router.post('/spotify/pause', asyncHandler(async (req: any, res: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const session = sessionStore.getSession(decoded.userId);
    
    if (!session) {
      return res.status(401).json({ success: false, error: 'No session found' });
    }

    await spotifyController.pausePlayback(session.accessToken, req.body.deviceId);
    res.json({ success: true, message: 'Playback paused' });

  } catch (error) {
    console.error('Pause error:', error);
    res.status(500).json({ success: false, error: 'Pause failed' });
  }
}));

router.post('/spotify/next', asyncHandler(async (req: any, res: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const session = sessionStore.getSession(decoded.userId);
    
    if (!session) {
      return res.status(401).json({ success: false, error: 'No session found' });
    }

    await spotifyController.skipToNext(session.accessToken, req.body.deviceId);
    res.json({ success: true, message: 'Skipped to next track' });

  } catch (error) {
    console.error('Next error:', error);
    res.status(500).json({ success: false, error: 'Skip failed' });
  }
}));

router.get('/spotify/current', asyncHandler(async (req: any, res: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const session = sessionStore.getSession(decoded.userId);
    
    if (!session) {
      return res.status(401).json({ success: false, error: 'No session found' });
    }

    const currentPlayback = await spotifyController.getCurrentPlayback(session.accessToken);
    res.json({ 
      success: true, 
      data: currentPlayback 
    });

  } catch (error) {
    console.error('Get current playback error:', error);
    res.status(500).json({ success: false, error: 'Failed to get current playback' });
  }
}));

// Advanced media controls
router.post('/spotify/volume', asyncHandler(async (req: any, res: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const { volume, deviceId } = req.body;
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const session = sessionStore.getSession(decoded.userId);
    
    if (!session) {
      return res.status(401).json({ success: false, error: 'No session found' });
    }

    await spotifyController.setVolume(session.accessToken, volume, deviceId);
    res.json({ success: true, message: `Volume set to ${volume}%` });

  } catch (error) {
    console.error('Volume error:', error);
    res.status(500).json({ success: false, error: 'Volume control failed' });
  }
}));

router.post('/spotify/shuffle', asyncHandler(async (req: any, res: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const { shuffle, deviceId } = req.body;
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const session = sessionStore.getSession(decoded.userId);
    
    if (!session) {
      return res.status(401).json({ success: false, error: 'No session found' });
    }

    await spotifyController.setShuffle(session.accessToken, shuffle, deviceId);
    res.json({ success: true, message: `Shuffle ${shuffle ? 'enabled' : 'disabled'}` });

  } catch (error) {
    console.error('Shuffle error:', error);
    res.status(500).json({ success: false, error: 'Shuffle control failed' });
  }
}));

router.post('/spotify/repeat', asyncHandler(async (req: any, res: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const { state, deviceId } = req.body;
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const session = sessionStore.getSession(decoded.userId);
    
    if (!session) {
      return res.status(401).json({ success: false, error: 'No session found' });
    }

    await spotifyController.setRepeat(session.accessToken, state, deviceId);
    res.json({ success: true, message: `Repeat set to ${state}` });

  } catch (error) {
    console.error('Repeat error:', error);
    res.status(500).json({ success: false, error: 'Repeat control failed' });
  }
}));

router.post('/spotify/previous', asyncHandler(async (req: any, res: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const session = sessionStore.getSession(decoded.userId);
    
    if (!session) {
      return res.status(401).json({ success: false, error: 'No session found' });
    }

    await spotifyController.skipToPrevious(session.accessToken, req.body.deviceId);
    res.json({ success: true, message: 'Skipped to previous track' });

  } catch (error) {
    console.error('Previous error:', error);
    res.status(500).json({ success: false, error: 'Skip failed' });
  }
}));

router.post('/spotify/queue', asyncHandler(async (req: any, res: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const { trackId, deviceId } = req.body;
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const session = sessionStore.getSession(decoded.userId);
    
    if (!session) {
      return res.status(401).json({ success: false, error: 'No session found' });
    }

    await spotifyController.addToQueue(session.accessToken, trackId, deviceId);
    res.json({ success: true, message: 'Track added to queue' });

  } catch (error) {
    console.error('Queue error:', error);
    res.status(500).json({ success: false, error: 'Add to queue failed' });
  }
}));

router.get('/spotify/queue', asyncHandler(async (req: any, res: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const session = sessionStore.getSession(decoded.userId);
    
    if (!session) {
      return res.status(401).json({ success: false, error: 'No session found' });
    }

    const queue = await spotifyController.getQueue(session.accessToken);
    res.json({ success: true, data: queue });

  } catch (error) {
    console.error('Get queue error:', error);
    res.status(500).json({ success: false, error: 'Failed to get queue' });
  }
}));

// Control playback endpoint
router.post('/spotify/control', asyncHandler(async (req: any, res: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const session = sessionStore.getSession(decoded.userId);
    
    if (!session) {
      return res.status(401).json({ success: false, error: 'No session found' });
    }

    const { action, deviceId } = req.body;
    
    let result;
    switch (action) {
      case 'play':
        result = await spotifyController.resumePlayback(session.accessToken, deviceId);
        break;
      case 'pause':
        result = await spotifyController.pausePlayback(session.accessToken, deviceId);
        break;
      case 'next':
        result = await spotifyController.skipToNext(session.accessToken, deviceId);
        break;
      case 'previous':
        result = await spotifyController.skipToPrevious(session.accessToken, deviceId);
        break;
      default:
        return res.status(400).json({ success: false, error: 'Invalid action' });
    }

    res.json({ success: true, data: result });

  } catch (error) {
    console.error('Control playback error:', error);
    res.status(500).json({ success: false, error: 'Failed to control playback' });
  }
}));

// Play track endpoint
router.post('/spotify/play-track', asyncHandler(async (req: any, res: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const session = sessionStore.getSession(decoded.userId);
    
    if (!session) {
      return res.status(401).json({ success: false, error: 'No session found' });
    }

    const { trackId, deviceId } = req.body;
    
    if (!trackId) {
      return res.status(400).json({ success: false, error: 'Track ID is required' });
    }

    const result = await spotifyController.playTrack(session.accessToken, trackId, deviceId);
    res.json({ success: true, data: result });

  } catch (error) {
    console.error('Play track error:', error);
    res.status(500).json({ success: false, error: 'Failed to play track' });
  }
}));

// Add to queue endpoint
router.post('/spotify/add-to-queue', asyncHandler(async (req: any, res: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const session = sessionStore.getSession(decoded.userId);
    
    if (!session) {
      return res.status(401).json({ success: false, error: 'No session found' });
    }

    const { trackId, deviceId } = req.body;
    
    if (!trackId) {
      return res.status(400).json({ success: false, error: 'Track ID is required' });
    }

    const result = await spotifyController.addToQueue(session.accessToken, trackId, deviceId);
    res.json({ success: true, data: result });

  } catch (error) {
    console.error('Add to queue error:', error);
    res.status(500).json({ success: false, error: 'Failed to add to queue' });
  }
}));

// Search tracks endpoint  
router.get('/spotify/search', asyncHandler(async (req: any, res: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const session = sessionStore.getSession(decoded.userId);
    
    if (!session) {
      return res.status(401).json({ success: false, error: 'No session found' });
    }

    const { q, type = 'track', limit = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({ success: false, error: 'Query parameter is required' });
    }

    const searchResults = await spotifyController.search(session.accessToken, q as string, [type as string], parseInt(limit as string));
    res.json({ success: true, data: searchResults });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, error: 'Failed to search tracks' });
  }
}));

// Logout endpoint
router.post('/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      sessionStore.deleteSession(decoded.userId);
      console.log('🚪 User logged out:', decoded.displayName);
    } catch (error) {
      console.log('Logout token verification failed');
    }
  }
  
  res.json({
    success: true,
    data: { message: 'Logged out successfully' }
  });
});

export default router;