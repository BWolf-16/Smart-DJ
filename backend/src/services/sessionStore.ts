// Simple in-memory session store for Spotify tokens
// In production, this would use Redis or database

interface SpotifySession {
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  profile: any;
}

class SessionStore {
  private sessions: Map<string, SpotifySession> = new Map();

  setSession(userId: string, session: Omit<SpotifySession, 'userId'>): void {
    this.sessions.set(userId, { userId, ...session });
    console.log(`📝 Session stored for user: ${userId}`);
  }

  getSession(userId: string): SpotifySession | null {
    const session = this.sessions.get(userId);
    if (!session) {
      console.log(`❌ No session found for user: ${userId}`);
      return null;
    }

    // Check if token has expired
    if (session.expiresAt < new Date()) {
      console.log(`⏰ Session expired for user: ${userId}`);
      this.sessions.delete(userId);
      return null;
    }

    return session;
  }

  deleteSession(userId: string): void {
    this.sessions.delete(userId);
    console.log(`🗑️ Session deleted for user: ${userId}`);
  }

  refreshAccessToken(userId: string, newAccessToken: string, expiresIn: number): boolean {
    const session = this.sessions.get(userId);
    if (!session) return false;

    session.accessToken = newAccessToken;
    session.expiresAt = new Date(Date.now() + expiresIn * 1000);
    console.log(`🔄 Access token refreshed for user: ${userId}`);
    return true;
  }

  getAllActiveSessions(): SpotifySession[] {
    const now = new Date();
    return Array.from(this.sessions.values()).filter(session => session.expiresAt > now);
  }
}

export const sessionStore = new SessionStore();