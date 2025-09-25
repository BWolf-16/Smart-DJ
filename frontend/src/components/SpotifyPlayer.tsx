import React, { useState, useEffect, useRef } from 'react';
import '../styles/spotify-player.css';

interface SpotifyPlayerProps {
  className?: string;
}

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: any;
  }
}

const SpotifyPlayer: React.FC<SpotifyPlayerProps> = ({ className = "" }) => {
  const [currentTrack, setCurrentTrack] = useState<CurrentTrack | null>(null);
  const [loading, setLoading] = useState(false);
  const [volume, setVolume] = useState(50);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [webPlayer, setWebPlayer] = useState<any>(null);
  const [deviceId, setDeviceId] = useState<string>('');

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
  device: {
    id: string;
    is_active: boolean;
    is_private_session: boolean;
    is_restricted: boolean;
    name: string;
    type: string;
    volume_percent: number;
  };
}

interface SpotifyPlayerProps {
  className?: string;
}

const SpotifyPlayer: React.FC<SpotifyPlayerProps> = ({ className = '' }) => {
  const [currentTrack, setCurrentTrack] = useState<CurrentTrack | null>(null);
  const [loading, setLoading] = useState(false);
  const [volume, setVolume] = useState(50);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const fetchCurrentTrack = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://127.0.0.1:8080/api/auth/spotify/current', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentTrack(data.data);
        if (data.data?.device?.volume_percent !== undefined) {
          setVolume(data.data.device.volume_percent);
        }
      }
    } catch (error) {
      console.error('Error fetching current track:', error);
    }
  };

  const controlPlayback = async (action: 'play' | 'pause' | 'next' | 'previous') => {
    if (loading) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://127.0.0.1:8080/api/auth/spotify/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({})
      });

      if (response.ok) {
        console.log(`✅ ${action} successful`);
        setTimeout(fetchCurrentTrack, 1000);
      }
    } catch (error) {
      console.error(`❌ ${action} failed:`, error);
    } finally {
      setLoading(false);
    }
  };

  const controlVolume = async (newVolume: number) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://127.0.0.1:8080/api/auth/spotify/volume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ volume: newVolume })
      });

      if (response.ok) {
        setVolume(newVolume);
        console.log(`🔊 Volume set to ${newVolume}%`);
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ shuffle: newShuffleState })
      });

      if (response.ok) {
        console.log(`🔀 Shuffle ${newShuffleState ? 'enabled' : 'disabled'}`);
        setTimeout(fetchCurrentTrack, 1000);
      }
    } catch (error) {
      console.error('❌ Shuffle toggle failed:', error);
    }
  };

  const toggleRepeat = async () => {
    if (!currentTrack) return;
    
    try {
      const token = localStorage.getItem('authToken');
      let newRepeatState: 'off' | 'track' | 'context';
      
      switch (currentTrack.repeat_state) {
        case 'off':
          newRepeatState = 'context';
          break;
        case 'context':
          newRepeatState = 'track';
          break;
        case 'track':
          newRepeatState = 'off';
          break;
        default:
          newRepeatState = 'off';
      }
      
      const response = await fetch('http://127.0.0.1:8080/api/auth/spotify/repeat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ state: newRepeatState })
      });

      if (response.ok) {
        console.log(`🔁 Repeat set to ${newRepeatState}`);
        setTimeout(fetchCurrentTrack, 1000);
      }
    } catch (error) {
      console.error('❌ Repeat toggle failed:', error);
    }
  };

  useEffect(() => {
    fetchCurrentTrack();
    // Poll for updates every 5 seconds
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
      <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
        <div className="text-center text-gray-500">
          <p className="text-sm">No music playing</p>
          <p className="text-xs mt-1">Start playing music on Spotify to see controls here</p>
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
            className="w-16 h-16 rounded"
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
            <div className="w-full bg-gray-200 rounded-full h-1.5 shadow-inner">
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
                  ? 'bg-spotify-green text-white' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
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
              className="control-button bg-spotify-black hover:bg-gray-700 disabled:bg-gray-400 text-white p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-spotify-green focus:ring-offset-2 transition-all"
              title="Previous"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
              </svg>
            </button>

            {/* Play/Pause */}
            <button
              onClick={() => controlPlayback(currentTrack.is_playing ? 'pause' : 'play')}
              disabled={loading}
              className="control-button bg-spotify-green hover:bg-green-700 disabled:bg-gray-400 text-white p-4 rounded-full focus:outline-none focus:ring-2 focus:ring-spotify-green focus:ring-offset-2 transform transition-all"
              title={currentTrack.is_playing ? 'Pause' : 'Play'}
            >
              {loading ? (
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
              ) : currentTrack.is_playing ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>

            {/* Next */}
            <button
              onClick={() => controlPlayback('next')}
              disabled={loading}
              className="control-button bg-spotify-black hover:bg-gray-700 disabled:bg-gray-400 text-white p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-spotify-green focus:ring-offset-2 transition-all"
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
                  ? 'bg-spotify-green text-white' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
              title={`Repeat: ${currentTrack.repeat_state}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
              </svg>
              {currentTrack.repeat_state === 'track' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">1</span>
                </div>
              )}
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowVolumeSlider(!showVolumeSlider)}
              className="control-button text-spotify-black hover:text-spotify-green p-2 rounded-full transition-all"
              title="Volume"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            </button>
            
            {showVolumeSlider && (
              <div className="volume-slider flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-lg border">
                <span className="text-xs text-spotify-black w-8 font-medium">{volume}%</span>
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
                  className="w-24 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Spotify indicator */}
      <div className="mt-3 flex items-center justify-center">
        <div className="flex items-center text-xs text-gray-400">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.859-.179-.98-.599-.122-.421.18-.861.599-.98 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02l.021.14zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.420 1.56z"/>
          </svg>
          Playing on Spotify
        </div>
      </div>
    </div>
  );
};

export default SpotifyPlayer;