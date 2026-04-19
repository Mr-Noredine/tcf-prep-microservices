import express from 'express';
import { 
  getUserProgress, 
  getUserAttempts, 
  getUserStats,
  getProgressTimeline,
  getRecommendations
} from '../controllers/usersController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected (require authentication)

// GET /api/users/progress
router.get('/progress', protect, getUserProgress);

// GET /api/users/attempts
router.get('/attempts', protect, getUserAttempts);

// GET /api/users/stats
router.get('/stats', protect, getUserStats);

// GET /api/users/timeline
router.get('/timeline', protect, getProgressTimeline);

// GET /api/users/recommendations
router.get('/recommendations', protect, getRecommendations);

export default router;