const quizzes = require('../data/quizzes.json');

exports.getCourses = (req, res) => {
    const courses = quizzes.map(q => ({ id: q.id, title: q.title }));
    res.json(courses);
};

exports.getQuiz = (req, res) => {
    const course = quizzes.find(q => q.id === req.params.courseId);
    res.json(course || {});
};

exports.submitQuiz = (req, res) => {
    const { answers, correctAnswers } = req.body;
    const score = answers.filter((a, i) => a === correctAnswers[i]).length;
    const percent = Math.round((score / correctAnswers.length) * 100);
    const result = percent >= 75 ? "Passed" : "Failed";
    res.json({ score: percent, result });
};
