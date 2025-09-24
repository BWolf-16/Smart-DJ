// User Types
export interface User {
  id: string;
  email: string;
  displayName: string;
  profileImage?: string;
  spotifyId?: string;
  youtubeId?: string;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  favoriteGenres: string[];
  preferredMood: MoodType[];
  listeningTime: TimeOfDay[];
  explicitContent: boolean;
  recommendationFrequency: 'low' | 'medium' | 'high';
  aiPersonality: 'friendly' | 'professional' | 'casual' | 'energetic';
}

// Music Types
export interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  duration: number;
  explicit: boolean;
  popularity: number;
  previewUrl?: string;
  spotifyId?: string;
  youtubeId?: string;
  audioFeatures?: AudioFeatures;
  genres: string[];
  releaseDate: string;
  imageUrl?: string;
}

export interface AudioFeatures {
  danceability: number;
  energy: number;
  valence: number; // mood/happiness
  tempo: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  speechiness: number;
  loudness: number;
  key: number;
  mode: number;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  tracks: Track[];
  owner: string;
  isPublic: boolean;
  collaborative: boolean;
  spotifyId?: string;
  youtubeId?: string;
  aiGenerated: boolean;
  mood?: MoodType;
  createdAt: Date;
  updatedAt: Date;
}

// AI & Recommendation Types
export type MoodType = 
  | 'happy' 
  | 'sad' 
  | 'energetic' 
  | 'calm' 
  | 'focused' 
  | 'romantic' 
  | 'aggressive' 
  | 'nostalgic'
  | 'party'
  | 'workout'
  | 'study'
  | 'gaming'
  | 'sleep';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export interface RecommendationRequest {
  userId: string;
  prompt: string;
  mood?: MoodType;
  genre?: string[];
  limit?: number;
  includeHistory?: boolean;
  contextType?: 'studying' | 'working' | 'gaming' | 'relaxing' | 'exercising' | 'socializing';
}

export interface RecommendationResponse {
  tracks: Track[];
  explanation: string;
  confidence: number;
  mood: MoodType;
  genres: string[];
  playlistSuggestion?: {
    name: string;
    description: string;
  };
}

export interface ListeningHistory {
  id: string;
  userId: string;
  trackId: string;
  track: Track;
  playedAt: Date;
  playDuration: number;
  source: 'spotify' | 'youtube';
  context?: {
    playlist?: string;
    device?: string;
    skipReason?: 'user_skip' | 'track_end' | 'next_track';
  };
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// Authentication Types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface SpotifyAuth extends AuthTokens {
  scope: string[];
}

export interface YouTubeAuth extends AuthTokens {
  scope: string[];
}

// Music Service Integration Types
export interface MusicServiceConnection {
  id: string;
  userId: string;
  service: 'spotify' | 'youtube';
  isConnected: boolean;
  auth: AuthTokens;
  profile: {
    id: string;
    displayName: string;
    email?: string;
    imageUrl?: string;
  };
  permissions: string[];
  lastSyncAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Analytics Types
export interface UserAnalytics {
  userId: string;
  totalListeningTime: number;
  topGenres: { genre: string; count: number }[];
  topArtists: { artist: string; count: number }[];
  listeningPatterns: {
    timeOfDay: Record<TimeOfDay, number>;
    daysOfWeek: Record<string, number>;
  };
  moodHistory: { mood: MoodType; date: Date; confidence: number }[];
  averageAudioFeatures: AudioFeatures;
  generatedAt: Date;
}

// WebSocket Types
export interface WebSocketMessage {
  type: 'track_update' | 'recommendation' | 'playlist_update' | 'sync_status';
  payload: any;
  timestamp: Date;
}

// Error Types
export class SmartDJError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'SmartDJError';
  }
}

export class ValidationError extends SmartDJError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends SmartDJError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends SmartDJError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'AUTHORIZATION_ERROR', 403);
    this.name = 'AuthorizationError';
  }
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;