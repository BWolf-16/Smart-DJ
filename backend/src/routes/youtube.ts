import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

// Connect YouTube account
router.post('/connect', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'YouTube connect endpoint - to be implemented'
    }
  });
}));

// Get listening history
router.get('/history', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'YouTube history endpoint - to be implemented'
    }
  });
}));

// Search YouTube Music
router.get('/search', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'YouTube search endpoint - to be implemented'
    }
  });
}));

export default router;