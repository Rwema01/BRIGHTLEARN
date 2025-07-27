const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');


const auth = require('../middleware/auth');
// Student submits assignment
router.post('/:id/submit', auth.verifyToken, auth.requireRole('student'), assignmentController.submitAssignment);

module.exports = router;
