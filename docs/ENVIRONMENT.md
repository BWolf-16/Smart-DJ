# Environment Setup Guide

## Single Configuration File
This project uses a **single `.env` file** at the root level that serves both backend and frontend applications.

## Setup Instructions

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Fill in your API credentials:**
   ```bash
   # Spotify Developer Dashboard: https://developer.spotify.com/dashboard
   SPOTIFY_CLIENT_ID=your_actual_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_actual_spotify_client_secret
   
   # OpenAI Platform: https://platform.openai.com/api-keys
   OPENAI_API_KEY=your_actual_openai_api_key
   
   # Generate secure random strings for these:
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
   SESSION_SECRET=your_session_secret_here_also_make_it_random
   ```

## How It Works

### Backend Variables
- Read directly by Node.js using `dotenv`
- Examples: `SPOTIFY_CLIENT_SECRET`, `MONGODB_URI`, `JWT_SECRET`

### Frontend Variables (Vite)
- Must be prefixed with `VITE_`
- Exposed to the browser (only include public values!)
- Examples: `VITE_BACKEND_URL`, `VITE_APP_NAME`

## Security Notes

⚠️ **NEVER** put sensitive data in `VITE_` variables as they're exposed to the browser!

✅ **Safe for VITE_:**
- API endpoints URLs
- App names/titles  
- Public configuration flags
- Spotify Client ID (public by design)

❌ **NEVER in VITE_:**
- API secrets
- Database credentials
- JWT secrets
- Private keys

## Development vs Production

Create different `.env` files for different environments:
- `.env` - Development (git-ignored)
- `.env.example` - Template (committed to git)
- `.env.production` - Production secrets (never commit!)