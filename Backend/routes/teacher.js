const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const auth = require('../middleware/auth');

router.use(auth.verifyToken, auth.requireRole('teacher'));
router.get('/:id/courses', teacherController.getCourses);
router.post('/courses', teacherController.createCourse);
router.patch('/courses/:id', teacherController.updateCourse);
router.delete('/courses/:id', teacherController.deleteCourse);
router.post('/assignments', teacherController.createAssignment);
router.get('/assignments/:id/submissions', teacherController.getSubmissions);
router.patch('/assignments/:id/submissions/:studentId', teacherController.gradeSubmission);
router.get('/:id/students', teacherController.getStudents);
router.get('/:id/analytics', teacherController.getAnalytics);

module.exports = router;
