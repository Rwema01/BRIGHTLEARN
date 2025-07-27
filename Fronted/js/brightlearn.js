// BRIGHTLEARN Core System

class BrightLearnSystem {
    constructor() {
        this.modules = {
            lessonViewer: null,
            analytics: null,
            adaptive: null,
            assessment: null
        };
        this.init();
    }

    async init() {
        await this.loadDependencies();
        this.initializeModules();
        this.setupEventHandlers();
        this.startApplication();
    }

    async loadDependencies() {
        // Import all required modules
        const [
            LessonViewer, 
            LearningAnalytics, 
            AdaptiveLearning,
            AssessmentManager
        ] = await Promise.all([
            import('./lesson-viewer.js'),
            import('./learning-analytics.js'),
            import('./adaptive-learning.js'),
            import('./assessment-manager.js')
        ]);

        this.modules = {
            lessonViewer: new LessonViewer(),
            analytics: new LearningAnalytics(),
            adaptive: new AdaptiveLearning(),
            assessment: new AssessmentManager()
        };
    }

    initializeModules() {
        // Initialize theme system
        this.initializeThemeSystem();
        
        // Initialize navigation
        this.initializeNavigation();
        
        // Initialize content loading
        this.initializeContentLoader();
        
        // Setup user system
        this.initializeUserSystem();
    }

    initializeThemeSystem() {
        const theme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', theme);
        
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }

    initializeNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const route = item.getAttribute('data-route');
                this.navigateToRoute(route);
            });
        });
    }

    async navigateToRoute(route) {
        try {
            const content = await this.loadRouteContent(route);
            this.updateMainContent(content);
            this.updateURL(route);
            this.modules.analytics.trackNavigation(route);
        } catch (error) {
            console.error('Navigation error:', error);
            this.showErrorMessage('Navigation failed. Please try again.');
        }
    }

    async loadRouteContent(route) {
        const response = await fetch(`/api/content/${route}`);
        if (!response.ok) throw new Error('Failed to load content');
        return await response.json();
    }

    updateMainContent(content) {
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.innerHTML = '';
            this.renderContent(mainContent, content);
        }
    }

    renderContent(container, content) {
        if (content.type === 'lesson') {
            this.modules.lessonViewer.render(container, content);
        } else if (content.type === 'assessment') {
            this.modules.assessment.render(container, content);
        } else {
            container.innerHTML = this.generateHTML(content);
        }
    }

    generateHTML(content) {
        // Generate appropriate HTML based on content type
        return `
            <div class="content-wrapper ${content.type}">
                <h1>${content.title}</h1>
                ${this.renderContentBody(content)}
            </div>
        `;
    }

    renderContentBody(content) {
        switch (content.type) {
            case 'course':
                return this.renderCourseContent(content);
            case 'practice':
                return this.renderPracticeContent(content);
            case 'quiz':
                return this.renderQuizContent(content);
            default:
                return this.renderDefaultContent(content);
        }
    }

    initializeContentLoader() {
        this.contentLoader = {
            cache: new Map(),
            loading: false,
            queue: []
        };

        // Setup intersection observer for lazy loading
        this.setupLazyLoading();
    }

    setupLazyLoading() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadContentSection(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1 }
        );

        document.querySelectorAll('[data-lazy-load]').forEach(
            element => observer.observe(element)
        );
    }

    async loadContentSection(element) {
        const contentId = element.getAttribute('data-content-id');
        try {
            const content = await this.fetchContent(contentId);
            this.renderContentSection(element, content);
        } catch (error) {
            console.error('Content loading error:', error);
            element.innerHTML = this.getErrorTemplate();
        }
    }

    initializeUserSystem() {
        this.checkAuthStatus();
        this.setupAuthListeners();
        this.loadUserPreferences();
    }

    setupEventHandlers() {
        // Global event handlers
        window.addEventListener('error', this.handleError.bind(this));
        window.addEventListener('online', this.handleOnline.bind(this));
        window.addEventListener('offline', this.handleOffline.bind(this));

        // Custom event handlers
        document.addEventListener('lessonComplete', this.handleLessonComplete.bind(this));
        document.addEventListener('achievementUnlocked', this.handleAchievement.bind(this));
        document.addEventListener('progressUpdate', this.handleProgress.bind(this));
    }

    handleError(error) {
        console.error('Application error:', error);
        this.showErrorMessage('An error occurred. Please try again.');
        this.modules.analytics.trackError(error);
    }

    handleOnline() {
        this.syncOfflineData();
        this.showNotification('Connection restored');
    }

    handleOffline() {
        this.enableOfflineMode();
        this.showNotification('Working offline');
    }

    handleLessonComplete(event) {
        const { lessonId, score, timeSpent } = event.detail;
        this.modules.analytics.trackLessonCompletion(lessonId, score, timeSpent);
        this.modules.adaptive.updateLearningPath(lessonId, score);
        this.updateUserProgress(lessonId, score);
    }

    handleAchievement(event) {
        const { achievement } = event.detail;
        this.showAchievementNotification(achievement);
        this.modules.analytics.trackAchievement(achievement);
        this.updateUserAchievements(achievement);
    }

    handleProgress(event) {
        const { progress } = event.detail;
        this.modules.adaptive.adjustContent(progress);
        this.updateProgressIndicators(progress);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-details">
                <h3>${achievement.title}</h3>
                <p>${achievement.description}</p>
            </div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    updateProgressIndicators(progress) {
        document.querySelectorAll('[data-progress]').forEach(element => {
            const progressType = element.getAttribute('data-progress');
            const value = progress[progressType];
            if (value !== undefined) {
                element.style.setProperty('--progress', `${value}%`);
            }
        });
    }

    startApplication() {
        // Show loading screen
        this.showLoadingScreen();

        // Initialize current route
        const currentRoute = window.location.pathname;
        this.navigateToRoute(currentRoute);

        // Hide loading screen
        this.hideLoadingScreen();

        // Start background tasks
        this.startBackgroundTasks();
    }

    showLoadingScreen() {
        const loader = document.createElement('div');
        loader.className = 'loading-screen';
        loader.innerHTML = `
            <div class="loader-content">
                <div class="spinner"></div>
                <p>Loading BRIGHTLEARN...</p>
            </div>
        `;
        document.body.appendChild(loader);
    }

    hideLoadingScreen() {
        const loader = document.querySelector('.loading-screen');
        if (loader) {
            loader.classList.add('fade-out');
            setTimeout(() => loader.remove(), 500);
        }
    }

    startBackgroundTasks() {
        // Start periodic sync
        setInterval(() => this.syncData(), 300000); // Every 5 minutes

        // Start analytics reporting
        setInterval(() => this.modules.analytics.sendReport(), 900000); // Every 15 minutes

        // Check for updates
        setInterval(() => this.checkForUpdates(), 3600000); // Every hour
    }

    async syncData() {
        try {
            await Promise.all([
                this.syncUserProgress(),
                this.syncAnalytics(),
                this.syncPreferences()
            ]);
        } catch (error) {
            console.error('Sync error:', error);
        }
    }

    async checkForUpdates() {
        try {
            const response = await fetch('/api/updates');
            const updates = await response.json();
            if (updates.available) {
                this.notifyUpdate(updates);
            }
        } catch (error) {
            console.error('Update check failed:', error);
        }
    }

    notifyUpdate(updates) {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <h3>Update Available</h3>
            <p>${updates.description}</p>
            <button onclick="location.reload()">Update Now</button>
        `;
        document.body.appendChild(notification);
    }
}

// Initialize the application
const brightLearn = new BrightLearnSystem();
export default brightLearn;
