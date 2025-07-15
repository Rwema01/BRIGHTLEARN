const express = require('express');
const { getCourses, getQuiz, submitQuiz } = require('../controllers/quizController');
const router = express.Router();

router.get('/courses', getCourses);
router.get('/quiz/:courseId', getQuiz);
router.post('/submit', submitQuiz);

module.exports = router;