import React, { useState, useEffect } from 'react';
import { Search, Play, Plus, Heart } from 'lucide-react';

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
  duration_ms: number;
  preview_url: string | null;
  uri: string;
}

interface SearchResult {
  tracks: {
    items: Track[];
  };
}

interface SpotifySearchProps {
  className?: string;
}

const SpotifySearch: React.FC<SpotifySearchProps> = ({ className = '' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentTracks, setRecentTracks] = useState<Track[]>([]);

  const searchTracks = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('🔍 No auth token found for search');
        setLoading(false);
        return;
      }

      console.log('🔍 Searching for:', query);
      const response = await fetch(`http://127.0.0.1:8080/api/auth/spotify/search?q=${encodeURIComponent(query)}&type=track&limit=20`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data: SearchResult = await response.json();
        console.log('🔍 Search results:', data);
        setSearchResults(data.tracks.items);
      } else if (response.status === 401) {
        console.log('🔍 Auth token expired for search, please re-authenticate');
        localStorage.removeItem('authToken');
      } else {
        console.error('❌ Search failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const playTrack = async (track: Track) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://127.0.0.1:8080/api/auth/spotify/play-track', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          trackId: track.id
        })
      });

      if (response.ok) {
        console.log(`🎵 Playing: ${track.name} by ${track.artists[0]?.name}`);
        // Add to recent tracks
        setRecentTracks(prev => {
          const filtered = prev.filter(t => t.id !== track.id);
          return [track, ...filtered].slice(0, 10);
        });
      } else {
        console.error('❌ Play failed');
      }
    } catch (error) {
      console.error('❌ Play error:', error);
    }
  };

  const addToQueue = async (track: Track) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://127.0.0.1:8080/api/auth/spotify/add-to-queue', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ trackId: track.id })
      });

      if (response.ok) {
        console.log(`➕ Added to queue: ${track.name}`);
      } else {
        console.error('❌ Add to queue failed');
      }
    } catch (error) {
      console.error('❌ Queue error:', error);
    }
  };

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      searchTracks(searchQuery);
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const TrackItem = ({ track, showAddToQueue = true }: { track: Track; showAddToQueue?: boolean }) => (
    <div className="group flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-all">
      {/* Album Art */}
      {track.album.images[2] && (
        <img
          src={track.album.images[2].url}
          alt={track.album.name}
          className="w-12 h-12 rounded shadow-sm"
        />
      )}
      
      {/* Track Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-white truncate">{track.name}</h4>
        <p className="text-sm text-gray-300 truncate">
          {track.artists.map(a => a.name).join(', ')}
        </p>
        <p className="text-xs text-gray-400 truncate">{track.album.name}</p>
      </div>
      
      {/* Duration */}
      <span className="text-xs text-gray-400 w-12 text-right">
        {formatDuration(track.duration_ms)}
      </span>
      
      {/* Actions */}
      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => playTrack(track)}
          className="control-button bg-spotify-green hover:bg-green-600 text-white p-2 rounded-full transition-all"
          title="Play Now"
        >
          <Play className="w-4 h-4" />
        </button>
        
        {showAddToQueue && (
          <button
            onClick={() => addToQueue(track)}
            className="control-button bg-gray-600 hover:bg-gray-500 text-white p-2 rounded-full transition-all"
            title="Add to Queue"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className={`bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-xl shadow-2xl p-6 border border-spotify-green/20 ${className}`}>
      {/* Search Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <Search className="w-6 h-6 mr-2 text-spotify-green" />
          Search & Play
        </h2>
        
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for songs, artists, or albums..."
            className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-spotify-green focus:border-transparent transition-all"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-spotify-green"></div>
            </div>
          )}
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Search Results</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {searchResults.map((track) => (
              <TrackItem key={track.id} track={track} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Tracks */}
      {recentTracks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
            <Heart className="w-5 h-5 mr-2 text-spotify-green" />
            Recently Played
          </h3>
          <div className="space-y-2">
            {recentTracks.map((track) => (
              <TrackItem key={`recent-${track.id}`} track={track} showAddToQueue={false} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!searchQuery && recentTracks.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-300 mb-2">Discover Music</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Search for your favorite songs, artists, or albums. Click play to start listening instantly!
          </p>
        </div>
      )}

      {/* No Results */}
      {searchQuery && !loading && searchResults.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">No results found for "{searchQuery}"</div>
          <p className="text-sm text-gray-500">Try different keywords or check your spelling</p>
        </div>
      )}
    </div>
  );
};

export default SpotifySearch;