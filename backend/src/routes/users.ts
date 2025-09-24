import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

// Get user profile
router.get('/profile', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'User profile endpoint - to be implemented'
    }
  });
}));

// Update user profile
router.put('/profile', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Update profile endpoint - to be implemented'
    }
  });
}));

// Update user preferences
router.put('/preferences', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Update preferences endpoint - to be implemented'
    }
  });
}));

export default router;