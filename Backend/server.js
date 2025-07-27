const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database paths
const USERS_DB = path.join(__dirname, 'data', 'users.json');
const COURSES_DB = path.join(__dirname, 'data', 'courses.json');
const PROGRESS_DB = path.join(__dirname, 'data', 'progress.json');
const QUIZZES_DB = path.join(__dirname, 'data', 'quizzes.json');
const GRADES_DB = path.join(__dirname, 'data', 'grades.json');
const ACTIVITIES_DB = path.join(__dirname, 'data', 'activities.json');
const ACHIEVEMENTS_DB = path.join(__dirname, 'data', 'achievements.json');

// Helper functions
async function readJSON(filePath) {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
}

async function writeJSON(filePath, data) {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// Authentication Routes
app.post('/api/register', async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        const users = await readJSON(USERS_DB);

        if (users.users.some(user => user.email === email)) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: Date.now().toString(),
            fullName,
            email,
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };

        users.users.push(newUser);
        await writeJSON(USERS_DB, users);

        const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET || 'your-secret-key');
        res.status(201).json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const users = await readJSON(USERS_DB);
        const user = users.users.find(u => u.email === email);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'your-secret-key');
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Course Routes
app.get('/api/courses', async (req, res) => {
    try {
        const courses = await readJSON(COURSES_DB);
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Progress Routes
app.post('/api/progress', async (req, res) => {
    try {
        const { userId, courseId, progress } = req.body;
        const progressData = await readJSON(PROGRESS_DB);
        
        const userProgress = {
            userId,
            courseId,
            progress,
            timestamp: new Date().toISOString()
        };

        progressData.progress.push(userProgress);
        await writeJSON(PROGRESS_DB, progressData);
        
        res.status(201).json(userProgress);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/progress/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const progressData = await readJSON(PROGRESS_DB);
        const userProgress = progressData.progress.filter(p => p.userId === userId);
        res.json(userProgress);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Quiz Routes
app.get('/api/quizzes/course/:courseId', async (req, res) => {
    try {
        const { courseId } = req.params;
        const quizzesData = await readJSON(QUIZZES_DB);
        const courseQuizzes = quizzesData.quizzes.filter(q => q.courseId === courseId);
        
        // Remove correctAnswer from response for security
        const sanitizedQuizzes = courseQuizzes.map(quiz => ({
            ...quiz,
            questions: quiz.questions.map(q => ({
                ...q,
                correctAnswer: undefined
            }))
        }));
        
        res.json(sanitizedQuizzes);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/quiz/:quizId', async (req, res) => {
    try {
        const { quizId } = req.params;
        const quizzesData = await readJSON(QUIZZES_DB);
        const quiz = quizzesData.quizzes.find(q => q.id === quizId);
        
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Remove correctAnswer from response
        const sanitizedQuiz = {
            ...quiz,
            questions: quiz.questions.map(q => ({
                ...q,
                correctAnswer: undefined
            }))
        };
        
        res.json(sanitizedQuiz);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/quiz/:quizId/submit', async (req, res) => {
    try {
        const { quizId } = req.params;
        const { userId, answers } = req.body;

        // Get quiz data
        const quizzesData = await readJSON(QUIZZES_DB);
        const quiz = quizzesData.quizzes.find(q => q.id === quizId);

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Calculate grade
        let correctAnswers = 0;
        const totalQuestions = quiz.questions.length;

        quiz.questions.forEach((question, index) => {
            if (answers[index] === question.correctAnswer) {
                correctAnswers++;
            }
        });

        const score = (correctAnswers / totalQuestions) * 100;

        // Save grade
        const gradesData = await readJSON(GRADES_DB);
        const newGrade = {
            id: Date.now().toString(),
            userId,
            quizId,
            courseId: quiz.courseId,
            score,
            correctAnswers,
            totalQuestions,
            submittedAt: new Date().toISOString()
        };

        gradesData.grades.push(newGrade);
        await writeJSON(GRADES_DB, gradesData);

        res.status(201).json(newGrade);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Grades Routes
app.get('/api/grades/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const gradesData = await readJSON(GRADES_DB);
        const userGrades = gradesData.grades.filter(g => g.userId === userId);
        res.json(userGrades);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/grades/course/:courseId/user/:userId', async (req, res) => {
    try {
        const { userId, courseId } = req.params;
        const gradesData = await readJSON(GRADES_DB);
        const courseGrades = gradesData.grades.filter(
            g => g.userId === userId && g.courseId === courseId
        );
        
        // Calculate average grade for the course
        const averageGrade = courseGrades.length > 0
            ? courseGrades.reduce((sum, grade) => sum + grade.score, 0) / courseGrades.length
            : 0;

        res.json({
            grades: courseGrades,
            averageGrade,
            totalQuizzes: courseGrades.length
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Profile Routes
app.get('/api/user/:userId/profile', async (req, res) => {
    try {
        const { userId } = req.params;
        const users = await readJSON(USERS_DB);
        const user = users.users.find(u => u.id === userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Remove sensitive information
        const { password, ...userProfile } = user;
        res.json(userProfile);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/user/:userId/profile', async (req, res) => {
    try {
        const { userId } = req.params;
        const updates = req.body;
        const users = await readJSON(USERS_DB);
        const userIndex = users.users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Don't allow password update through this endpoint
        const { password, ...allowedUpdates } = updates;
        users.users[userIndex] = { ...users.users[userIndex], ...allowedUpdates };
        await writeJSON(USERS_DB, users);

        const { password: _, ...updatedProfile } = users.users[userIndex];
        res.json(updatedProfile);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Activity Log Routes
app.post('/api/activity', async (req, res) => {
    try {
        const { userId, type, description } = req.body;
        const activities = await readJSON(ACTIVITIES_DB);
        
        const newActivity = {
            id: Date.now().toString(),
            userId,
            type,
            description,
            timestamp: new Date().toISOString()
        };

        activities.activities.push(newActivity);
        await writeJSON(ACTIVITIES_DB, activities);
        res.status(201).json(newActivity);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/activity/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const activities = await readJSON(ACTIVITIES_DB);
        const userActivities = activities.activities
            .filter(a => a.userId === userId)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        res.json(userActivities);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Achievement Routes
app.get('/api/achievements/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const achievements = await readJSON(ACHIEVEMENTS_DB);
        const userAchievements = achievements.achievements
            .filter(a => a.userId === userId);
        res.json(userAchievements);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/achievements/check', async (req, res) => {
    try {
        const { userId } = req.body;
        const achievements = await readJSON(ACHIEVEMENTS_DB);
        const grades = await readJSON(GRADES_DB);
        const progress = await readJSON(PROGRESS_DB);

        // Check for new achievements
        const userGrades = grades.grades.filter(g => g.userId === userId);
        const userProgress = progress.progress.filter(p => p.userId === userId);
        
        const newAchievements = [];

        // Example achievement checks
        if (userGrades.length >= 5) {
            newAchievements.push({
                id: Date.now().toString(),
                userId,
                type: 'QUIZ_MASTER',
                title: 'Quiz Master',
                description: 'Completed 5 quizzes',
                earnedAt: new Date().toISOString()
            });
        }

        if (userGrades.some(g => g.score === 100)) {
            newAchievements.push({
                id: (Date.now() + 1).toString(),
                userId,
                type: 'PERFECT_SCORE',
                title: 'Perfect Score',
                description: 'Achieved 100% on a quiz',
                earnedAt: new Date().toISOString()
            });
        }

        // Save new achievements
        if (newAchievements.length > 0) {
            achievements.achievements.push(...newAchievements);
            await writeJSON(ACHIEVEMENTS_DB, achievements);
        }

        res.json(newAchievements);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Resources Routes
app.get('/api/resources/course/:courseId', async (req, res) => {
    try {
        const { courseId } = req.params;
        const courses = await readJSON(COURSES_DB);
        const course = courses.courses.find(c => c.id === courseId);
        
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.json(course.resources);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Settings Routes
app.get('/api/settings/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const users = await readJSON(USERS_DB);
        const user = users.users.find(u => u.id === userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return user settings
        const { notifications = true, language = 'en', theme = 'light' } = user;
        res.json({ notifications, language, theme });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/settings/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { notifications, language, theme } = req.body;
        const users = await readJSON(USERS_DB);
        const userIndex = users.users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            return res.status(404).json({ message: 'User not found' });
        }

        users.users[userIndex] = {
            ...users.users[userIndex],
            notifications,
            language,
            theme
        };

        await writeJSON(USERS_DB, users);
        res.json({
            notifications,
            language,
            theme
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Notifications Routes
app.get('/api/notifications/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const activities = await readJSON(ACTIVITIES_DB);
        const achievements = await readJSON(ACHIEVEMENTS_DB);
        
        // Combine recent activities and achievements as notifications
        const recentActivities = activities.activities
            .filter(a => a.userId === userId)
            .slice(0, 10)
            .map(a => ({
                type: 'ACTIVITY',
                ...a
            }));

        const recentAchievements = achievements.achievements
            .filter(a => a.userId === userId)
            .slice(0, 10)
            .map(a => ({
                type: 'ACHIEVEMENT',
                ...a
            }));

        const notifications = [...recentActivities, ...recentAchievements]
            .sort((a, b) => new Date(b.timestamp || b.earnedAt) - new Date(a.timestamp || a.earnedAt));

        res.json(notifications.slice(0, 20)); // Return top 20 most recent notifications
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Recommendations Routes
app.get('/api/recommendations/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const grades = await readJSON(GRADES_DB);
        const progress = await readJSON(PROGRESS_DB);
        const courses = await readJSON(COURSES_DB);

        // Get user's current progress and performance
        const userGrades = grades.grades.filter(g => g.userId === userId);
        const userProgress = progress.progress.filter(p => p.userId === userId);

        // Find courses user hasn't started
        const userCourses = new Set(userProgress.map(p => p.courseId));
        const recommendedCourses = courses.courses
            .filter(course => !userCourses.has(course.id))
            .slice(0, 5);

        // Find courses where user performed well for advanced content
        const strongSubjects = userGrades
            .filter(g => g.score >= 80)
            .map(g => g.courseId);

        const advancedRecommendations = courses.courses
            .filter(course => strongSubjects.includes(course.id))
            .slice(0, 3);

        res.json({
            newCourses: recommendedCourses,
            advancedCourses: advancedRecommendations
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
