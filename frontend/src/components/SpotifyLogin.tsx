import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const SpotifyLogin: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Handle OAuth callback
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (token) {
      // Store token and redirect to dashboard
      localStorage.setItem('authToken', token);
      // You can dispatch to Redux store here
      navigate('/dashboard');
    } else if (error) {
      console.error('Spotify authentication failed:', error);
    }
  }, [searchParams, navigate]);

  const handleSpotifyLogin = () => {
    setIsLoading(true);
    // Redirect to backend Spotify OAuth endpoint
    window.location.href = `http://127.0.0.1:8080/api/auth/spotify`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to Smart DJ
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Connect your Spotify account to get AI-powered music recommendations
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <button
            onClick={handleSpotifyLogin}
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.32 11.28-1.08 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            </span>
            {isLoading ? 'Connecting...' : 'Connect with Spotify'}
          </button>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Or continue with email</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="mt-3 group relative w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Email Login
            </button>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            By connecting your Spotify account, you agree to our{' '}
            <a href="/privacy" className="text-green-600 hover:text-green-500">
              Privacy Policy
            </a>{' '}
            and{' '}
            <a href="/terms" className="text-green-600 hover:text-green-500">
              Terms of Service
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SpotifyLogin;