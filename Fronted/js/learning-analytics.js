// Learning Analytics and Content Management System

class LearningAnalytics {
    constructor() {
        this.sessionData = {
            startTime: new Date(),
            interactions: [],
            completedSections: new Set(),
            timeSpent: {},
            mistakes: {},
            achievements: []
        };
        this.startTracking();
    }

    startTracking() {
        this.trackPageTime();
        this.trackInteractions();
        this.trackProgress();
        this.trackEngagement();
    }

    trackPageTime() {
        let lastSection = '';
        let sectionStartTime = new Date();

        // Track time spent on each section
        document.addEventListener('scroll', () => {
            const currentSection = this.getCurrentSection();
            if (currentSection && currentSection !== lastSection) {
                const timeSpent = new Date() - sectionStartTime;
                this.timeSpent[lastSection] = (this.timeSpent[lastSection] || 0) + timeSpent;
                lastSection = currentSection;
                sectionStartTime = new Date();
            }
        });
    }

    trackInteractions() {
        document.addEventListener('click', (e) => {
            const interaction = {
                type: 'click',
                target: e.target.className,
                timestamp: new Date(),
                position: { x: e.clientX, y: e.clientY }
            };
            this.sessionData.interactions.push(interaction);
        });

        // Track input interactions
        document.addEventListener('input', (e) => {
            if (e.target.matches('.exercise-input, .quiz-input')) {
                const interaction = {
                    type: 'input',
                    target: e.target.className,
                    timestamp: new Date()
                };
                this.sessionData.interactions.push(interaction);
            }
        });
    }

    trackProgress() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                    const section = entry.target.getAttribute('data-section');
                    if (section) {
                        this.sessionData.completedSections.add(section);
                        this.checkAchievements();
                        this.saveProgress();
                    }
                }
            });
        }, { threshold: [0.5] });

        document.querySelectorAll('[data-section]').forEach(section => {
            observer.observe(section);
        });
    }

    trackEngagement() {
        let lastActivity = new Date();
        let isEngaged = true;

        const updateEngagement = () => {
            lastActivity = new Date();
            if (!isEngaged) {
                isEngaged = true;
                this.logEngagement('re-engaged');
            }
        };

        // Track user activity
        ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, updateEngagement);
        });

        // Check for disengagement
        setInterval(() => {
            const inactiveTime = new Date() - lastActivity;
            if (inactiveTime > 60000 && isEngaged) { // 1 minute
                isEngaged = false;
                this.logEngagement('disengaged');
            }
        }, 30000);
    }

    logEngagement(status) {
        const engagement = {
            status,
            timestamp: new Date(),
            sessionDuration: new Date() - this.sessionData.startTime
        };
        this.sessionData.interactions.push(engagement);
    }

    getCurrentSection() {
        const sections = document.querySelectorAll('[data-section]');
        for (const section of sections) {
            const rect = section.getBoundingClientRect();
            if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
                return section.getAttribute('data-section');
            }
        }
        return null;
    }

    checkAchievements() {
        const completedCount = this.sessionData.completedSections.size;
        
        // Achievement criteria
        const achievements = [
            { id: 'quick_learner', condition: () => this.getAverageTimePerSection() < 120000 },
            { id: 'completionist', condition: () => completedCount === document.querySelectorAll('[data-section]').length },
            { id: 'engaged_learner', condition: () => this.sessionData.interactions.length > 50 }
        ];

        achievements.forEach(achievement => {
            if (achievement.condition() && !this.hasAchievement(achievement.id)) {
                this.awardAchievement(achievement.id);
            }
        });
    }

    hasAchievement(id) {
        return this.sessionData.achievements.some(a => a.id === id);
    }

    awardAchievement(id) {
        const achievement = {
            id,
            timestamp: new Date(),
            sessionProgress: this.getProgressSummary()
        };
        this.sessionData.achievements.push(achievement);
        this.notifyAchievement(achievement);
    }

    notifyAchievement(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">🏆</div>
            <div class="achievement-details">
                <h3>Achievement Unlocked!</h3>
                <p>${this.getAchievementTitle(achievement.id)}</p>
            </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }

    getAchievementTitle(id) {
        const titles = {
            quick_learner: 'Quick Learner - Completed sections in record time!',
            completionist: 'Completionist - Finished all sections!',
            engaged_learner: 'Engaged Learner - High interaction rate!'
        };
        return titles[id] || 'Achievement Unlocked!';
    }

    getProgressSummary() {
        return {
            completedSections: Array.from(this.sessionData.completedSections),
            totalSections: document.querySelectorAll('[data-section]').length,
            timeSpent: this.timeSpent,
            interactionCount: this.sessionData.interactions.length
        };
    }

    getAverageTimePerSection() {
        const totalTime = Object.values(this.timeSpent).reduce((a, b) => a + b, 0);
        return totalTime / Math.max(1, this.sessionData.completedSections.size);
    }

    async saveProgress() {
        try {
            const response = await fetch('/api/learning-progress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.getProgressSummary())
            });
            return await response.json();
        } catch (error) {
            console.error('Error saving progress:', error);
            // Fallback to local storage
            localStorage.setItem('learning_progress', JSON.stringify(this.getProgressSummary()));
        }
    }

    generateReport() {
        return {
            sessionDuration: new Date() - this.sessionData.startTime,
            completedSections: Array.from(this.sessionData.completedSections),
            averageTimePerSection: this.getAverageTimePerSection(),
            totalInteractions: this.sessionData.interactions.length,
            achievements: this.sessionData.achievements,
            engagementMetrics: this.calculateEngagementMetrics(),
            recommendations: this.generateRecommendations()
        };
    }

    calculateEngagementMetrics() {
        const interactions = this.sessionData.interactions;
        return {
            interactionRate: interactions.length / (new Date() - this.sessionData.startTime) * 60000,
            mostActiveSection: this.getMostActiveSection(),
            engagementTrend: this.getEngagementTrend()
        };
    }

    getMostActiveSection() {
        const sectionInteractions = {};
        this.sessionData.interactions.forEach(interaction => {
            const section = this.getSectionFromInteraction(interaction);
            if (section) {
                sectionInteractions[section] = (sectionInteractions[section] || 0) + 1;
            }
        });
        return Object.entries(sectionInteractions)
            .sort(([,a], [,b]) => b - a)[0]?.[0];
    }

    getEngagementTrend() {
        const intervals = 6; // 10-minute intervals
        const trend = new Array(intervals).fill(0);
        const sessionStart = this.sessionData.startTime;
        const intervalLength = 600000; // 10 minutes

        this.sessionData.interactions.forEach(interaction => {
            const timeFromStart = interaction.timestamp - sessionStart;
            const intervalIndex = Math.floor(timeFromStart / intervalLength);
            if (intervalIndex < intervals) {
                trend[intervalIndex]++;
            }
        });

        return trend;
    }

    generateRecommendations() {
        const metrics = this.calculateEngagementMetrics();
        const recommendations = [];

        // Engagement-based recommendations
        if (metrics.interactionRate < 2) { // Less than 2 interactions per minute
            recommendations.push({
                type: 'engagement',
                message: 'Try to interact more with the content to improve learning retention'
            });
        }

        // Time-based recommendations
        const avgTime = this.getAverageTimePerSection();
        if (avgTime < 60000) { // Less than 1 minute per section
            recommendations.push({
                type: 'pacing',
                message: 'Consider spending more time on each section for better understanding'
            });
        }

        // Progress-based recommendations
        const progress = this.getProgressSummary();
        if (progress.completedSections.length < progress.totalSections * 0.5) {
            recommendations.push({
                type: 'progress',
                message: 'You\'re halfway there! Keep going to unlock more achievements'
            });
        }

        return recommendations;
    }
}

export default LearningAnalytics;
