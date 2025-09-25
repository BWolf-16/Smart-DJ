import passport from 'passport';
import { Strategy as SpotifyStrategy } from 'passport-spotify';
// import { User } from '../models/User'; // TODO: Enable when MongoDB is ready

export const configurePassport = () => {
  // Configure Spotify OAuth strategy
  passport.use(new SpotifyStrategy({
    clientID: process.env.SPOTIFY_CLIENT_ID!,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
    callbackURL: process.env.SPOTIFY_REDIRECT_URI!
  }, async (accessToken: string, refreshToken: string, expires_in: number, profile: any, done: any) => {
    try {
      // For testing: create a simple user object without database
      const user = {
        id: profile.id,
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
      };
      
      console.log('✅ Spotify OAuth success for:', profile.displayName);
      return done(null, user);
    } catch (error) {
      console.error('❌ Spotify OAuth error:', error);
      return done(error, null);
    }
  }));

  // Serialize user for session (simplified)
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      // For testing: return a simple user object
      const user = { 
        id, 
        displayName: 'Test User',
        email: 'test@example.com',
        username: 'testuser',
        spotifyConnected: true,
        youtubeConnected: false
      };
      done(null, user as any);
    } catch (error) {
      done(error, null);
    }
  });
};