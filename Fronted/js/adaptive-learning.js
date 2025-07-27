// Adaptive Learning and Gamification System

class AdaptiveLearningSystem {
    constructor() {
        this.learningProfile = {
            preferredStyle: null,
            pace: null,
            strengths: {},
            weaknesses: {},
            achievements: [],
            level: 1,
            experience: 0,
            skills: {}
        };
        this.gameElements = {
            points: 0,
            streaks: {},
            badges: [],
            challenges: []
        };
        this.initializeSystem();
    }

    async initializeSystem() {
        await this.loadUserProfile();
        this.setupEventListeners();
        this.initializeGameElements();
        this.startAdaptation();
    }

    async loadUserProfile() {
        try {
            const stored = localStorage.getItem('learningProfile');
            if (stored) {
                this.learningProfile = { ...this.learningProfile, ...JSON.parse(stored) };
            }
            // Fetch from server if available
            const response = await fetch('/api/user/learning-profile');
            if (response.ok) {
                const serverProfile = await response.json();
                this.learningProfile = { ...this.learningProfile, ...serverProfile };
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    }

    setupEventListeners() {
        document.addEventListener('contentComplete', this.handleContentCompletion.bind(this));
        document.addEventListener('exerciseComplete', this.handleExerciseCompletion.bind(this));
        document.addEventListener('challengeComplete', this.handleChallengeCompletion.bind(this));
    }

    initializeGameElements() {
        this.setupLevelSystem();
        this.setupChallenges();
        this.setupRewards();
        this.updateUI();
    }

    setupLevelSystem() {
        this.levelThresholds = {
            2: 100,   // 100 XP for level 2
            3: 250,   // 250 XP for level 3
            4: 500,   // and so on...
            5: 1000,
            6: 2000,
            7: 4000,
            8: 8000,
            9: 16000,
            10: 32000
        };
    }

    setupChallenges() {
        this.challenges = [
            {
                id: 'daily_streak',
                title: 'Daily Learning Streak',
                description: 'Complete at least one lesson every day',
                reward: 50,
                type: 'streak'
            },
            {
                id: 'topic_master',
                title: 'Topic Master',
                description: 'Complete all exercises in a topic with 90% accuracy',
                reward: 100,
                type: 'achievement'
            },
            {
                id: 'speed_learner',
                title: 'Speed Learner',
                description: 'Complete 5 lessons in one day',
                reward: 75,
                type: 'daily'
            }
        ];
    }

    setupRewards() {
        this.rewards = {
            badges: [
                {
                    id: 'first_steps',
                    title: 'First Steps',
                    description: 'Complete your first lesson',
                    icon: '🎯'
                },
                {
                    id: 'consistent_learner',
                    title: 'Consistent Learner',
                    description: 'Maintain a 7-day streak',
                    icon: '🔥'
                },
                {
                    id: 'knowledge_seeker',
                    title: 'Knowledge Seeker',
                    description: 'Complete 50 lessons',
                    icon: '📚'
                }
            ],
            powerUps: [
                {
                    id: 'double_xp',
                    title: 'Double XP',
                    duration: 3600, // 1 hour
                    effect: 'xp_multiplier'
                },
                {
                    id: 'hint_boost',
                    title: 'Hint Boost',
                    duration: 1800, // 30 minutes
                    effect: 'extra_hints'
                }
            ]
        };
    }

    startAdaptation() {
        this.analyzeUserBehavior();
        this.adjustContentDifficulty();
        this.updateLearningPath();
    }

    analyzeUserBehavior() {
        // Track time spent on different types of content
        const contentTypes = ['video', 'text', 'interactive', 'practice'];
        contentTypes.forEach(type => {
            this.trackContentTypeEngagement(type);
        });

        // Monitor success rates
        this.trackSuccessRates();

        // Analyze learning patterns
        this.analyzeLearningPatterns();
    }

    trackContentTypeEngagement(type) {
        const engagementMetrics = {
            timeSpent: 0,
            interactionCount: 0,
            completionRate: 0
        };

        document.querySelectorAll(`[data-content-type="${type}"]`).forEach(element => {
            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.startTracking(type, engagementMetrics);
                    } else {
                        this.stopTracking(type, engagementMetrics);
                    }
                });
            });
            observer.observe(element);
        });
    }

    startTracking(type, metrics) {
        metrics.startTime = Date.now();
        this.addInteractionListeners(type, metrics);
    }

    stopTracking(type, metrics) {
        metrics.timeSpent += Date.now() - metrics.startTime;
        this.updatePreferredStyle(type, metrics);
    }

    updatePreferredStyle(type, metrics) {
        const engagementScore = this.calculateEngagementScore(metrics);
        this.learningProfile.preferredStyle = {
            ...this.learningProfile.preferredStyle,
            [type]: engagementScore
        };
    }

    adjustContentDifficulty() {
        const performance = this.calculatePerformanceMetrics();
        const newDifficulty = this.calculateOptimalDifficulty(performance);
        this.updateContentDifficulty(newDifficulty);
    }

    calculatePerformanceMetrics() {
        return {
            averageScore: this.calculateAverageScore(),
            completionTime: this.calculateAverageCompletionTime(),
            mistakePatterns: this.analyzeMistakePatterns()
        };
    }

    updateContentDifficulty(difficulty) {
        document.querySelectorAll('[data-adaptive-content]').forEach(element => {
            this.adjustElementDifficulty(element, difficulty);
        });
    }

    adjustElementDifficulty(element, difficulty) {
        const content = element.getAttribute('data-content-variants');
        if (content) {
            const variants = JSON.parse(content);
            const appropriateContent = this.selectAppropriateVariant(variants, difficulty);
            this.updateElementContent(element, appropriateContent);
        }
    }

    updateLearningPath() {
        const currentProgress = this.assessProgress();
        const recommendations = this.generateRecommendations(currentProgress);
        this.updatePathVisuals(recommendations);
    }

    assessProgress() {
        return {
            completedTopics: this.getCompletedTopics(),
            skillLevels: this.getSkillLevels(),
            learningGoals: this.getLearningGoals()
        };
    }

    handleContentCompletion(event) {
        const { contentId, score, timeSpent } = event.detail;
        this.updateProgress(contentId, score, timeSpent);
        this.awardExperience(score);
        this.checkLevelUp();
        this.updateChallenges(contentId);
    }

    updateProgress(contentId, score, timeSpent) {
        this.learningProfile.progress = {
            ...this.learningProfile.progress,
            [contentId]: { score, timeSpent, completedAt: new Date() }
        };
        this.saveProgress();
    }

    awardExperience(score) {
        const baseXP = score * 10;
        const bonusXP = this.calculateBonusXP();
        const totalXP = baseXP + bonusXP;
        
        this.learningProfile.experience += totalXP;
        this.showXPGain(totalXP);
    }

    calculateBonusXP() {
        let bonus = 0;
        
        // Streak bonus
        if (this.gameElements.streaks.daily > 0) {
            bonus += Math.min(this.gameElements.streaks.daily * 5, 50);
        }
        
        // Power-up bonus
        if (this.hasActivePowerUp('double_xp')) {
            bonus *= 2;
        }
        
        return bonus;
    }

    checkLevelUp() {
        const currentLevel = this.learningProfile.level;
        const nextLevelThreshold = this.levelThresholds[currentLevel + 1];
        
        if (this.learningProfile.experience >= nextLevelThreshold) {
            this.levelUp();
        }
    }

    levelUp() {
        this.learningProfile.level++;
        this.showLevelUpAnimation();
        this.unlockNewContent();
        this.saveProgress();
    }

    showLevelUpAnimation() {
        const animation = document.createElement('div');
        animation.className = 'level-up-animation';
        animation.innerHTML = `
            <div class="level-up-content">
                <h2>Level Up!</h2>
                <p>You've reached level ${this.learningProfile.level}</p>
                <div class="reward-preview"></div>
            </div>
        `;
        document.body.appendChild(animation);
        
        setTimeout(() => {
            animation.remove();
        }, 3000);
    }

    unlockNewContent() {
        const unlockedContent = this.getUnlockedContent();
        if (unlockedContent.length > 0) {
            this.showUnlockAnimation(unlockedContent);
            this.updateAvailableContent(unlockedContent);
        }
    }

    updateChallenges(contentId) {
        this.challenges.forEach(challenge => {
            if (this.checkChallengeCompletion(challenge, contentId)) {
                this.completeChallenge(challenge);
            }
        });
    }

    checkChallengeCompletion(challenge, contentId) {
        switch (challenge.type) {
            case 'streak':
                return this.checkStreakChallenge(challenge);
            case 'achievement':
                return this.checkAchievementChallenge(challenge, contentId);
            case 'daily':
                return this.checkDailyChallenge(challenge);
            default:
                return false;
        }
    }

    completeChallenge(challenge) {
        this.awardExperience(challenge.reward);
        this.showChallengeCompletion(challenge);
        this.updateChallengeProgress(challenge);
    }

    saveProgress() {
        localStorage.setItem('learningProfile', JSON.stringify(this.learningProfile));
        this.syncWithServer();
    }

    async syncWithServer() {
        try {
            await fetch('/api/user/learning-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.learningProfile)
            });
        } catch (error) {
            console.error('Error syncing progress:', error);
        }
    }

    updateUI() {
        this.updateLevelIndicator();
        this.updateExperienceBar();
        this.updateChallengesList();
        this.updateBadgeCollection();
    }
}

export default AdaptiveLearningSystem;
