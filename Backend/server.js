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
app.use(cors({
  origin: 'https://brightlearn-du1d.onrender.com,http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Database paths
const USERS_DB = path.join(__dirname, 'data', 'users.json');
const COURSES_DB = path.join(__dirname, 'data', 'courses.json');
const PROGRESS_DB = path.join(__dirname, 'data', 'progress.json');
const QUIZZES_DB = path.join(__dirname, 'data', 'quizzes.json');
const GRADES_DB = path.join(__dirname, 'data', 'grades.json');
const ACTIVITIES_DB = path.join(__dirname, 'data', 'activities.json');
const ACHIEVEMENTS_DB = path.join(__dirname, 'data', 'achievements.json');
const NOTIFICATIONS_DB = path.join(__dirname, 'data', 'notifications.json');

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

// Get specific course progress
app.get('/api/progress/:userId/course/:courseId', async (req, res) => {
    try {
        const { userId, courseId } = req.params;
        const progressData = await readJSON(PROGRESS_DB);
        const courseProgress = progressData.progress.find(p => p.userId === userId && p.courseId === courseId);
        
        if (!courseProgress) {
            return res.status(404).json({ message: 'Course progress not found' });
        }
        
        res.json(courseProgress);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update lesson completion
app.put('/api/progress/:userId/course/:courseId/lesson/:lessonId', async (req, res) => {
    try {
        const { userId, courseId, lessonId } = req.params;
        const { completed, score, timeSpent } = req.body;
        
        const progressData = await readJSON(PROGRESS_DB);
        const courseProgress = progressData.progress.find(p => p.userId === userId && p.courseId === courseId);
        
        if (!courseProgress) {
            return res.status(404).json({ message: 'Course progress not found' });
        }
        
        const lesson = courseProgress.lessons.find(l => l.id === lessonId);
        if (lesson) {
            lesson.completed = completed;
            if (completed) {
                lesson.completedAt = new Date().toISOString();
                lesson.score = score || 0;
                lesson.timeSpent = timeSpent || 0;
            }
        }
        
        // Recalculate overall progress
        const completedLessons = courseProgress.lessons.filter(l => l.completed).length;
        courseProgress.overallProgress = Math.round((completedLessons / courseProgress.totalLessons) * 100);
        courseProgress.lessonsCompleted = completedLessons;
        courseProgress.lastAccessed = new Date().toISOString();
        
        await writeJSON(PROGRESS_DB, progressData);
        
        res.json(courseProgress);
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

// Submit quiz result
app.post('/api/quizzes/:quizId/submit', async (req, res) => {
    try {
        const { quizId } = req.params;
        const { userId, answers, timeSpent } = req.body;
        
        // Get quiz data
        const quizzesData = await readJSON(QUIZZES_DB);
        const quiz = quizzesData.quizzes.find(q => q.id === quizId);
        
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        
        // Calculate score
        let correctAnswers = 0;
        const results = quiz.questions.map((question, index) => {
            const isCorrect = answers[index] === question.correctAnswer;
            if (isCorrect) correctAnswers++;
            return {
                questionId: question.id,
                userAnswer: answers[index],
                correctAnswer: question.correctAnswer,
                isCorrect,
                explanation: question.explanation
            };
        });
        
        const score = Math.round((correctAnswers / quiz.totalQuestions) * 100);
        const passed = score >= quiz.passingScore;
        
        // Create grade record
        const gradesData = await readJSON(GRADES_DB);
        const newGrade = {
            id: `grade_${Date.now()}`,
            userId,
            courseId: quiz.courseId,
            courseTitle: quiz.title,
            type: 'quiz',
            title: quiz.title,
            quizId,
            score,
            maxScore: 100,
            percentage: score,
            status: passed ? 'passed' : 'failed',
            completedAt: new Date().toISOString(),
            timeSpent,
            correctAnswers,
            totalQuestions: quiz.totalQuestions,
            feedback: passed ? 'Good job! Keep up the excellent work.' : 'Review the material and try again.',
            results
        };
        
        gradesData.grades.push(newGrade);
        await writeJSON(GRADES_DB, gradesData);
        
        // Update progress
        const progressData = await readJSON(PROGRESS_DB);
        const courseProgress = progressData.progress.find(p => p.userId === userId && p.courseId === quiz.courseId);
        
        if (courseProgress) {
            const existingQuiz = courseProgress.quizzes.find(q => q.id === quizId);
            if (existingQuiz) {
                existingQuiz.completed = true;
                existingQuiz.completedAt = new Date().toISOString();
                existingQuiz.score = score;
                existingQuiz.correctAnswers = correctAnswers;
            } else {
                courseProgress.quizzes.push({
                    id: quizId,
                    title: quiz.title,
                    completed: true,
                    completedAt: new Date().toISOString(),
                    score,
                    totalQuestions: quiz.totalQuestions,
                    correctAnswers
                });
            }
            
            courseProgress.quizzesCompleted = courseProgress.quizzes.filter(q => q.completed).length;
            await writeJSON(PROGRESS_DB, progressData);
        }
        
        res.json({
            grade: newGrade,
            results,
            passed,
            score
        });
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
        const notificationsData = await readJSON(NOTIFICATIONS_DB);
        const userNotifications = notificationsData.notifications
            .filter(n => n.userId === userId)
            .sort((a, b) => new Date(b.timestamp || b.earnedAt) - new Date(a.timestamp || a.earnedAt));

        res.json(userNotifications.slice(0, 20)); // Return top 20 most recent notifications
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Mark notification as read
app.put('/api/notifications/:notificationId/read', async (req, res) => {
    try {
        const { notificationId } = req.params;
        const notificationsData = await readJSON(NOTIFICATIONS_DB);
        
        const notification = notificationsData.notifications.find(n => n.id === notificationId);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        notification.read = true;
        await writeJSON(NOTIFICATIONS_DB, notificationsData);
        
        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Mark all notifications as read for a user
app.put('/api/notifications/user/:userId/read-all', async (req, res) => {
    try {
        const { userId } = req.params;
        const notificationsData = await readJSON(NOTIFICATIONS_DB);
        
        notificationsData.notifications.forEach(notification => {
            if (notification.userId === userId) {
                notification.read = true;
            }
        });
        
        await writeJSON(NOTIFICATIONS_DB, notificationsData);
        
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create new notification
app.post('/api/notifications', async (req, res) => {
    try {
        const { userId, type, title, message, priority = 'medium', actionUrl = null } = req.body;
        const notificationsData = await readJSON(NOTIFICATIONS_DB);
        
        const newNotification = {
            id: `notif_${Date.now()}`,
            userId,
            type,
            title,
            message,
            timestamp: new Date().toISOString(),
            read: false,
            priority,
            actionUrl
        };

        notificationsData.notifications.push(newNotification);
        await writeJSON(NOTIFICATIONS_DB, notificationsData);
        
        res.status(201).json(newNotification);
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

// Dashboard Summary Endpoint
app.get('/api/dashboard/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        // Load all needed data
        const users = await readJSON(USERS_DB);
        const courses = await readJSON(COURSES_DB);
        const progress = await readJSON(PROGRESS_DB);
        const grades = await readJSON(GRADES_DB);
        const activities = await readJSON(ACTIVITIES_DB);
        const achievements = await readJSON(ACHIEVEMENTS_DB);

        // User info
        const user = users.users.find(u => u.id === userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Progress
        const userProgress = progress.progress.filter(p => p.userId === userId);
        const totalCourses = courses.courses.length;
        const enrolledCourses = new Set(userProgress.map(p => p.courseId));
        const completedCourses = userProgress.filter(p => p.progress >= 100).length;
        const overallProgress = userProgress.length > 0 ? Math.round(userProgress.reduce((sum, p) => sum + p.progress, 0) / userProgress.length) : 0;

        // Grades
        const userGrades = grades.grades.filter(g => g.userId === userId);
        const avgScore = userGrades.length > 0 ? Math.round(userGrades.reduce((sum, g) => sum + g.score, 0) / userGrades.length) : 0;
        const passing = avgScore >= 60;

        // Streak (days with activity)
        const userActivities = activities.activities.filter(a => a.userId === userId);
        const days = userActivities.map(a => a.timestamp.split('T')[0]);
        const uniqueDays = Array.from(new Set(days)).sort().reverse();
        let streak = 0;
        let current = new Date();
        for (let i = 0; i < uniqueDays.length; i++) {
            const day = new Date(uniqueDays[i]);
            if (i === 0 && (current - day) / (1000 * 60 * 60 * 24) > 1) break;
            if (i > 0) {
                const prev = new Date(uniqueDays[i - 1]);
                if ((prev - day) / (1000 * 60 * 60 * 24) !== 1) break;
            }
            streak++;
        }

        // Recent activity
        const recentActivity = userActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);

        // Recommendations
        const gradesSet = new Set(userGrades.map(g => g.courseId));
        const recommendedCourses = courses.courses.filter(c => !enrolledCourses.has(c.id)).slice(0, 3);

        res.json({
            name: user.fullName || user.name || 'Student',
            overallProgress,
            totalCourses,
            completedCourses,
            avgScore,
            passing,
            streak,
            recentActivity,
            recommendedCourses
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
