import { z } from 'zod';
import { MoodType, TimeOfDay } from './types';

// User Validation Schemas
export const UserPreferencesSchema = z.object({
  favoriteGenres: z.array(z.string()).default([]),
  preferredMood: z.array(z.enum([
    'happy', 'sad', 'energetic', 'calm', 'focused', 'romantic', 
    'aggressive', 'nostalgic', 'party', 'workout', 'study', 'gaming', 'sleep'
  ])).default([]),
  listeningTime: z.array(z.enum(['morning', 'afternoon', 'evening', 'night'])).default([]),
  explicitContent: z.boolean().default(false),
  recommendationFrequency: z.enum(['low', 'medium', 'high']).default('medium'),
  aiPersonality: z.enum(['friendly', 'professional', 'casual', 'energetic']).default('friendly')
});

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string().min(1).max(100),
  profileImage: z.string().url().optional(),
  spotifyId: z.string().optional(),
  youtubeId: z.string().optional(),
  preferences: UserPreferencesSchema,
  createdAt: z.date(),
  updatedAt: z.date()
});

// Track Validation Schemas
export const AudioFeaturesSchema = z.object({
  danceability: z.number().min(0).max(1),
  energy: z.number().min(0).max(1),
  valence: z.number().min(0).max(1),
  tempo: z.number().min(0),
  acousticness: z.number().min(0).max(1),
  instrumentalness: z.number().min(0).max(1),
  liveness: z.number().min(0).max(1),
  speechiness: z.number().min(0).max(1),
  loudness: z.number(),
  key: z.number().min(0).max(11),
  mode: z.number().min(0).max(1)
});

export const TrackSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  artist: z.string().min(1),
  album: z.string().min(1),
  duration: z.number().min(0),
  explicit: z.boolean(),
  popularity: z.number().min(0).max(100),
  previewUrl: z.string().url().optional(),
  spotifyId: z.string().optional(),
  youtubeId: z.string().optional(),
  audioFeatures: AudioFeaturesSchema.optional(),
  genres: z.array(z.string()),
  releaseDate: z.string(),
  imageUrl: z.string().url().optional()
});

// Recommendation Validation Schemas
export const RecommendationRequestSchema = z.object({
  userId: z.string(),
  prompt: z.string().min(1).max(500),
  mood: z.enum([
    'happy', 'sad', 'energetic', 'calm', 'focused', 'romantic', 
    'aggressive', 'nostalgic', 'party', 'workout', 'study', 'gaming', 'sleep'
  ]).optional(),
  genre: z.array(z.string()).optional(),
  limit: z.number().min(1).max(50).default(20),
  includeHistory: z.boolean().default(true),
  contextType: z.enum(['studying', 'working', 'gaming', 'relaxing', 'exercising', 'socializing']).optional()
});

export const RecommendationResponseSchema = z.object({
  tracks: z.array(TrackSchema),
  explanation: z.string(),
  confidence: z.number().min(0).max(1),
  mood: z.enum([
    'happy', 'sad', 'energetic', 'calm', 'focused', 'romantic', 
    'aggressive', 'nostalgic', 'party', 'workout', 'study', 'gaming', 'sleep'
  ]),
  genres: z.array(z.string()),
  playlistSuggestion: z.object({
    name: z.string(),
    description: z.string()
  }).optional()
});

// Playlist Validation Schemas
export const PlaylistSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  imageUrl: z.string().url().optional(),
  tracks: z.array(TrackSchema),
  owner: z.string(),
  isPublic: z.boolean(),
  collaborative: z.boolean(),
  spotifyId: z.string().optional(),
  youtubeId: z.string().optional(),
  aiGenerated: z.boolean(),
  mood: z.enum([
    'happy', 'sad', 'energetic', 'calm', 'focused', 'romantic', 
    'aggressive', 'nostalgic', 'party', 'workout', 'study', 'gaming', 'sleep'
  ]).optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

// API Validation Schemas
export const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Authentication Validation Schemas
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  displayName: z.string().min(1).max(100),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions'
  })
});

// Music Service Connection Schemas
export const SpotifyCallbackSchema = z.object({
  code: z.string(),
  state: z.string().optional()
});

export const YouTubeCallbackSchema = z.object({
  code: z.string(),
  state: z.string().optional()
});

// Search Schemas
export const SearchQuerySchema = z.object({
  query: z.string().min(1).max(200),
  type: z.enum(['track', 'artist', 'album', 'playlist']).default('track'),
  limit: z.number().min(1).max(50).default(20),
  market: z.string().length(2).optional(), // ISO 3166-1 alpha-2 country code
  includeExternal: z.boolean().default(false)
});

// Analytics Schemas
export const AnalyticsTimeRangeSchema = z.object({
  timeRange: z.enum(['short_term', 'medium_term', 'long_term']).default('medium_term'),
  startDate: z.date().optional(),
  endDate: z.date().optional()
});

// Mood Analysis Schema
export const MoodAnalysisSchema = z.object({
  prompt: z.string().min(1).max(1000),
  context: z.object({
    timeOfDay: z.enum(['morning', 'afternoon', 'evening', 'night']).optional(),
    activity: z.string().optional(),
    location: z.string().optional(),
    socialContext: z.enum(['alone', 'with_friends', 'with_family', 'public']).optional()
  }).optional()
});

// Export validation helper functions
export const validateUser = (data: unknown) => UserSchema.parse(data);
export const validateTrack = (data: unknown) => TrackSchema.parse(data);
export const validateRecommendationRequest = (data: unknown) => RecommendationRequestSchema.parse(data);
export const validatePlaylist = (data: unknown) => PlaylistSchema.parse(data);
export const validatePagination = (data: unknown) => PaginationSchema.parse(data);
export const validateLogin = (data: unknown) => LoginSchema.parse(data);
export const validateRegister = (data: unknown) => RegisterSchema.parse(data);
export const validateSearchQuery = (data: unknown) => SearchQuerySchema.parse(data);

// Type inference helpers
export type UserPreferencesInput = z.infer<typeof UserPreferencesSchema>;
export type UserInput = z.infer<typeof UserSchema>;
export type TrackInput = z.infer<typeof TrackSchema>;
export type RecommendationRequestInput = z.infer<typeof RecommendationRequestSchema>;
export type RecommendationResponseInput = z.infer<typeof RecommendationResponseSchema>;
export type PlaylistInput = z.infer<typeof PlaylistSchema>;
export type PaginationInput = z.infer<typeof PaginationSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type SearchQueryInput = z.infer<typeof SearchQuerySchema>;