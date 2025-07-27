// Placeholder for student controller
const { db, initDB } = require('../db/lowdb');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

exports.getCourses = async (req, res) => {
  const studentId = req.params.id;
  try {
    await initDB();
    const enrollments = db.data.enrollments.filter(e => e.studentId === studentId);
    const courses = enrollments.map(e => {
      const course = db.data.courses.find(c => c.id === e.courseId);
      return course ? {
        id: course.id,
        title: course.title,
        description: course.description,
        progress: e.progress,
        grades: e.grades
      } : null;
    }).filter(Boolean);
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getGrades = async (req, res) => {
  const studentId = req.params.id;
  try {
    await initDB();
    const enrollments = db.data.enrollments.filter(e => e.studentId === studentId);
    let gradesTable = [];
    enrollments.forEach(e => {
      const course = db.data.courses.find(c => c.id === e.courseId);
      if (course && e.grades) {
        e.grades.forEach(g => {
          const assignment = db.data.assignments.find(a => a.id === g.assignmentId);
          gradesTable.push({
            course: course.title,
            assignment: assignment ? assignment.title : g.assignmentId,
            type: assignment ? assignment.type : '',
            score: g.score,
            feedback: g.feedback
          });
        });
      }
    });
    res.json(gradesTable);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.enrollCourse = async (req, res) => {
  const studentId = req.params.id;
  const { courseId } = req.body;
  if (!courseId) return res.status(400).json({ message: 'Missing courseId' });
  try {
    await initDB();
    const already = db.data.enrollments.find(e => e.studentId === studentId && e.courseId === courseId);
    if (already) return res.status(409).json({ message: 'Already enrolled' });
    const enrollment = {
      id: uuidv4(),
      studentId,
      courseId,
      progress: 0,
      grades: []
    };
    db.data.enrollments.push(enrollment);
    await db.write();
    res.status(201).json({ enrollmentId: enrollment.id, message: 'Enrolled successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getNotifications = async (req, res) => {
  const studentId = req.params.id;
  try {
    await initDB();
    const notifications = db.data.notifications.filter(n => n.studentId === studentId);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  const studentId = req.params.id;
  const { name, email, password } = req.body;
  try {
    await initDB();
    const user = db.data.users.find(u => u.id === studentId && u.role === 'student');
    if (!user) return res.status(404).json({ message: 'Student not found' });
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);
    await db.write();
    res.json({ message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
