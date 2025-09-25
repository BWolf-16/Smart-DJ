import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AIMusicChat from './AIMusicChat';
import SpotifyPlayer from './SpotifyPlayerNew';
import SpotifySearch from './SpotifySearch';

interface SpotifyProfile {
  display_name: string;
  email: string;
  followers: { total: number };
  images: { url: string }[];
  id: string;
}

interface UserData {
  user: {
    id: string;
    email: string;
    displayName: string;
    spotifyProfile: SpotifyProfile;
  };
  spotify: {
    playlists: any[];
    topTracks: any[];
    recentTracks: any[];
    connected: boolean;
  };
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      console.log('🎛️ Dashboard: Starting token check...');
      
      // Helper function to get cookie value
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
      };
      
      // Check localStorage, sessionStorage, and cookies for the token
      const localToken = localStorage.getItem('authToken');
      const sessionToken = sessionStorage.getItem('authToken');
      const cookieToken = getCookie('authToken');
      
      console.log('📦 LocalStorage token:', localToken ? 'Found (' + localToken.length + ' chars)' : 'Not found');
      console.log('📦 SessionStorage token:', sessionToken ? 'Found (' + sessionToken.length + ' chars)' : 'Not found');
      console.log('🍪 Cookie token:', cookieToken ? 'Found (' + cookieToken.length + ' chars)' : 'Not found');
      console.log('🍪 All cookies:', document.cookie);
      
      let token = localToken || sessionToken || cookieToken;
      
      // Migrate token to localStorage for persistence
      if (!localToken && (sessionToken || cookieToken)) {
        const sourceToken = sessionToken || cookieToken;
        const source = sessionToken ? 'sessionStorage' : 'cookie';
        console.log(`🔄 Moving token from ${source} to localStorage...`);
        token = sourceToken;
        localStorage.setItem('authToken', token!);
        if (sessionToken) sessionStorage.removeItem('authToken');
        console.log('✅ Token migration completed');
      }
      
      if (!token) {
        console.log('❌ No token found, redirecting to login...');
        navigate('/');
        return;
      }
      
      console.log('✅ Token found, fetching user data...');

      try {
        const response = await fetch('http://127.0.0.1:8080/api/auth/spotify/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        setUserData(data.data);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load your profile. Please try logging in again.');
        // Clear invalid token
        localStorage.removeItem('authToken');
        setTimeout(() => navigate('/'), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Smart DJ</h1>
            </div>
            <div className="flex items-center space-x-4">
              {userData?.user.spotifyProfile.images?.[0] && (
                <img
                  src={userData.user.spotifyProfile.images[0].url}
                  alt="Profile"
                  className="h-8 w-8 rounded-full"
                />
              )}
              <span className="text-sm text-gray-700">
                {userData?.user.spotifyProfile.display_name}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Welcome, {userData?.user.spotifyProfile.display_name}!
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-900">Spotify Connected</h3>
                  <p className="text-sm text-green-700">
                    {userData?.spotify.playlists?.length || 0} playlists
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900">Followers</h3>
                  <p className="text-sm text-blue-700">
                    {userData?.user.spotifyProfile.followers.total || 0}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-medium text-purple-900">Top Tracks</h3>
                  <p className="text-sm text-purple-700">
                    {userData?.spotify.topTracks?.length || 0} analyzed
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Spotify Player Controls */}
          <SpotifyPlayer className="mb-6" />

          {/* Search and Play Music */}
          <SpotifySearch className="mb-6" />

          {/* AI Music Assistant */}
          <AIMusicChat userData={userData} />

          {/* Top Tracks */}
          {userData?.spotify.topTracks && userData.spotify.topTracks.length > 0 && (
            <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  🎵 Your Top Tracks
                </h2>
                <div className="space-y-3">
                  {userData.spotify.topTracks.slice(0, 5).map((track: any, index: number) => (
                    <div key={track.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <span className="text-lg font-bold text-green-600 w-8">#{index + 1}</span>
                      {track.album?.images?.[2] && (
                        <img
                          src={track.album.images[2].url}
                          alt={track.name}
                          className="w-12 h-12 rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{track.name}</p>
                        <p className="text-sm text-gray-500 truncate">
                          {track.artists.map((artist: any) => artist.name).join(', ')}
                        </p>
                        <p className="text-xs text-gray-400">{track.album.name}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {Math.floor(track.duration_ms / 60000)}:{String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {userData?.spotify.recentTracks && userData.spotify.recentTracks.length > 0 && (
            <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  🕐 Recently Played
                </h2>
                <div className="space-y-3">
                  {userData.spotify.recentTracks.slice(0, 5).map((item: any, index: number) => (
                    <div key={`${item.track.id}-${index}`} className="flex items-center space-x-4 p-2 hover:bg-gray-50 rounded">
                      {item.track.album?.images?.[2] && (
                        <img
                          src={item.track.album.images[2].url}
                          alt={item.track.name}
                          className="w-10 h-10 rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{item.track.name}</p>
                        <p className="text-sm text-gray-500 truncate">
                          {item.track.artists.map((artist: any) => artist.name).join(', ')}
                        </p>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(item.played_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Playlists */}
          {userData?.spotify.playlists && userData.spotify.playlists.length > 0 && (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  📚 Your Playlists
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userData.spotify.playlists.slice(0, 6).map((playlist: any) => (
                    <div key={playlist.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      {playlist.images?.[0] && (
                        <img
                          src={playlist.images[0].url}
                          alt={playlist.name}
                          className="w-full h-32 object-cover rounded mb-2"
                        />
                      )}
                      <h3 className="font-medium text-sm truncate" title={playlist.name}>
                        {playlist.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {playlist.tracks.total} tracks
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        by {playlist.owner.display_name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;