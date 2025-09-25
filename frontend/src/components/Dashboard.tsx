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
    <div className="min-h-screen bg-spotify-black">
      {/* Spotify-styled Header */}
      <header className="bg-spotify-dark-gray border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.062 14.615a.625.625 0 01-.862.23c-2.359-1.441-5.328-1.769-8.828-.969a.625.625 0 11-.304-1.213c3.815-.871 7.068-.495 9.764 1.121a.625.625 0 01.23.831zm1.23-2.737a.781.781 0 01-1.077.287c-2.7-1.653-6.815-2.132-10.01-1.166a.781.781 0 11-.461-1.494c3.658-1.107 8.146-.568 11.26 1.295a.781.781 0 01.288 1.078zm.106-2.85C14.692 8.953 9.715 8.753 6.648 9.71a.936.936 0 11-.54-1.794c3.533-1.104 9.006-.896 12.855 1.514a.936.936 0 11-.565 1.588z"/>
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-white">Smart DJ</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-spotify-gray rounded-full px-4 py-2">
                {userData?.user.spotifyProfile.images?.[0] && (
                  <img
                    src={userData.user.spotifyProfile.images[0].url}
                    alt="Profile"
                    className="h-8 w-8 rounded-full border-2 border-spotify-green"
                  />
                )}
                <span className="text-sm font-medium text-white">
                  {userData?.user.spotifyProfile.display_name}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6">
        {/* Hero Welcome Section */}
        <div className="bg-gradient-to-r from-spotify-green to-green-400 rounded-2xl p-8 mb-8 text-black">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-white">
                Welcome back, {userData?.user.spotifyProfile.display_name}! 🎵
              </h1>
              <p className="text-lg opacity-90 text-white">
                Ready to discover your next favorite song?
              </p>
            </div>
            {userData?.user.spotifyProfile.images?.[0] && (
              <img
                src={userData.user.spotifyProfile.images[0].url}
                alt="Profile"
                className="h-20 w-20 rounded-full border-4 border-black"
              />
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-spotify-dark-gray rounded-xl p-6 border border-gray-700 hover:border-spotify-green transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold text-lg">Playlists</h3>
                <p className="text-3xl font-bold text-white mt-2">
                  {userData?.spotify.playlists?.length || 0}
                </p>
              </div>
              <div className="bg-spotify-green bg-opacity-20 p-3 rounded-xl">
                <svg className="w-8 h-8 text-spotify-green" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-spotify-dark-gray rounded-xl p-6 border border-gray-700 hover:border-spotify-green transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold text-lg">Followers</h3>
                <p className="text-3xl font-bold text-white mt-2">
                  {userData?.user.spotifyProfile.followers.total || 0}
                </p>
              </div>
              <div className="bg-spotify-green bg-opacity-20 p-3 rounded-xl">
                <svg className="w-8 h-8 text-spotify-green" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-spotify-dark-gray rounded-xl p-6 border border-gray-700 hover:border-spotify-green transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold text-lg">Top Tracks</h3>
                <p className="text-3xl font-bold text-white mt-2">
                  {userData?.spotify.topTracks?.length || 0}
                </p>
              </div>
              <div className="bg-spotify-green bg-opacity-20 p-3 rounded-xl">
                <svg className="w-8 h-8 text-spotify-green" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Main App Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Player and Search */}
          <div className="xl:col-span-2 space-y-8">
            {/* Spotify Player */}
            <div className="bg-spotify-dark-gray rounded-2xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <svg className="w-6 h-6 text-spotify-green mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Now Playing
              </h2>
              <SpotifyPlayer className="" />
            </div>

            {/* Search Section */}
            <div className="bg-spotify-dark-gray rounded-2xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <svg className="w-6 h-6 text-spotify-green mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                Search & Discover
              </h2>
              <SpotifySearch className="" />
            </div>
          </div>

          {/* Right Column - AI Chat */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-spotify-dark-gray to-gray-900 rounded-2xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <svg className="w-6 h-6 text-spotify-green mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
                AI Music Assistant
              </h2>
              <AIMusicChat userData={userData} />
            </div>
          </div>
        </div>

        {/* Music Library Sections */}
        <div className="mt-8 space-y-8">
          {/* Top Tracks */}
          {userData?.spotify.topTracks && userData.spotify.topTracks.length > 0 && (
            <div className="bg-spotify-dark-gray rounded-2xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <svg className="w-6 h-6 text-spotify-green mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Your Top Tracks
              </h2>
              <div className="space-y-3">
                {userData.spotify.topTracks.slice(0, 5).map((track: any, index: number) => (
                  <div key={track.id} className="flex items-center space-x-4 p-4 bg-spotify-gray rounded-xl hover:bg-opacity-80 transition-colors duration-200">
                    <span className="text-xl font-bold text-spotify-green w-8">#{index + 1}</span>
                    {track.album?.images?.[2] && (
                      <img
                        src={track.album.images[2].url}
                        alt={track.name}
                        className="w-14 h-14 rounded-lg"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate text-lg">{track.name}</p>
                      <p className="text-gray-300 truncate">
                        {track.artists.map((artist: any) => artist.name).join(', ')}
                      </p>
                      <p className="text-xs text-gray-400">{track.album.name}</p>
                    </div>
                    <div className="text-gray-300 bg-spotify-black px-3 py-1 rounded-full text-sm">
                      {Math.floor(track.duration_ms / 60000)}:{String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {userData?.spotify.recentTracks && userData.spotify.recentTracks.length > 0 && (
            <div className="bg-spotify-dark-gray rounded-2xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <svg className="w-6 h-6 text-spotify-green mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.5 6L12 10.5 8.5 8 12 5.5 15.5 8zM8.5 16L12 13.5 15.5 16 12 18.5 8.5 16z"/>
                </svg>
                Recently Played
              </h2>
              <div className="space-y-3">
                {userData.spotify.recentTracks.slice(0, 5).map((item: any, index: number) => (
                  <div key={`${item.track.id}-${index}`} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-spotify-gray transition-colors duration-200">
                    {item.track.album?.images?.[2] && (
                      <img
                        src={item.track.album.images[2].url}
                        alt={item.track.name}
                        className="w-12 h-12 rounded-lg"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{item.track.name}</p>
                      <p className="text-gray-300 truncate text-sm">
                        {item.track.artists.map((artist: any) => artist.name).join(', ')}
                      </p>
                    </div>
                    <div className="text-xs text-gray-400 bg-spotify-black px-2 py-1 rounded">
                      {new Date(item.played_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Playlists Grid */}
          {userData?.spotify.playlists && userData.spotify.playlists.length > 0 && (
            <div className="bg-spotify-dark-gray rounded-2xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <svg className="w-6 h-6 text-spotify-green mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
                </svg>
                Your Playlists
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {userData.spotify.playlists.slice(0, 6).map((playlist: any) => (
                  <div key={playlist.id} className="bg-spotify-gray rounded-xl p-4 hover:bg-opacity-80 cursor-pointer transition-all duration-200 hover:scale-105 border border-gray-700">
                    {playlist.images?.[0] && (
                      <img
                        src={playlist.images[0].url}
                        alt={playlist.name}
                        className="w-full h-40 object-cover rounded-lg mb-4"
                      />
                    )}
                    <h3 className="font-semibold text-white truncate text-lg">{playlist.name}</h3>
                    <p className="text-spotify-green text-sm font-medium">{playlist.tracks.total} tracks</p>
                    <p className="text-gray-400 text-xs truncate mt-1">
                      by {playlist.owner.display_name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;