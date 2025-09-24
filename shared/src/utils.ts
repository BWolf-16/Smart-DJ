import { MoodType, AudioFeatures, Track } from './types';

/**
 * Utility functions for Smart DJ application
 */

// Music Analysis Utilities
export const analyzeAudioFeatures = (features: AudioFeatures): {
  mood: MoodType;
  energy: 'low' | 'medium' | 'high';
  danceability: 'low' | 'medium' | 'high';
} => {
  const { valence, energy, danceability } = features;
  
  // Mood analysis based on valence and energy
  let mood: MoodType;
  if (valence > 0.7 && energy > 0.7) mood = 'happy';
  else if (valence < 0.3 && energy < 0.3) mood = 'sad';
  else if (energy > 0.8) mood = 'energetic';
  else if (energy < 0.3 && valence > 0.3) mood = 'calm';
  else if (features.acousticness > 0.7) mood = 'romantic';
  else mood = 'focused';

  return {
    mood,
    energy: energy > 0.7 ? 'high' : energy > 0.4 ? 'medium' : 'low',
    danceability: danceability > 0.7 ? 'high' : danceability > 0.4 ? 'medium' : 'low'
  };
};

// Time and Date Utilities
export const getTimeOfDay = (date: Date = new Date()): 'morning' | 'afternoon' | 'evening' | 'night' => {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
};

export const formatDuration = (milliseconds: number): string => {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Text Processing Utilities
export const extractMoodFromPrompt = (prompt: string): MoodType | null => {
  const moodKeywords: Record<string, MoodType> = {
    'happy': 'happy',
    'joy': 'happy',
    'cheerful': 'happy',
    'upbeat': 'happy',
    'sad': 'sad',
    'melancholy': 'sad',
    'depressed': 'sad',
    'blue': 'sad',
    'energy': 'energetic',
    'pump': 'energetic',
    'hype': 'energetic',
    'excited': 'energetic',
    'calm': 'calm',
    'peaceful': 'calm',
    'relaxing': 'calm',
    'chill': 'calm',
    'focus': 'focused',
    'study': 'study',
    'concentration': 'focused',
    'work': 'focused',
    'romantic': 'romantic',
    'love': 'romantic',
    'date': 'romantic',
    'angry': 'aggressive',
    'rage': 'aggressive',
    'metal': 'aggressive',
    'nostalgia': 'nostalgic',
    'memories': 'nostalgic',
    'throwback': 'nostalgic',
    'party': 'party',
    'dance': 'party',
    'club': 'party',
    'workout': 'workout',
    'gym': 'workout',
    'exercise': 'workout',
    'gaming': 'gaming',
    'game': 'gaming',
    'boss': 'gaming',
    'sleep': 'sleep',
    'bedtime': 'sleep',
    'lullaby': 'sleep'
  };

  const lowerPrompt = prompt.toLowerCase();
  for (const [keyword, mood] of Object.entries(moodKeywords)) {
    if (lowerPrompt.includes(keyword)) {
      return mood;
    }
  }
  return null;
};

export const extractGenresFromPrompt = (prompt: string): string[] => {
  const genreKeywords: Record<string, string[]> = {
    'rock': ['rock', 'alternative rock', 'indie rock'],
    'pop': ['pop', 'indie pop', 'electropop'],
    'hip hop': ['hip hop', 'rap', 'trap'],
    'rap': ['hip hop', 'rap', 'trap'],
    'electronic': ['electronic', 'edm', 'house', 'techno'],
    'edm': ['electronic', 'edm', 'house', 'techno'],
    'jazz': ['jazz', 'smooth jazz', 'bebop'],
    'classical': ['classical', 'orchestral', 'symphony'],
    'country': ['country', 'folk', 'americana'],
    'folk': ['folk', 'indie folk', 'acoustic'],
    'metal': ['metal', 'heavy metal', 'death metal'],
    'reggae': ['reggae', 'ska', 'dub'],
    'blues': ['blues', 'rhythm and blues', 'chicago blues'],
    'funk': ['funk', 'disco', 'groove'],
    'ambient': ['ambient', 'atmospheric', 'drone'],
    'punk': ['punk', 'hardcore', 'post-punk'],
    'indie': ['indie', 'independent', 'alternative']
  };

  const lowerPrompt = prompt.toLowerCase();
  const foundGenres: string[] = [];
  
  for (const [keyword, genres] of Object.entries(genreKeywords)) {
    if (lowerPrompt.includes(keyword)) {
      foundGenres.push(...genres);
    }
  }
  
  return [...new Set(foundGenres)]; // Remove duplicates
};

// Array Utilities
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const getRandomItems = <T>(array: T[], count: number): T[] => {
  const shuffled = shuffleArray(array);
  return shuffled.slice(0, Math.min(count, array.length));
};

// Similarity Calculations
export const calculateTrackSimilarity = (track1: Track, track2: Track): number => {
  if (!track1.audioFeatures || !track2.audioFeatures) return 0;
  
  const features1 = track1.audioFeatures;
  const features2 = track2.audioFeatures;
  
  // Calculate euclidean distance between audio features
  const featureKeys: (keyof AudioFeatures)[] = [
    'danceability', 'energy', 'valence', 'acousticness', 
    'instrumentalness', 'liveness', 'speechiness'
  ];
  
  let sumSquaredDiffs = 0;
  for (const key of featureKeys) {
    const diff = features1[key] - features2[key];
    sumSquaredDiffs += diff * diff;
  }
  
  const distance = Math.sqrt(sumSquaredDiffs);
  const maxDistance = Math.sqrt(featureKeys.length); // Maximum possible distance
  
  // Convert distance to similarity (0-1, where 1 is most similar)
  return 1 - (distance / maxDistance);
};

// URL and String Utilities
export const generatePlaylistName = (mood: MoodType, context?: string): string => {
  const moodNames: Record<MoodType, string[]> = {
    happy: ['Sunshine Vibes', 'Good Times', 'Happy Days', 'Joyful Journey'],
    sad: ['Melancholy Moments', 'Blue Mood', 'Rainy Day', 'Emotional Depths'],
    energetic: ['Power Up', 'High Energy', 'Adrenaline Rush', 'Pump It Up'],
    calm: ['Peaceful Mind', 'Zen Zone', 'Tranquil Moments', 'Serenity'],
    focused: ['Focus Flow', 'Deep Work', 'Concentration', 'In The Zone'],
    romantic: ['Love Songs', 'Romantic Evening', 'Heart Strings', 'Love Vibes'],
    aggressive: ['Rage Mode', 'Intense Energy', 'Angry Anthems', 'Raw Power'],
    nostalgic: ['Memory Lane', 'Throwback Vibes', 'Golden Days', 'Vintage Feels'],
    party: ['Party Time', 'Dance Floor', 'Club Bangers', 'Turn Up'],
    workout: ['Gym Motivation', 'Workout Warriors', 'Fitness Fire', 'Sweat Session'],
    study: ['Study Session', 'Focus Music', 'Learning Mode', 'Academic Ambience'],
    gaming: ['Game On', 'Epic Gaming', 'Victory Vibes', 'Player Mode'],
    sleep: ['Sweet Dreams', 'Bedtime Bliss', 'Sleep Sounds', 'Dreamy Melodies']
  };
  
  const names = moodNames[mood] || ['Custom Playlist'];
  const baseName = names[Math.floor(Math.random() * names.length)];
  
  return context ? `${baseName} - ${context}` : baseName;
};

export const sanitizeFileName = (filename: string): string => {
  return filename
    .replace(/[^a-z0-9]/gi, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .toLowerCase();
};

// Validation Utilities
export const isValidSpotifyId = (id: string): boolean => {
  return /^[0-9A-Za-z]{22}$/.test(id);
};

export const isValidYouTubeId = (id: string): boolean => {
  return /^[a-zA-Z0-9_-]{11}$/.test(id);
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Rate Limiting Utilities
export const createRateLimiter = (maxRequests: number, windowMs: number) => {
  const requests = new Map<string, number[]>();
  
  return (identifier: string): boolean => {
    const now = Date.now();
    const userRequests = requests.get(identifier) || [];
    
    // Remove expired requests
    const validRequests = userRequests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return false; // Rate limit exceeded
    }
    
    validRequests.push(now);
    requests.set(identifier, validRequests);
    return true;
  };
};

// Color Utilities for UI
export const getMoodColor = (mood: MoodType): string => {
  const colors: Record<MoodType, string> = {
    happy: '#FFD700',
    sad: '#4169E1',
    energetic: '#FF4500',
    calm: '#98FB98',
    focused: '#9370DB',
    romantic: '#FF69B4',
    aggressive: '#DC143C',
    nostalgic: '#DDA0DD',
    party: '#FF1493',
    workout: '#FF6347',
    study: '#20B2AA',
    gaming: '#00FF00',
    sleep: '#191970'
  };
  return colors[mood] || '#808080';
};

// Error Handling Utilities
export const createErrorResponse = (message: string, code: string, statusCode: number = 500) => ({
  success: false,
  error: {
    code,
    message,
    timestamp: new Date().toISOString()
  }
});

export const createSuccessResponse = <T>(data: T, meta?: any) => ({
  success: true,
  data,
  meta,
  timestamp: new Date().toISOString()
});

// Debounce Utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};