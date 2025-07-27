// Placeholder for teacher controller
const { db, initDB } = require('../db/lowdb');
const { v4: uuidv4 } = require('uuid');

exports.getCourses = async (req, res) => {
  const teacherId = req.params.id;
  try {
    await initDB();
    const courses = db.data.courses.filter(c => c.instructorId === teacherId);
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createCourse = async (req, res) => {
  const { title, description, lessons } = req.body;
  const teacherId = req.user.id;
  if (!title || !description) return res.status(400).json({ message: 'Missing fields' });
  try {
    await initDB();
    const newCourse = {
      id: uuidv4(),
      title,
      description,
      instructorId: teacherId,
      lessons: lessons || []
    };
    db.data.courses.push(newCourse);
    await db.write();
    res.status(201).json({ courseId: newCourse.id, message: 'Course created' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateCourse = async (req, res) => {
  const courseId = req.params.id;
  const { title, description, lessons } = req.body;
  try {
    await initDB();
    const course = db.data.courses.find(c => c.id === courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (title) course.title = title;
    if (description) course.description = description;
    if (lessons) course.lessons = lessons;
    await db.write();
    res.json({ message: 'Course updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteCourse = async (req, res) => {
  const courseId = req.params.id;
  try {
    await initDB();
    db.data.courses = db.data.courses.filter(c => c.id !== courseId);
    await db.write();
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createAssignment = async (req, res) => {
  const { courseId, title, description, dueDate, type } = req.body;
  if (!courseId || !title || !type) return res.status(400).json({ message: 'Missing fields' });
  try {
    await initDB();
    const assignment = {
      id: uuidv4(),
      courseId,
      title,
      description,
      dueDate,
      type,
      submissions: []
    };
    db.data.assignments.push(assignment);
    await db.write();
    res.status(201).json({ assignmentId: assignment.id, message: 'Assignment created' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getSubmissions = async (req, res) => {
  const assignmentId = req.params.id;
  try {
    await initDB();
    const assignment = db.data.assignments.find(a => a.id === assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    res.json(assignment.submissions || []);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.gradeSubmission = async (req, res) => {
  const assignmentId = req.params.id;
  const studentId = req.params.studentId;
  const { grade, feedback } = req.body;
  try {
    await initDB();
    const assignment = db.data.assignments.find(a => a.id === assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    const submission = assignment.submissions.find(s => s.studentId === studentId);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    submission.grade = grade;
    submission.feedback = feedback;
    await db.write();
    res.json({ message: 'Submission graded' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getStudents = async (req, res) => {
  const teacherId = req.params.id;
  try {
    await initDB();
    const courses = db.data.courses.filter(c => c.instructorId === teacherId).map(c => c.id);
    const enrollments = db.data.enrollments.filter(e => courses.includes(e.courseId));
    const students = enrollments.map(e => db.data.users.find(u => u.id === e.studentId)).filter(Boolean);
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAnalytics = async (req, res) => {
  const teacherId = req.params.id;
  try {
    await initDB();
    const courses = db.data.courses.filter(c => c.instructorId === teacherId).map(c => c.id);
    const enrollments = db.data.enrollments.filter(e => courses.includes(e.courseId));
    const totalStudents = new Set(enrollments.map(e => e.studentId)).size;
    const avgGrades = enrollments.reduce((acc, e) => {
      if (e.grades && e.grades.length) {
        acc.total += e.grades.reduce((s, g) => s + (g.score || 0), 0);
        acc.count += e.grades.length;
      }
      return acc;
    }, { total: 0, count: 0 });
    const avg = avgGrades.count ? avgGrades.total / avgGrades.count : 0;
    res.json({ totalStudents, avgGrade: avg });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
