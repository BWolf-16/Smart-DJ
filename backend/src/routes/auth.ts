import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as SpotifyStrategy } from 'passport-spotify';
import SpotifyWebApi from 'spotify-web-api-node';
import { User } from '../models/User';
import { validateLogin, validateRegister } from '../middleware/validation';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

// Configure Spotify OAuth strategy
passport.use(new SpotifyStrategy({
  clientID: process.env.SPOTIFY_CLIENT_ID!,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
  callbackURL: process.env.SPOTIFY_REDIRECT_URI!
}, async (accessToken: string, refreshToken: string, expires_in: number, profile: any, done: any) => {
  try {
    // Check if user already exists
    let user = await User.findOne({ spotifyId: profile.id });
    
    if (user) {
      // Update existing user with new tokens
      user.spotifyAccessToken = accessToken;
      user.spotifyRefreshToken = refreshToken;
      user.spotifyTokenExpiry = new Date(Date.now() + expires_in * 1000);
      user.spotifyConnected = true;
      await user.save();
      return done(null, user);
    }
    
    // Create new user
    user = new User({
      spotifyId: profile.id,
      email: profile.emails?.[0]?.value || `${profile.id}@spotify.local`,
      username: profile.username || profile.displayName || profile.id,
      displayName: profile.displayName,
      avatar: profile.photos?.[0]?.value,
      spotifyAccessToken: accessToken,
      spotifyRefreshToken: refreshToken,
      spotifyTokenExpiry: new Date(Date.now() + expires_in * 1000),
      spotifyConnected: true,
      youtubeConnected: false
    });
    
    await user.save();
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Register new user
router.post('/register', validateRegister, asyncHandler(async (req: any, res: any) => {
  const { email, password, displayName, acceptTerms } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      error: {
        code: 'USER_EXISTS',
        message: 'User with this email already exists'
      }
    });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user
  const user = new User({
    email,
    password: hashedPassword,
    displayName,
    preferences: {
      favoriteGenres: [],
      preferredMood: [],
      listeningTime: [],
      explicitContent: false,
      recommendationFrequency: 'medium',
      aiPersonality: 'friendly'
    }
  });

  await user.save();

  // Generate JWT token
  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName
      },
      token
    }
  });
}));

// Login user
router.post('/login', validateLogin, asyncHandler(async (req: any, res: any) => {
  const { email, password } = req.body;

  // Find user
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password'
      }
    });
  }

  // Check password
  if (!user.password) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password'
      }
    });
  }
  
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password'
      }
    });
  }

  // Generate JWT token
  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName
      },
      token
    }
  });
}));

// Get current user
router.get('/me', asyncHandler(async (req: any, res: any) => {
  const user = await User.findById(req.user?.userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: 'User not found'
      }
    });
  }

  res.json({
    success: true,
    data: {
      id: user._id,
      email: user.email,
      displayName: user.displayName,
      preferences: user.preferences,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  });
}));

// Logout (optional - mainly for clearing client-side token)
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Logged out successfully'
    }
  });
});

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

router.get('/spotify/callback', 
  passport.authenticate('spotify', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=spotify_failed` }),
  asyncHandler(async (req: any, res: any) => {
    // Generate JWT token for the authenticated user
    const token = jwt.sign(
      { 
        userId: req.user._id,
        email: req.user.email 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
  })
);

// Get Spotify user profile and playlists
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
    const user = await User.findById(decoded.userId);

    if (!user || !user.spotifyConnected) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'SPOTIFY_NOT_CONNECTED',
          message: 'Spotify account not connected'
        }
      });
    }

    // Check if token is expired and refresh if needed
    if (user.spotifyTokenExpiry && user.spotifyTokenExpiry < new Date()) {
      const spotifyApi = new SpotifyWebApi({
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        refreshToken: user.spotifyRefreshToken
      });

      const data = await spotifyApi.refreshAccessToken();
      user.spotifyAccessToken = data.body.access_token;
      user.spotifyTokenExpiry = new Date(Date.now() + data.body.expires_in * 1000);
      await user.save();
    }

    // Get user's Spotify profile and playlists
    const spotifyApi = new SpotifyWebApi();
    if (!user.spotifyAccessToken) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'SPOTIFY_TOKEN_MISSING',
          message: 'Spotify access token not found'
        }
      });
    }
    spotifyApi.setAccessToken(user.spotifyAccessToken);

    const [profile, playlists, topTracks] = await Promise.all([
      spotifyApi.getMe(),
      spotifyApi.getUserPlaylists({ limit: 50 }),
      spotifyApi.getMyTopTracks({ limit: 20, time_range: 'medium_term' })
    ]);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          displayName: user.displayName,
          spotifyProfile: profile.body
        },
        spotify: {
          playlists: playlists.body.items,
          topTracks: topTracks.body.items,
          connected: true
        }
      }
    });

  } catch (error) {
    console.error('Spotify profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SPOTIFY_ERROR',
        message: 'Failed to fetch Spotify profile'
      }
    });
  }
}));

export default router;