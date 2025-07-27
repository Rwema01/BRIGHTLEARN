// Placeholder for admin controller
const { db, initDB } = require('../db/lowdb');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

exports.getTeachers = async (req, res) => {
  try {
    await initDB();
    const teachers = db.data.users.filter(u => u.role === 'teacher');
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createTeacher = async (req, res) => {
  const { name, email, password, schoolEmail } = req.body;
  if (!name || !email || !password || !schoolEmail) return res.status(400).json({ message: 'Missing fields' });
  try {
    await initDB();
    const exists = db.data.users.find(u => u.email === email);
    if (exists) return res.status(409).json({ message: 'Teacher already exists' });
    const hashed = await bcrypt.hash(password, 10);
    const teacher = {
      id: uuidv4(),
      name,
      email,
      password: hashed,
      role: 'teacher',
      schoolEmail,
      status: 'active'
    };
    db.data.users.push(teacher);
    await db.write();
    res.status(201).json({ teacherId: teacher.id, message: 'Teacher created' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateTeacher = async (req, res) => {
  const teacherId = req.params.id;
  const { name, email, schoolEmail } = req.body;
  try {
    await initDB();
    const teacher = db.data.users.find(u => u.id === teacherId && u.role === 'teacher');
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    if (name) teacher.name = name;
    if (email) teacher.email = email;
    if (schoolEmail) teacher.schoolEmail = schoolEmail;
    await db.write();
    res.json({ message: 'Teacher updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deactivateTeacher = async (req, res) => {
  const teacherId = req.params.id;
  try {
    await initDB();
    const teacher = db.data.users.find(u => u.id === teacherId && u.role === 'teacher');
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    teacher.status = 'inactive';
    await db.write();
    res.json({ message: 'Teacher deactivated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getStudents = async (req, res) => {
  try {
    await initDB();
    const students = db.data.users.filter(u => u.role === 'student');
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateStudent = async (req, res) => {
  const studentId = req.params.id;
  const { name, email } = req.body;
  try {
    await initDB();
    const student = db.data.users.find(u => u.id === studentId && u.role === 'student');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    if (name) student.name = name;
    if (email) student.email = email;
    await db.write();
    res.json({ message: 'Student updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deactivateStudent = async (req, res) => {
  const studentId = req.params.id;
  try {
    await initDB();
    const student = db.data.users.find(u => u.id === studentId && u.role === 'student');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    student.status = 'inactive';
    await db.write();
    res.json({ message: 'Student deactivated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.recordDisciplinary = async (req, res) => {
  const { studentId, description, action } = req.body;
  if (!studentId || !description || !action) return res.status(400).json({ message: 'Missing fields' });
  try {
    await initDB();
    const record = {
      id: uuidv4(),
      studentId,
      description,
      date: new Date().toISOString(),
      action
    };
    db.data.disciplinary.push(record);
    await db.write();
    res.status(201).json({ recordId: record.id, message: 'Disciplinary action recorded' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCourses = async (req, res) => {
  try {
    await initDB();
    res.json(db.data.courses);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createCourse = async (req, res) => {
  const { title, description, instructorId, lessons } = req.body;
  if (!title || !description || !instructorId) return res.status(400).json({ message: 'Missing fields' });
  try {
    await initDB();
    const course = {
      id: uuidv4(),
      title,
      description,
      instructorId,
      lessons: lessons || []
    };
    db.data.courses.push(course);
    await db.write();
    res.status(201).json({ courseId: course.id, message: 'Course created' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateCourse = async (req, res) => {
  const courseId = req.params.id;
  const { title, description, instructorId, lessons } = req.body;
  try {
    await initDB();
    const course = db.data.courses.find(c => c.id === courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (title) course.title = title;
    if (description) course.description = description;
    if (instructorId) course.instructorId = instructorId;
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

exports.getAnalytics = async (req, res) => {
  try {
    await initDB();
    const totalUsers = db.data.users.length;
    const totalCourses = db.data.courses.length;
    const activeCourses = db.data.courses.filter(c => c.lessons && c.lessons.length > 0).length;
    res.json({ totalUsers, totalCourses, activeCourses });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    await initDB();
    res.json(db.data.auditLogs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
