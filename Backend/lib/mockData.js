// Initial mock data for testing
module.exports = {
  users: [
    { id: '1', name: 'Alice Student', email: 'alice@student.com', password: '$2b$10$hash', role: 'student', status: 'active' },
    { id: '2', name: 'Bob Teacher', email: 'bob@teacher.com', password: '$2b$10$hash', role: 'teacher', schoolEmail: 'bob@school.com', status: 'active' },
    { id: '3', name: 'Carol Admin', email: 'carol@admin.com', password: '$2b$10$hash', role: 'admin', status: 'active' }
  ],
  courses: [
    { id: 'c1', title: 'Math 101', description: 'Basic Math', instructorId: '2', lessons: [{ id: 'l1', title: 'Intro', content: '...' }] }
  ],
  enrollments: [
    { id: 'e1', studentId: '1', courseId: 'c1', progress: 50, grades: [{ assignmentId: 'a1', score: 85, feedback: 'Good' }] }
  ],
  assignments: [
    { id: 'a1', courseId: 'c1', title: 'Quiz 1', description: 'First quiz', dueDate: '2025-08-01', type: 'quiz', submissions: [{ studentId: '1', content: 'Answer', grade: 85, feedback: 'Good' }] }
  ],
  disciplinary: [],
  notifications: [
    { id: 'n1', studentId: '1', message: 'Assignment due soon', date: '2025-07-28' }
  ],
  auditLogs: []
};
