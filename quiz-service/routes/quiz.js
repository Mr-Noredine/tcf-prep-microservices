import express from 'express';
import { getQuizQuestions, submitQuizAttempt } from '../controllers/quizController.js';

const router = express.Router();

// GET /api/quiz?category=grammar&level=A1&limit=25
router.get('/', getQuizQuestions);

// POST /api/quiz/attempt
router.post('/attempt', submitQuizAttempt);

export default router;
