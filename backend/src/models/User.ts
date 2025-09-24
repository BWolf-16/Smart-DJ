import mongoose, { Document, Schema } from 'mongoose';

interface UserPreferences {
  favoriteGenres: string[];
  preferredMood: string[];
  listeningTime: string[];
  explicitContent: boolean;
  recommendationFrequency: 'low' | 'medium' | 'high';
  aiPersonality: 'friendly' | 'professional' | 'casual' | 'energetic';
}

export interface IUser extends Document {
  email: string;
  password?: string;
  username: string;
  displayName: string;
  avatar?: string;
  profileImage?: string;
  spotifyId?: string;
  spotifyAccessToken?: string;
  spotifyRefreshToken?: string;
  spotifyTokenExpiry?: Date;
  spotifyConnected: boolean;
  youtubeId?: string;
  youtubeAccessToken?: string;
  youtubeRefreshToken?: string;
  youtubeConnected: boolean;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: false,
    select: false // Don't include password in queries by default
  },
  username: {
    type: String,
    required: true,
    trim: true
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },
  profileImage: {
    type: String,
    default: null
  },
  spotifyId: {
    type: String,
    default: null,
    sparse: true,
    unique: true
  },
  spotifyAccessToken: {
    type: String,
    default: null,
    select: false
  },
  spotifyRefreshToken: {
    type: String,
    default: null,
    select: false
  },
  spotifyTokenExpiry: {
    type: Date,
    default: null
  },
  spotifyConnected: {
    type: Boolean,
    default: false
  },
  youtubeId: {
    type: String,
    default: null
  },
  youtubeAccessToken: {
    type: String,
    default: null,
    select: false
  },
  youtubeRefreshToken: {
    type: String,
    default: null,
    select: false
  },
  youtubeConnected: {
    type: Boolean,
    default: false
  },
  preferences: {
    favoriteGenres: {
      type: [String],
      default: []
    },
    preferredMood: {
      type: [String],
      default: []
    },
    listeningTime: {
      type: [String],
      default: []
    },
    explicitContent: {
      type: Boolean,
      default: false
    },
    recommendationFrequency: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    aiPersonality: {
      type: String,
      enum: ['friendly', 'professional', 'casual', 'energetic'],
      default: 'friendly'
    }
  }
}, {
  timestamps: true
});

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ spotifyId: 1 });
UserSchema.index({ youtubeId: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);