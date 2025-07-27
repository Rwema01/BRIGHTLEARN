// Base URL for API endpoints
const BASE_URL = 'http://localhost:3000/api';

// Auth API calls
const api = {
    // Authentication
    async login(email, password) {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        return await response.json();
    },

    async register(userData) {
        const response = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
        return await response.json();
    },

    // User Profile
    async getUserProfile(userId) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        return await response.json();
    },

    // Courses
    async getCourses() {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/courses`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        return await response.json();
    },

    async getCourseProgress(courseId) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/courses/${courseId}/progress`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        return await response.json();
    },

    // Activities
    async getRecentActivities() {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/activities/recent`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        return await response.json();
    },

    // Progress
    async getUserProgress() {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/progress`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        return await response.json();
    },

    // Achievements
    async getUserAchievements() {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/achievements`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        return await response.json();
    },
};

export default api;
