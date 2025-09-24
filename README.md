# Smart DJ - AI-Powered Music Application

A comprehensive AI-powered music application that integrates with Spotify and YouTube Music to provide intelligent music recommendations based on user preferences, mood, and listening history.

## Features

### Core Features
- 🎵 **Multi-Platform Music Integration**: Connect with Spotify and YouTube Music
- 🤖 **AI-Powered Recommendations**: Use GPT API for intelligent music suggestions
- 📊 **Listening History Analysis**: Analyze user's music preferences and patterns
- 🎭 **Mood-Based Recommendations**: Get music suggestions based on current mood or activity
- 🎮 **Context-Aware Playlists**: "I need music for studying" or "Kill final boss" requests
- 🔄 **Smart Music Control**: AI-driven playlist management and song selection

### Platform Support
- 💻 **Web Application**: Full-featured web interface
- 📱 **iOS**: Native mobile experience
- 🤖 **Android**: Native mobile experience

## Technology Stack

### Frontend
- **Web**: React 18 with TypeScript
- **Mobile**: React Native with Expo
- **Styling**: Tailwind CSS, React Native Elements
- **State Management**: Redux Toolkit

### Backend
- **Runtime**: Node.js with Express
- **Database**: MongoDB with Mongoose
- **Authentication**: OAuth 2.0 (Spotify, Google)
- **AI Integration**: OpenAI GPT API
- **Music APIs**: Spotify Web API, YouTube Music API

### DevOps & Tools
- **Package Manager**: npm/yarn
- **Build Tools**: Vite (web), Metro (mobile)
- **Testing**: Jest, React Testing Library
- **Deployment**: Docker, AWS/Vercel

## Project Structure

```
smart-dj/
├── frontend/                 # React web application
├── mobile/                   # React Native mobile app
├── backend/                  # Node.js API server
├── shared/                   # Shared types and utilities
├── docs/                     # Documentation
└── docker/                   # Docker configurations
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB
- Spotify Developer Account
- Google Developer Account (for YouTube Music)
- OpenAI API Key

### Installation

1. Clone the repository
```bash
git clone https://github.com/BWolf-16/Smart-DJ.git
cd smart-dj
```

2. Install dependencies for all packages
```bash
npm run install:all
```

3. Set up environment variables
```bash
cp .env.example .env
# Fill in your API keys and configurations
```

4. Start the development servers
```bash
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# AI Configuration
OPENAI_API_KEY=your_openai_api_key

# Spotify API
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# YouTube Music API
YOUTUBE_API_KEY=your_youtube_api_key

# Database
MONGODB_URI=mongodb://localhost:27017/smart-dj

# Authentication
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret

# Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:3000
```

## API Endpoints

### Authentication
- `POST /api/auth/spotify` - Spotify OAuth
- `POST /api/auth/youtube` - YouTube OAuth
- `GET /api/auth/me` - Get current user

### Music Services
- `GET /api/spotify/profile` - Get Spotify profile
- `GET /api/spotify/playlists` - Get user playlists
- `GET /api/youtube/history` - Get listening history

### AI Recommendations
- `POST /api/ai/recommend` - Get AI-powered recommendations
- `POST /api/ai/mood-playlist` - Create mood-based playlist
- `POST /api/ai/analyze-preferences` - Analyze user preferences

## Development

### Running the Application
```bash
# Start all services
npm run dev

# Start individual services
npm run dev:frontend    # Web app (http://localhost:3000)
npm run dev:backend     # API server (http://localhost:3001)
npm run dev:mobile      # Mobile app with Expo
```

### Building for Production
```bash
npm run build
npm run build:frontend
npm run build:backend
npm run build:mobile
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, email support@smart-dj.com or create an issue in the GitHub repository.