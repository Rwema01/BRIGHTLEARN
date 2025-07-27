// Placeholder for course controller
const { db, initDB } = require('../db/lowdb');

exports.getAllCourses = async (req, res) => {
  try {
    await initDB();
    const courses = db.data.courses.map(course => {
      const instructor = db.data.users.find(u => u.id === course.instructorId);
      return {
        id: course.id,
        title: course.title,
        description: course.description,
        instructor: instructor ? { id: instructor.id, name: instructor.name, email: instructor.email } : null
      };
    });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
