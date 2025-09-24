# Contributing to Smart DJ

Thank you for your interest in contributing to Smart DJ! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm 9+
- Git
- MongoDB (for local development)
- API Keys (Spotify, YouTube Music, OpenAI)

### Setup Development Environment

1. **Fork and Clone**
   ```bash
   git clone https://github.com/BWolf-16/Smart-DJ.git
   cd Smart-dj
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Add your API keys to .env file
   ```

4. **Start Development**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
smart-dj/
├── frontend/     # React web app
├── backend/      # Node.js API server  
├── mobile/       # React Native app
├── shared/       # Shared types & utils
└── docs/         # Documentation
```

## 🛠 Development Workflow

### Branch Naming Convention
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(backend): add Spotify OAuth integration
fix(frontend): resolve playlist loading issue
docs(api): update recommendation endpoint docs
```

## 🧪 Testing

### Running Tests
```bash
npm test              # All tests
npm run test:frontend # Frontend tests only
npm run test:backend  # Backend tests only
npm run test:shared   # Shared package tests
```

### Test Requirements
- All new features must include tests
- Maintain minimum 80% code coverage
- API endpoints require integration tests
- UI components require component tests

## 📝 Code Standards

### TypeScript
- Use strict TypeScript configuration
- Leverage shared types from `@smart-dj/shared`
- Prefer interfaces over types for object shapes
- Use proper type annotations

### Code Style
- Use ESLint and Prettier configurations
- Follow existing code patterns
- Use meaningful variable names
- Add JSDoc comments for public APIs

### Example Code Style
```typescript
interface UserPreferences {
  favoriteGenres: string[];
  preferredMood: MoodType[];
}

/**
 * Analyzes user listening history to determine preferences
 * @param userId - The user's unique identifier
 * @param timeRange - Analysis time range
 * @returns Promise with user preferences
 */
async function analyzeUserPreferences(
  userId: string,
  timeRange: TimeRange = 'medium_term'
): Promise<UserPreferences> {
  // Implementation
}
```

## 🎯 Contributing Areas

### High Priority
- [ ] Complete backend API implementation
- [ ] Frontend music player component
- [ ] AI recommendation engine
- [ ] Spotify API integration
- [ ] User authentication system

### Medium Priority  
- [ ] YouTube Music integration
- [ ] Mobile app completion
- [ ] Real-time synchronization
- [ ] Analytics dashboard
- [ ] Playlist management

### Low Priority
- [ ] Social features
- [ ] Advanced AI features
- [ ] Performance optimizations
- [ ] UI/UX improvements
- [ ] Documentation updates

## 🔧 API Development

### Backend Guidelines
- Use Express.js with TypeScript
- Implement proper error handling
- Add input validation with Zod
- Include comprehensive logging
- Follow RESTful conventions

### Example API Endpoint
```typescript
import { Request, Response } from 'express';
import { validateRecommendationRequest } from '@smart-dj/shared';

export const getRecommendations = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const request = validateRecommendationRequest(req.body);
    const recommendations = await aiService.getRecommendations(request);
    
    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    next(error);
  }
};
```

## 🎨 Frontend Development

### React Guidelines
- Use functional components with hooks
- Implement proper error boundaries
- Use React Query for server state
- Follow component composition patterns
- Implement proper accessibility

### Component Example
```typescript
interface MusicPlayerProps {
  track: Track;
  isPlaying: boolean;
  onPlayPause: () => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  track,
  isPlaying,
  onPlayPause
}) => {
  return (
    <div className="music-player">
      <TrackInfo track={track} />
      <PlayButton isPlaying={isPlaying} onClick={onPlayPause} />
      <ProgressBar track={track} />
    </div>
  );
};
```

## 📱 Mobile Development

### React Native Guidelines
- Use Expo managed workflow
- Implement platform-specific code when needed
- Follow React Native best practices
- Test on both iOS and Android
- Use React Native Paper for UI components

## 🔐 Security Guidelines

- Never commit API keys or secrets
- Use environment variables for configuration
- Implement proper input validation
- Follow OAuth security best practices
- Use HTTPS in production

## 📚 Documentation

### Required Documentation
- API endpoints (update `docs/API.md`)
- Component usage examples
- Setup and deployment guides
- Architecture decisions

### Documentation Format
```markdown
## Component Name

Brief description of the component.

### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| prop1 | string | Yes | Description |

### Example
\`\`\`typescript
<Component prop1="value" />
\`\`\`
```

## 🐛 Bug Reports

### Bug Report Template
```markdown
**Describe the bug**
Clear description of the bug.

**To Reproduce**
Steps to reproduce the behavior.

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
 - OS: [e.g. Windows, macOS]
 - Browser: [e.g. Chrome, Firefox]
 - Version: [e.g. 1.0.0]
```

## 🚀 Feature Requests

### Feature Request Template
```markdown
**Is your feature request related to a problem?**
Clear description of the problem.

**Describe the solution you'd like**
Clear description of what you want to happen.

**Describe alternatives you've considered**
Alternative solutions or features considered.

**Additional context**
Any other context about the feature request.
```

## 🔄 Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write code following our standards
   - Add tests for new functionality
   - Update documentation as needed

3. **Test Your Changes**
   ```bash
   npm test
   npm run lint
   npm run build
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

5. **Push to Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Use the PR template
   - Link related issues
   - Add screenshots for UI changes
   - Request review from maintainers

### PR Review Checklist
- [ ] Code follows style guidelines
- [ ] Tests pass and coverage is maintained
- [ ] Documentation is updated
- [ ] No breaking changes (or properly documented)
- [ ] Security considerations addressed

## 🏷 Release Process

### Version Numbering
We follow [Semantic Versioning](https://semver.org/):
- `MAJOR.MINOR.PATCH`
- Major: Breaking changes
- Minor: New features (backward compatible)
- Patch: Bug fixes (backward compatible)

## 📞 Getting Help

- **GitHub Issues**: Bug reports and feature requests
- **Discussions**: General questions and ideas
- **Email**: [BWolf-16@github.com] for security issues

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Acknowledgments

Thank you to all contributors who help make Smart DJ better!

---

Happy coding! 🎵