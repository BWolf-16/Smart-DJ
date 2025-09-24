import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        navigate('/');
        return;
      }

      try {
        const response = await fetch('http://localhost:3001/api/auth/spotify/profile', {
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

          {/* AI Music Assistant */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                AI Music Assistant
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 mb-4">
                  Ask your AI DJ for music recommendations! Try phrases like:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>"I need music for studying"</li>
                  <li>"Play something to kill the final boss"</li>
                  <li>"Chill vibes for the weekend"</li>
                  <li>"High energy workout playlist"</li>
                </ul>
                <button className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                  Start AI Session
                </button>
              </div>
            </div>
          </div>

          {/* Recent Playlists */}
          {userData?.spotify.playlists && userData.spotify.playlists.length > 0 && (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Your Playlists
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userData.spotify.playlists.slice(0, 6).map((playlist: any) => (
                    <div key={playlist.id} className="border rounded-lg p-4">
                      {playlist.images?.[0] && (
                        <img
                          src={playlist.images[0].url}
                          alt={playlist.name}
                          className="w-full h-32 object-cover rounded mb-2"
                        />
                      )}
                      <h3 className="font-medium text-sm">{playlist.name}</h3>
                      <p className="text-xs text-gray-500">
                        {playlist.tracks.total} tracks
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