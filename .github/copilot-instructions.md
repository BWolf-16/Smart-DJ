# Smart DJ - AI-Powered Music Application

## Project Overview
Smart DJ is a full-stack web application that integrates AI (GPT API) with Spotify and YouTube Music APIs. The app analyzes user music history, provides mood-based recommendations, and works on PC, iOS, and Android.

## Technology Stack
- Frontend: React with TypeScript
- Backend: Node.js with Express
- Mobile: React Native (Expo)
- Database: MongoDB
- AI: OpenAI GPT API
- Music APIs: Spotify Web API, YouTube Music API
- Authentication: OAuth 2.0

## Development Guidelines
When working on this project:

1. **Architecture**: Follow the established monorepo structure with separate packages for frontend, backend, mobile, and shared code.

2. **API Integration**: 
   - Use the provided API service classes for external integrations
   - Implement proper error handling and retry logic
   - Cache responses where appropriate

3. **State Management**: 
   - Use Redux Toolkit for complex state management
   - Use React Query for server state and caching
   - Keep local component state for UI-only concerns

4. **Styling**:
   - Frontend: Use Tailwind CSS with custom components
   - Mobile: Use React Native Paper with custom theme

5. **Type Safety**: Leverage the shared types from @smart-dj/shared package across all applications

6. **Testing**: Write unit tests for utilities, integration tests for API endpoints, and component tests for UI

## Project Status
- [x] Project structure created
- [x] Package configuration completed
- [x] Development environment setup
- [x] Basic project scaffolding
- [ ] Backend API implementation
- [ ] Frontend React app implementation
- [ ] Mobile app implementation
- [ ] AI service integration
- [ ] Music API integration
- [ ] Database models and migrations
- [ ] Authentication system
- [ ] Recommendation engine
- [ ] Testing suite
- [ ] Deployment configuration

## Getting Started
1. Copy `.env.example` to `.env` and fill in your API keys
2. Run `npm install` to install dependencies
3. Start development with `npm run dev`
4. Access the frontend at http://localhost:3000
5. Backend API available at http://localhost:3001

## Key Features to Implement
- User authentication with Spotify/YouTube OAuth
- Music preference analysis using AI
- Mood-based playlist generation
- Real-time music synchronization
- Cross-platform mobile app
- Social features and playlist sharing