const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const auth = require('../middleware/auth');

router.use(auth.verifyToken, auth.requireRole('student'));
router.get('/:id/courses', studentController.getCourses);
router.get('/:id/grades', studentController.getGrades);
router.post('/:id/enroll', studentController.enrollCourse);
router.get('/:id/notifications', studentController.getNotifications);
router.patch('/:id/profile', studentController.updateProfile);

module.exports = router;
