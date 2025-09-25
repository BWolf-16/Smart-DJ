import React, { useState, useEffect } from 'react';
import '../styles/spotify-player.css';

interface SpotifyPlayerProps {
  className?: string;
}

interface CurrentTrack {
  item?: {
    name: string;
    artists: { name: string }[];
    album: {
      name: string;
      images: { url: string }[];
    };
    duration_ms: number;
  };
  is_playing: boolean;
  progress_ms: number;
  shuffle_state: boolean;
  repeat_state: 'off' | 'track' | 'context';
}

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: any;
  }
}

const SpotifyPlayer: React.FC<SpotifyPlayerProps> = ({ className = '' }) => {
  const [currentTrack, setCurrentTrack] = useState<CurrentTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [volume, setVolume] = useState(50);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [webPlayer, setWebPlayer] = useState<any>(null);
  const [deviceId, setDeviceId] = useState<string>('');
  const [useWebSDK, setUseWebSDK] = useState(true);

  // Initialize Spotify Web Playback SDK
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      console.log('🎵 Spotify SDK Ready');
      initializePlayer();
    };

    return () => {
      if (webPlayer) {
        webPlayer.disconnect();
      }
    };
  }, []);

  const initializePlayer = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const player = new window.Spotify.Player({
        name: 'Smart DJ Player',
        getOAuthToken: (cb: (token: string) => void) => {
          cb(token);
        },
        volume: 0.5
      });

      // Error handling
      player.addListener('initialization_error', ({ message }: any) => {
        console.error('❌ Initialization Error:', message);
      });

      player.addListener('authentication_error', ({ message }: any) => {
        console.error('❌ Authentication Error:', message);
      });

      player.addListener('account_error', ({ message }: any) => {
        console.error('❌ Account Error:', message);
        console.log('⚠️ Falling back to Web API controls (Premium required for Web SDK)');
        setUseWebSDK(false);
        // Load current track via API
        fetchCurrentTrack();
      });

      // Ready
      player.addListener('ready', ({ device_id }: any) => {
        console.log('🎯 Ready with Device ID', device_id);
        setDeviceId(device_id);
      });

      // Not Ready
      player.addListener('not_ready', ({ device_id }: any) => {
        console.log('❌ Device ID has gone offline', device_id);
      });

      // Player state changed
      player.addListener('player_state_changed', (state: any) => {
        if (state) {
          setCurrentTrack({
            item: state.track_window.current_track,
            is_playing: !state.paused,
            progress_ms: state.position,
            shuffle_state: state.shuffle,
            repeat_state: state.repeat_mode === 0 ? 'off' : state.repeat_mode === 1 ? 'context' : 'track'
          });
        }
      });

      // Connect to the player!
      const connected = await player.connect();
      if (connected) {
        console.log('✅ Successfully connected to Spotify!');
        setWebPlayer(player);
      }
    } catch (error) {
      console.error('❌ Error initializing player:', error);
    }
  };

  const fetchCurrentTrack = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('http://127.0.0.1:8080/api/auth/spotify/current', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentTrack(data);
        setIsPlaying(data?.is_playing || false);
      } else if (response.status === 401) {
        console.log('🔄 Session expired, please login again');
        localStorage.removeItem('authToken');
      }
    } catch (error) {
      console.error('❌ Error fetching track:', error);
    }
  };

  const controlPlayback = async (action: 'play' | 'pause' | 'next' | 'previous') => {
    if (webPlayer && deviceId) {
      // Use Web Playback SDK for direct control
      try {
        switch (action) {
          case 'play':
            await webPlayer.resume();
            break;
          case 'pause':
            await webPlayer.pause();
            break;
          case 'next':
            await webPlayer.nextTrack();
            break;
          case 'previous':
            await webPlayer.previousTrack();
            break;
        }
        console.log(`🎵 ${action} command executed via SDK`);
      } catch (error) {
        console.error(`❌ SDK ${action} failed:`, error);
        // Fallback to API
        await controlPlaybackAPI(action);
      }
    } else {
      // Fallback to API control
      await controlPlaybackAPI(action);
    }
  };

  const controlPlaybackAPI = async (action: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://127.0.0.1:8080/api/auth/spotify/control', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action, deviceId })
      });

      if (response.ok) {
        console.log(`🎵 ${action} successful via API`);
        setTimeout(fetchCurrentTrack, 500);
      }
    } catch (error) {
      console.error(`❌ ${action} failed:`, error);
    } finally {
      setLoading(false);
    }
  };

  const controlVolume = async (newVolume: number) => {
    if (webPlayer) {
      try {
        await webPlayer.setVolume(newVolume / 100);
        console.log(`🔊 Volume set to ${newVolume}% via SDK`);
      } catch (error) {
        console.error('❌ SDK volume control failed:', error);
        // Fallback to API
        await controlVolumeAPI(newVolume);
      }
    } else {
      await controlVolumeAPI(newVolume);
    }
  };

  const controlVolumeAPI = async (newVolume: number) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://127.0.0.1:8080/api/auth/spotify/volume', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ volume: newVolume, deviceId })
      });

      if (response.ok) {
        console.log(`🔊 Volume set to ${newVolume}% via API`);
      }
    } catch (error) {
      console.error('❌ Volume control failed:', error);
    }
  };

  const toggleShuffle = async () => {
    if (!currentTrack) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const newShuffleState = !currentTrack.shuffle_state;

      const response = await fetch('http://127.0.0.1:8080/api/auth/spotify/shuffle', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ shuffle: newShuffleState, deviceId })
      });

      if (response.ok) {
        console.log(`🔀 Shuffle ${newShuffleState ? 'enabled' : 'disabled'}`);
        setTimeout(fetchCurrentTrack, 500);
      }
    } catch (error) {
      console.error('❌ Shuffle toggle failed:', error);
    }
  };

  const toggleRepeat = async () => {
    if (!currentTrack) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const currentMode = currentTrack.repeat_state;
      const newMode = currentMode === 'off' ? 'context' : currentMode === 'context' ? 'track' : 'off';

      const response = await fetch('http://127.0.0.1:8080/api/auth/spotify/repeat', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ repeat: newMode, deviceId })
      });

      if (response.ok) {
        console.log(`🔁 Repeat mode: ${newMode}`);
        setTimeout(fetchCurrentTrack, 500);
      }
    } catch (error) {
      console.error('❌ Repeat toggle failed:', error);
    }
  };

  useEffect(() => {
    fetchCurrentTrack();
    const interval = setInterval(fetchCurrentTrack, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentTrack || !currentTrack.item) {
    return (
      <div className={`spotify-player bg-gradient-to-br from-spotify-black via-gray-800 to-spotify-black rounded-xl shadow-2xl p-6 border border-spotify-green/20 ${className}`}>
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-gray-600 rounded mx-auto mb-4"></div>
            <div className="h-4 bg-gray-600 rounded mb-2"></div>
            <div className="h-3 bg-gray-600 rounded w-3/4 mx-auto"></div>
          </div>
          <p className="text-gray-300 mt-4">
            {webPlayer ? 'Ready to play! Start music in Smart DJ.' : 'Connecting to Spotify...'}
          </p>
          {!webPlayer && (
            <div className="mt-2">
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-spotify-green"></div>
              <span className="ml-2 text-sm text-gray-400">Initializing player...</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  const track = currentTrack.item;
  const progressPercent = (currentTrack.progress_ms / track.duration_ms) * 100;

  return (
    <div className={`spotify-player bg-gradient-to-br from-spotify-black via-gray-800 to-spotify-black rounded-xl shadow-2xl p-6 border border-spotify-green/20 ${className}`}>
      <div className="flex items-center space-x-4">
        {/* Album Art */}
        {track.album.images[2] && (
          <img
            src={track.album.images[2].url}
            alt={track.album.name}
            className="w-16 h-16 rounded-lg shadow-md"
          />
        )}
        
        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-lg truncate">{track.name}</h3>
          <p className="text-sm text-gray-200 truncate font-medium">
            {track.artists.map(a => a.name).join(', ')}
          </p>
          <p className="text-xs text-gray-300 truncate">{track.album.name}</p>
          
          {/* Progress Bar */}
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-200 mb-1 font-medium">
              <span>{formatTime(currentTrack.progress_ms)}</span>
              <span>{formatTime(track.duration_ms)}</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-1.5 shadow-inner">
              <div
                className="progress-bar bg-spotify-green h-1.5 rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Controls */}
        <div className="media-controls flex flex-col items-center space-y-4">
          {/* Main Controls Row */}
          <div className="flex items-center justify-center space-x-4">
            {/* Shuffle */}
            <button
              onClick={toggleShuffle}
              disabled={loading}
              className={`control-button p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-spotify-green focus:ring-offset-2 transition-all ${
                currentTrack.shuffle_state 
                  ? 'bg-spotify-green text-white shadow-lg' 
                  : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
              }`}
              title="Shuffle"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
              </svg>
            </button>

            {/* Previous */}
            <button
              onClick={() => controlPlayback('previous')}
              disabled={loading}
              className="control-button bg-gray-600 hover:bg-gray-500 disabled:bg-gray-400 text-white p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-spotify-green focus:ring-offset-2 transition-all shadow-md"
              title="Previous"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
              </svg>
            </button>

            {/* Play/Pause */}
            <button
              onClick={() => controlPlayback(isPlaying ? 'pause' : 'play')}
              disabled={loading}
              className="control-button bg-spotify-green hover:bg-green-600 disabled:bg-gray-400 text-white p-4 rounded-full focus:outline-none focus:ring-2 focus:ring-spotify-green focus:ring-offset-2 transform transition-all shadow-lg hover:scale-105"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>

            {/* Next */}
            <button
              onClick={() => controlPlayback('next')}
              disabled={loading}
              className="control-button bg-gray-600 hover:bg-gray-500 disabled:bg-gray-400 text-white p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-spotify-green focus:ring-offset-2 transition-all shadow-md"
              title="Next"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4l8.5 6L6 16V4zm8.5 0h2v12h-2z"/>
              </svg>
            </button>

            {/* Repeat */}
            <button
              onClick={toggleRepeat}
              disabled={loading}
              className={`control-button p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-spotify-green focus:ring-offset-2 transition-all ${
                currentTrack.repeat_state !== 'off'
                  ? 'bg-spotify-green text-white shadow-lg' 
                  : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
              }`}
              title={`Repeat: ${currentTrack.repeat_state}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
                {currentTrack.repeat_state === 'track' && (
                  <circle cx="12" cy="12" r="2" fill="currentColor"/>
                )}
              </svg>
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center space-x-2 relative">
            <button
              onClick={() => setShowVolumeSlider(!showVolumeSlider)}
              className="control-button text-gray-200 hover:text-spotify-green p-2 rounded-full transition-all"
              title="Volume"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            </button>
            
            {showVolumeSlider && (
              <div className="volume-slider flex items-center space-x-2 bg-gray-700 px-4 py-2 rounded-full shadow-lg border border-spotify-green/30">
                <span className="text-xs text-white w-8 font-medium">{volume}%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => {
                    const newVolume = parseInt(e.target.value);
                    setVolume(newVolume);
                    controlVolume(newVolume);
                  }}
                  className="w-24 h-1 bg-gray-500 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpotifyPlayer;