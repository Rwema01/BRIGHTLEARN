// Base URL for API endpoints
const BASE_URL = 'https://brightlearnbackend.onrender.com/api';

// Auth API calls
const api = {
    // Authentication
    async login(email, password) {
        try {
            const response = await fetch(`${BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
                // Remove credentials mode when using file:// protocol
                // credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`Login failed: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    async register(userData) {
        try {
            const response = await fetch(`${BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
                // Remove credentials mode when using file:// protocol
                // credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`Registration failed: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },

    // User Profile
    async getUserProfile(userId) {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${BASE_URL}/user/${userId}/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to get profile: ${response.status} ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw error;
        }
    },

    // Courses
    async getCourses() {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/courses`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
            // Remove credentials mode when using file:// protocol
            // credentials: 'include'
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
