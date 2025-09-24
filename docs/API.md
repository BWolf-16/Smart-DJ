# Smart DJ API Documentation

## Overview
Smart DJ provides a comprehensive REST API for AI-powered music recommendations, playlist management, and music service integration.

## Base URL
- Development: `http://localhost:3001/api`
- Production: `https://api.smartdj.app/api`

## Authentication
Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting
- 100 requests per 15-minute window per IP address
- Higher limits available for authenticated users

---

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "displayName": "John Doe",
  "acceptTerms": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "displayName": "John Doe"
    },
    "token": "jwt_token"
  }
}
```

### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

### GET /auth/me
Get current user information.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "displayName": "John Doe",
    "preferences": {
      "favoriteGenres": ["rock", "jazz"],
      "preferredMood": ["energetic", "focused"],
      "aiPersonality": "friendly"
    }
  }
}
```

---

## Music Service Integration

### POST /spotify/connect
Connect user's Spotify account.

**Request Body:**
```json
{
  "code": "spotify_auth_code",
  "state": "csrf_token"
}
```

### GET /spotify/profile
Get user's Spotify profile information.

### GET /spotify/playlists
Get user's Spotify playlists.

**Query Parameters:**
- `limit` (number): Number of playlists to return (default: 20)
- `offset` (number): Pagination offset (default: 0)

### POST /youtube/connect
Connect user's YouTube Music account.

### GET /youtube/history
Get user's YouTube Music listening history.

---

## AI Recommendations

### POST /ai/recommend
Get AI-powered music recommendations.

**Request Body:**
```json
{
  "prompt": "I need music for studying",
  "mood": "focused",
  "genre": ["ambient", "classical"],
  "limit": 20,
  "includeHistory": true,
  "contextType": "studying"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tracks": [
      {
        "id": "track_id",
        "name": "Focus Flow",
        "artist": "Ambient Artist",
        "album": "Study Music",
        "duration": 240000,
        "audioFeatures": {
          "valence": 0.3,
          "energy": 0.2,
          "danceability": 0.1
        }
      }
    ],
    "explanation": "Based on your request for study music, I've selected ambient and classical tracks with low energy and high focus potential.",
    "confidence": 0.9,
    "mood": "focused",
    "playlistSuggestion": {
      "name": "Deep Focus Session",
      "description": "Curated music for concentrated study sessions"
    }
  }
}
```

### POST /ai/mood-playlist
Create a mood-based playlist using AI.

**Request Body:**
```json
{
  "mood": "workout",
  "duration": 3600,
  "intensity": "high"
}
```

### POST /ai/analyze-preferences
Analyze user's music preferences and listening patterns.

---

## Playlist Management

### GET /playlists
Get user's playlists.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `sortBy` (string): Sort field (default: "updatedAt")
- `sortOrder` (string): "asc" or "desc" (default: "desc")

### POST /playlists
Create a new playlist.

**Request Body:**
```json
{
  "name": "My Awesome Playlist",
  "description": "A collection of great songs",
  "isPublic": false,
  "tracks": ["track_id_1", "track_id_2"]
}
```

### GET /playlists/:id
Get a specific playlist.

### PUT /playlists/:id
Update a playlist.

### DELETE /playlists/:id
Delete a playlist.

### POST /playlists/:id/tracks
Add tracks to a playlist.

**Request Body:**
```json
{
  "trackIds": ["track_id_1", "track_id_2"],
  "position": 0
}
```

### DELETE /playlists/:id/tracks/:trackId
Remove a track from a playlist.

---

## Search

### GET /search
Search for music across connected services.

**Query Parameters:**
- `q` (string): Search query
- `type` (string): "track", "artist", "album", "playlist" (default: "track")
- `limit` (number): Number of results (default: 20)
- `market` (string): Market/country code (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "tracks": [
      {
        "id": "track_id",
        "name": "Song Name",
        "artist": "Artist Name",
        "album": "Album Name",
        "duration": 180000,
        "popularity": 85,
        "previewUrl": "https://preview-url.com",
        "spotifyId": "spotify_track_id",
        "youtubeId": "youtube_video_id"
      }
    ]
  }
}
```

---

## Analytics

### GET /analytics/listening-history
Get user's listening history analytics.

**Query Parameters:**
- `timeRange` (string): "short_term", "medium_term", "long_term"
- `startDate` (string): ISO date string
- `endDate` (string): ISO date string

### GET /analytics/top-genres
Get user's top genres.

### GET /analytics/top-artists
Get user's top artists.

### GET /analytics/mood-trends
Get user's mood trends over time.

---

## WebSocket Events

Connect to WebSocket at `/socket.io` for real-time updates.

### Events You Can Emit:
- `join_user_room`: Join your personal room for updates
- `sync_playback`: Sync playback with other devices

### Events You'll Receive:
- `track_update`: When track changes
- `recommendation_ready`: When new recommendations are available
- `playlist_updated`: When playlists are modified
- `sync_status`: Playback synchronization status

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details (development only)"
  }
}
```

### Common Error Codes:
- `VALIDATION_ERROR` (400): Invalid request data
- `AUTHENTICATION_ERROR` (401): Invalid or missing token
- `AUTHORIZATION_ERROR` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `INTERNAL_SERVER_ERROR` (500): Server error

---

## SDKs and Libraries

### JavaScript/TypeScript
```javascript
import { SmartDJClient } from '@smart-dj/sdk';

const client = new SmartDJClient({
  apiUrl: 'http://localhost:3001/api',
  token: 'your-jwt-token'
});

// Get recommendations
const recommendations = await client.ai.getRecommendations({
  prompt: 'I need music for working out',
  mood: 'energetic',
  limit: 25
});
```

### Python
```python
from smartdj import SmartDJClient

client = SmartDJClient(
    api_url='http://localhost:3001/api',
    token='your-jwt-token'
)

# Get recommendations
recommendations = client.ai.get_recommendations(
    prompt='I need music for working out',
    mood='energetic',
    limit=25
)
```