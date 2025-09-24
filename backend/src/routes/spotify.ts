import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

// Connect Spotify account
router.post('/connect', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Spotify connect endpoint - to be implemented'
    }
  });
}));

// Get Spotify profile
router.get('/profile', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Spotify profile endpoint - to be implemented'
    }
  });
}));

// Get user playlists
router.get('/playlists', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Spotify playlists endpoint - to be implemented'
    }
  });
}));

// Search Spotify
router.get('/search', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Spotify search endpoint - to be implemented'
    }
  });
}));

export default router;