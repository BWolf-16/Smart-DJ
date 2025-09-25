import OpenAI from 'openai';
import axios from 'axios';

let openai: OpenAI | null = null;

const getOpenAI = () => {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!
    });
  }
  return openai;
};

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { name: string };
  external_urls: { spotify: string };
}

interface SpotifyPlaylist {
  id: string;
  name: string;
  tracks: { total: number };
}

interface AIRequest {
  message: string;
  spotifyAccessToken: string;
  userProfile: any;
  userPlaylists: SpotifyPlaylist[];
  userTopTracks: SpotifyTrack[];
  recentTracks: any[];
}

interface AIResponse {
  message: string;
  actions?: {
    type: 'play' | 'search' | 'create_playlist' | 'add_to_playlist' | 'get_recommendations';
    data?: any;
  }[];
  spotifyResults?: any[];
}

export class AIService {
  async processUserRequest(request: AIRequest): Promise<AIResponse> {
    try {
      console.log('🤖 Processing AI request:', request.message);

      // Create context about user's music taste
      const musicContext = this.createMusicContext(request);
      
      // Get AI response with function calling
      const completion = await getOpenAI().chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a smart DJ AI assistant that can control Spotify and provide personalized music recommendations. 

You have access to the user's:
- Spotify profile: ${JSON.stringify(request.userProfile)}
- Playlists: ${request.userPlaylists.map(p => p.name).join(', ')}
- Top tracks: ${request.userTopTracks.slice(0, 5).map(t => `${t.name} by ${t.artists.map(a => a.name).join(', ')}`).join(', ')}
- Recent tracks: ${request.recentTracks.slice(0, 3).map((r: any) => `${r.track.name} by ${r.track.artists.map((a: any) => a.name).join(', ')}`).join(', ')}

When the user asks for music recommendations or wants to control their Spotify:
1. Provide a helpful, personalized response based on their music taste
2. Control playback (play, pause, skip, volume, shuffle, repeat)
3. Search for and play specific tracks, artists, or playlists
4. Create smart playlists based on mood, activity, or preferences
5. Use their listening history to make intelligent recommendations
6. Be conversational and friendly like a real DJ

Available actions:
- search: Search for tracks on Spotify
- play: Play specific tracks or playlists
- pause: Pause current playback
- skip: Skip to next/previous track
- volume: Set volume level
- shuffle: Toggle shuffle mode
- repeat: Set repeat mode
- create_playlist: Create a new playlist with specific tracks
- get_recommendations: Get Spotify recommendations based on seeds
- queue: Add tracks to playback queue

Respond with helpful music advice and execute the requested actions.`
          },
          {
            role: "user", 
            content: request.message
          }
        ],
        functions: [
          {
            name: "spotify_search",
            description: "Search for tracks, artists, or albums on Spotify",
            parameters: {
              type: "object",
              properties: {
                query: { type: "string", description: "Search query" },
                type: { type: "string", enum: ["track", "artist", "album", "playlist"] },
                limit: { type: "number", default: 10 }
              },
              required: ["query", "type"]
            }
          },
          {
            name: "get_recommendations",
            description: "Get personalized recommendations from Spotify",
            parameters: {
              type: "object",
              properties: {
                seed_tracks: { type: "array", items: { type: "string" }, description: "Track IDs for recommendations" },
                seed_artists: { type: "array", items: { type: "string" }, description: "Artist IDs for recommendations" },
                target_energy: { type: "number", minimum: 0, maximum: 1, description: "Energy level 0-1" },
                target_valence: { type: "number", minimum: 0, maximum: 1, description: "Mood level 0-1" },
                limit: { type: "number", default: 10 }
              },
              required: []
            }
          },
          {
            name: "create_playlist",
            description: "Create a new Spotify playlist",
            parameters: {
              type: "object",
              properties: {
                name: { type: "string", description: "Playlist name" },
                description: { type: "string", description: "Playlist description" },
                track_ids: { type: "array", items: { type: "string" }, description: "Track IDs to add" }
              },
              required: ["name"]
            }
          },
          {
            name: "control_playback",
            description: "Control Spotify playback (play, pause, skip, volume, shuffle, repeat)",
            parameters: {
              type: "object",
              properties: {
                action: { 
                  type: "string", 
                  enum: ["play", "pause", "next", "previous", "volume", "shuffle", "repeat"],
                  description: "Playback action to perform"
                },
                track_id: { type: "string", description: "Track ID to play (for play action)" },
                playlist_id: { type: "string", description: "Playlist ID to play (for play action)" },
                volume: { type: "number", minimum: 0, maximum: 100, description: "Volume percentage (for volume action)" },
                shuffle: { type: "boolean", description: "Shuffle state (for shuffle action)" },
                repeat_state: { type: "string", enum: ["track", "context", "off"], description: "Repeat mode (for repeat action)" }
              },
              required: ["action"]
            }
          },
          {
            name: "add_to_queue",
            description: "Add tracks to the Spotify playback queue",
            parameters: {
              type: "object",
              properties: {
                track_ids: { type: "array", items: { type: "string" }, description: "Track IDs to add to queue" }
              },
              required: ["track_ids"]
            }
          }
        ],
        function_call: "auto"
      });

      const aiMessage = completion.choices[0].message;
      let spotifyResults: any[] = [];
      let actions: any[] = [];

      // Handle function calls
      if (aiMessage.function_call) {
        const functionName = aiMessage.function_call.name;
        const functionArgs = JSON.parse(aiMessage.function_call.arguments);

        console.log('🎵 AI wants to call:', functionName, functionArgs);

        switch (functionName) {
          case 'spotify_search':
            spotifyResults = await this.searchSpotify(request.spotifyAccessToken, functionArgs);
            actions.push({ type: 'search', data: functionArgs });
            break;
          
          case 'get_recommendations':
            spotifyResults = await this.getRecommendations(request.spotifyAccessToken, functionArgs);
            actions.push({ type: 'get_recommendations', data: functionArgs });
            break;

          case 'create_playlist':
            const playlist = await this.createPlaylist(request.spotifyAccessToken, request.userProfile.id, functionArgs);
            spotifyResults = [playlist];
            actions.push({ type: 'create_playlist', data: functionArgs });
            break;

          case 'control_playback':
            const controlResult = await this.controlPlayback(request.spotifyAccessToken, functionArgs);
            spotifyResults = [controlResult];
            actions.push({ type: 'control_playback', data: functionArgs });
            break;

          case 'add_to_queue':
            await this.addToQueue(request.spotifyAccessToken, functionArgs.track_ids);
            actions.push({ type: 'add_to_queue', data: functionArgs });
            break;
        }
      }

      return {
        message: aiMessage.content || "I'd be happy to help you with your music!",
        actions,
        spotifyResults
      };

    } catch (error) {
      console.error('❌ AI Service error:', error);
      return {
        message: "Sorry, I'm having trouble processing your request right now. Please try again!",
        actions: []
      };
    }
  }

  private createMusicContext(request: AIRequest): string {
    const topGenres = request.userTopTracks
      .slice(0, 5)
      .map(t => t.artists[0]?.name)
      .join(', ');

    return `User's music taste: Likes ${topGenres}. Has ${request.userPlaylists.length} playlists. Recent activity shows interest in various genres.`;
  }

  private async searchSpotify(accessToken: string, params: any): Promise<any[]> {
    try {
      const response = await axios.get(`https://api.spotify.com/v1/search`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
        params: {
          q: params.query,
          type: params.type,
          limit: params.limit || 10
        }
      });

      const key = `${params.type}s`;
      return response.data[key]?.items || [];
    } catch (error) {
      console.error('Spotify search error:', error);
      return [];
    }
  }

  private async getRecommendations(accessToken: string, params: any): Promise<any[]> {
    try {
      const response = await axios.get(`https://api.spotify.com/v1/recommendations`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
        params: {
          seed_tracks: params.seed_tracks?.join(','),
          seed_artists: params.seed_artists?.join(','),
          target_energy: params.target_energy,
          target_valence: params.target_valence,
          limit: params.limit || 10
        }
      });

      return response.data.tracks || [];
    } catch (error) {
      console.error('Spotify recommendations error:', error);
      return [];
    }
  }

  private async createPlaylist(accessToken: string, userId: string, params: any): Promise<any> {
    try {
      // Create playlist
      const createResponse = await axios.post(
        `https://api.spotify.com/v1/users/${userId}/playlists`,
        {
          name: params.name,
          description: params.description || `Created by Smart DJ AI`,
          public: false
        },
        {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      );

      const playlist = createResponse.data;

      // Add tracks if provided
      if (params.track_ids && params.track_ids.length > 0) {
        await axios.post(
          `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
          {
            uris: params.track_ids.map((id: string) => `spotify:track:${id}`)
          },
          {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          }
        );
      }

      return playlist;
    } catch (error) {
      console.error('Create playlist error:', error);
      throw error;
    }
  }

  private async controlPlayback(accessToken: string, params: any): Promise<any> {
    try {
      const baseURL = 'https://api.spotify.com/v1/me/player';
      
      switch (params.action) {
        case 'play':
          if (params.track_id) {
            await axios.put(`${baseURL}/play`, {
              uris: [`spotify:track:${params.track_id}`]
            }, {
              headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            return { message: 'Playing track', action: 'play', track_id: params.track_id };
          } else if (params.playlist_id) {
            await axios.put(`${baseURL}/play`, {
              context_uri: `spotify:playlist:${params.playlist_id}`
            }, {
              headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            return { message: 'Playing playlist', action: 'play', playlist_id: params.playlist_id };
          } else {
            await axios.put(`${baseURL}/play`, {}, {
              headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            return { message: 'Resuming playback', action: 'play' };
          }

        case 'pause':
          await axios.put(`${baseURL}/pause`, {}, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          });
          return { message: 'Playback paused', action: 'pause' };

        case 'next':
          await axios.post(`${baseURL}/next`, {}, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          });
          return { message: 'Skipped to next track', action: 'next' };

        case 'previous':
          await axios.post(`${baseURL}/previous`, {}, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          });
          return { message: 'Skipped to previous track', action: 'previous' };

        case 'volume':
          await axios.put(`${baseURL}/volume?volume_percent=${params.volume}`, {}, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          });
          return { message: `Volume set to ${params.volume}%`, action: 'volume', volume: params.volume };

        case 'shuffle':
          await axios.put(`${baseURL}/shuffle?state=${params.shuffle}`, {}, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          });
          return { message: `Shuffle ${params.shuffle ? 'enabled' : 'disabled'}`, action: 'shuffle', shuffle: params.shuffle };

        case 'repeat':
          await axios.put(`${baseURL}/repeat?state=${params.repeat_state}`, {}, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          });
          return { message: `Repeat set to ${params.repeat_state}`, action: 'repeat', repeat_state: params.repeat_state };

        default:
          throw new Error(`Unknown playback action: ${params.action}`);
      }
    } catch (error) {
      console.error('Control playback error:', error);
      throw error;
    }
  }

  private async addToQueue(accessToken: string, trackIds: string[]): Promise<void> {
    try {
      for (const trackId of trackIds) {
        await axios.post(`https://api.spotify.com/v1/me/player/queue?uri=spotify:track:${trackId}`, {}, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
      }
      console.log(`✅ Added ${trackIds.length} tracks to queue`);
    } catch (error) {
      console.error('Add to queue error:', error);
      throw error;
    }
  }
}

export const aiService = new AIService();