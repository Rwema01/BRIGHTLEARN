const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

router.use(auth.verifyToken, auth.requireRole('admin'));
router.get('/teachers', adminController.getTeachers);
router.post('/teachers', adminController.createTeacher);
router.patch('/teachers/:id', adminController.updateTeacher);
router.delete('/teachers/:id', adminController.deactivateTeacher);
router.get('/students', adminController.getStudents);
router.patch('/students/:id', adminController.updateStudent);
router.delete('/students/:id', adminController.deactivateStudent);
router.post('/disciplinary', adminController.recordDisciplinary);
router.get('/courses', adminController.getCourses);
router.post('/courses', adminController.createCourse);
router.patch('/courses/:id', adminController.updateCourse);
router.delete('/courses/:id', adminController.deleteCourse);
router.get('/analytics', adminController.getAnalytics);
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
