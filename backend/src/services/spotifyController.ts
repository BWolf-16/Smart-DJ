import axios from 'axios';

export class SpotifyController {
  private baseURL = 'https://api.spotify.com/v1';

  async getCurrentPlayback(accessToken: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/me/player`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 204) {
        return null; // No active device
      }
      console.error('Get playback error:', error);
      throw error;
    }
  }

  async playTrack(accessToken: string, trackId: string, deviceId?: string): Promise<void> {
    try {
      const url = `${this.baseURL}/me/player/play${deviceId ? `?device_id=${deviceId}` : ''}`;
      await axios.put(url, {
        uris: [`spotify:track:${trackId}`]
      }, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      console.log('✅ Playing track:', trackId);
    } catch (error) {
      console.error('Play track error:', error);
      throw error;
    }
  }

  async playPlaylist(accessToken: string, playlistId: string, deviceId?: string): Promise<void> {
    try {
      const url = `${this.baseURL}/me/player/play${deviceId ? `?device_id=${deviceId}` : ''}`;
      await axios.put(url, {
        context_uri: `spotify:playlist:${playlistId}`
      }, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      console.log('✅ Playing playlist:', playlistId);
    } catch (error) {
      console.error('Play playlist error:', error);
      throw error;
    }
  }

  async pausePlayback(accessToken: string, deviceId?: string): Promise<void> {
    try {
      const url = `${this.baseURL}/me/player/pause${deviceId ? `?device_id=${deviceId}` : ''}`;
      await axios.put(url, {}, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      console.log('⏸️ Playback paused');
    } catch (error) {
      console.error('Pause error:', error);
      throw error;
    }
  }

  async resumePlayback(accessToken: string, deviceId?: string): Promise<void> {
    try {
      const url = `${this.baseURL}/me/player/play${deviceId ? `?device_id=${deviceId}` : ''}`;
      await axios.put(url, {}, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      console.log('▶️ Playback resumed');
    } catch (error) {
      console.error('Resume error:', error);
      throw error;
    }
  }

  async skipToNext(accessToken: string, deviceId?: string): Promise<void> {
    try {
      const url = `${this.baseURL}/me/player/next${deviceId ? `?device_id=${deviceId}` : ''}`;
      await axios.post(url, {}, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      console.log('⏭️ Skipped to next');
    } catch (error) {
      console.error('Skip next error:', error);
      throw error;
    }
  }

  async skipToPrevious(accessToken: string, deviceId?: string): Promise<void> {
    try {
      const url = `${this.baseURL}/me/player/previous${deviceId ? `?device_id=${deviceId}` : ''}`;
      await axios.post(url, {}, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      console.log('⏮️ Skipped to previous');
    } catch (error) {
      console.error('Skip previous error:', error);
      throw error;
    }
  }

  async setVolume(accessToken: string, volume: number, deviceId?: string): Promise<void> {
    try {
      const url = `${this.baseURL}/me/player/volume?volume_percent=${volume}${deviceId ? `&device_id=${deviceId}` : ''}`;
      await axios.put(url, {}, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      console.log('🔊 Volume set to:', volume);
    } catch (error) {
      console.error('Set volume error:', error);
      throw error;
    }
  }

  async setShuffle(accessToken: string, shuffle: boolean, deviceId?: string): Promise<void> {
    try {
      const url = `${this.baseURL}/me/player/shuffle?state=${shuffle}${deviceId ? `&device_id=${deviceId}` : ''}`;
      await axios.put(url, {}, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      console.log('🔀 Shuffle set to:', shuffle);
    } catch (error) {
      console.error('Set shuffle error:', error);
      throw error;
    }
  }

  async setRepeat(accessToken: string, state: 'track' | 'context' | 'off', deviceId?: string): Promise<void> {
    try {
      const url = `${this.baseURL}/me/player/repeat?state=${state}${deviceId ? `&device_id=${deviceId}` : ''}`;
      await axios.put(url, {}, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      console.log('🔁 Repeat set to:', state);
    } catch (error) {
      console.error('Set repeat error:', error);
      throw error;
    }
  }

  async seek(accessToken: string, positionMs: number, deviceId?: string): Promise<void> {
    try {
      const url = `${this.baseURL}/me/player/seek?position_ms=${positionMs}${deviceId ? `&device_id=${deviceId}` : ''}`;
      await axios.put(url, {}, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      console.log('⏩ Seeked to position:', positionMs);
    } catch (error) {
      console.error('Seek error:', error);
      throw error;
    }
  }

  async getQueue(accessToken: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/me/player/queue`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('Get queue error:', error);
      return { queue: [] };
    }
  }

  async getRecentlyPlayed(accessToken: string, limit: number = 20): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseURL}/me/player/recently-played?limit=${limit}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      return response.data.items || [];
    } catch (error) {
      console.error('Get recently played error:', error);
      return [];
    }
  }

  async createPlaylist(accessToken: string, userId: string, name: string, description?: string, isPublic: boolean = false): Promise<any> {
    try {
      const response = await axios.post(`${this.baseURL}/users/${userId}/playlists`, {
        name,
        description: description || `Created by Smart DJ AI on ${new Date().toLocaleDateString()}`,
        public: isPublic
      }, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      console.log('📚 Created playlist:', name);
      return response.data;
    } catch (error) {
      console.error('Create playlist error:', error);
      throw error;
    }
  }

  async addTracksToPlaylist(accessToken: string, playlistId: string, trackUris: string[]): Promise<void> {
    try {
      await axios.post(`${this.baseURL}/playlists/${playlistId}/tracks`, {
        uris: trackUris
      }, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      console.log('➕ Added tracks to playlist:', trackUris.length);
    } catch (error) {
      console.error('Add tracks to playlist error:', error);
      throw error;
    }
  }

  async getRecommendations(accessToken: string, params: {
    seed_tracks?: string[];
    seed_artists?: string[];
    seed_genres?: string[];
    target_energy?: number;
    target_valence?: number;
    target_danceability?: number;
    target_tempo?: number;
    limit?: number;
  }): Promise<any[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.seed_tracks?.length) queryParams.append('seed_tracks', params.seed_tracks.join(','));
      if (params.seed_artists?.length) queryParams.append('seed_artists', params.seed_artists.join(','));
      if (params.seed_genres?.length) queryParams.append('seed_genres', params.seed_genres.join(','));
      if (params.target_energy !== undefined) queryParams.append('target_energy', params.target_energy.toString());
      if (params.target_valence !== undefined) queryParams.append('target_valence', params.target_valence.toString());
      if (params.target_danceability !== undefined) queryParams.append('target_danceability', params.target_danceability.toString());
      if (params.target_tempo !== undefined) queryParams.append('target_tempo', params.target_tempo.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());

      const response = await axios.get(`${this.baseURL}/recommendations?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      return response.data.tracks || [];
    } catch (error) {
      console.error('Get recommendations error:', error);
      return [];
    }
  }

  async getDevices(accessToken: string): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseURL}/me/player/devices`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      return response.data.devices || [];
    } catch (error) {
      console.error('Get devices error:', error);
      return [];
    }
  }

  async transferPlayback(accessToken: string, deviceId: string): Promise<void> {
    try {
      await axios.put(`${this.baseURL}/me/player`, {
        device_ids: [deviceId],
        play: true
      }, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      console.log('📱 Playback transferred to device:', deviceId);
    } catch (error) {
      console.error('Transfer playback error:', error);
      throw error;
    }
  }

  async addToQueue(accessToken: string, trackId: string, deviceId?: string): Promise<void> {
    try {
      const url = `${this.baseURL}/me/player/queue?uri=spotify:track:${trackId}${deviceId ? `&device_id=${deviceId}` : ''}`;
      await axios.post(url, {}, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      console.log('➕ Added to queue:', trackId);
    } catch (error) {
      console.error('Add to queue error:', error);
      throw error;
    }
  }

  async search(accessToken: string, query: string, types: string[] = ['track'], limit: number = 10): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/search`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
        params: {
          q: query,
          type: types.join(','),
          limit
        }
      });
      return response.data;
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }


}

export const spotifyController = new SpotifyController();