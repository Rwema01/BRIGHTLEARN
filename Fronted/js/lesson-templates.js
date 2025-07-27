// Lesson Templates Handler

class LessonTemplateHandler {
    constructor() {
        this.templates = {};
        this.loadTemplates();
    }

    async loadTemplates() {
        try {
            const response = await fetch('templates/lesson-templates.html');
            const text = await response.text();
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = text;
            
            // Store all templates
            tempDiv.querySelectorAll('template').forEach(template => {
                this.templates[template.id] = template;
            });
        } catch (error) {
            console.error('Error loading templates:', error);
        }
    }

    renderVideoLesson(lessonData) {
        const template = this.templates['video-lesson-template'];
        const content = template.content.cloneNode(true);
        
        // Set video source
        const iframe = content.querySelector('iframe');
        iframe.src = lessonData.videoUrl;
        
        // Add key points
        const keyPointsList = content.querySelector('.key-points-list');
        lessonData.keyPoints.forEach(point => {
            const li = document.createElement('li');
            li.textContent = point;
            keyPointsList.appendChild(li);
        });
        
        // Add transcript
        const transcript = content.querySelector('.transcript-content');
        transcript.innerHTML = lessonData.transcript;
        
        // Setup video controls
        this.setupVideoControls(content);
        
        return content;
    }

    renderInteractiveExercise(exerciseData) {
        const template = this.templates['interactive-exercise-template'];
        const content = template.content.cloneNode(true);
        
        // Set exercise title
        content.querySelector('.exercise-title').textContent = exerciseData.title;
        
        // Setup progress
        const progressFill = content.querySelector('.progress-fill');
        progressFill.style.width = `${(exerciseData.currentQuestion / exerciseData.totalQuestions) * 100}%`;
        
        // Render current question
        this.renderQuestion(content, exerciseData.currentQuestion);
        
        // Setup navigation
        this.setupExerciseNavigation(content, exerciseData);
        
        return content;
    }

    renderReadingLesson(lessonData) {
        const template = this.templates['reading-lesson-template'];
        const content = template.content.cloneNode(true);
        
        // Add content
        const readingContent = content.querySelector('.reading-content');
        readingContent.innerHTML = lessonData.content;
        
        // Setup reading controls
        this.setupReadingControls(content);
        
        // Setup section navigation
        this.setupSectionNavigation(content, lessonData);
        
        return content;
    }

    renderQuiz(quizData) {
        const template = this.templates['quiz-template'];
        const content = template.content.cloneNode(true);
        
        // Set quiz title and info
        content.querySelector('.quiz-title').textContent = quizData.title;
        content.querySelector('.total').textContent = quizData.totalQuestions;
        
        // Setup timer
        this.setupQuizTimer(content, quizData.timeLimit);
        
        // Render first question
        this.renderQuizQuestion(content, quizData.questions[0]);
        
        // Setup navigation
        this.setupQuizNavigation(content, quizData);
        
        return content;
    }

    renderPracticeExercise(exerciseData) {
        const template = this.templates['practice-template'];
        const content = template.content.cloneNode(true);
        
        // Set exercise title and problem statement
        content.querySelector('.practice-title').textContent = exerciseData.title;
        content.querySelector('.problem-statement').innerHTML = exerciseData.problemStatement;
        
        // Setup code editor
        this.setupCodeEditor(content, exerciseData);
        
        // Setup controls
        this.setupPracticeControls(content, exerciseData);
        
        return content;
    }

    // Helper methods for controls and interactions
    setupVideoControls(content) {
        const video = content.querySelector('iframe');
        
        content.querySelectorAll('.control-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                switch(action) {
                    case 'rewind':
                        // Implementation for video API rewind
                        break;
                    case 'play-pause':
                        // Implementation for video API play/pause
                        break;
                    case 'forward':
                        // Implementation for video API forward
                        break;
                }
            });
        });
    }

    setupExerciseNavigation(content, data) {
        // Implementation for exercise navigation
    }

    setupReadingControls(content) {
        const readingContent = content.querySelector('.reading-content');
        let fontSize = 16;
        
        content.querySelectorAll('.control-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                switch(action) {
                    case 'font-increase':
                        fontSize = Math.min(fontSize + 2, 24);
                        readingContent.style.fontSize = `${fontSize}px`;
                        break;
                    case 'font-decrease':
                        fontSize = Math.max(fontSize - 2, 12);
                        readingContent.style.fontSize = `${fontSize}px`;
                        break;
                    case 'theme-toggle':
                        readingContent.classList.toggle('dark-theme');
                        break;
                }
            });
        });
    }

    setupQuizTimer(content, timeLimit) {
        const timerDisplay = content.querySelector('.timer');
        let timeLeft = timeLimit;
        
        const timer = setInterval(() => {
            timeLeft--;
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                this.handleQuizTimeout();
            }
        }, 1000);
    }

    setupCodeEditor(content, exerciseData) {
        // Implementation for code editor setup
    }

    setupPracticeControls(content, exerciseData) {
        content.querySelectorAll('.control-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                switch(action) {
                    case 'hint':
                        this.showHint(exerciseData.hints);
                        break;
                    case 'solution':
                        this.showSolution(exerciseData.solution);
                        break;
                    case 'reset':
                        this.resetPractice();
                        break;
                }
            });
        });
    }

    // Additional helper methods as needed
    showHint(hints) {
        // Implementation for showing hints
    }

    showSolution(solution) {
        // Implementation for showing solution
    }

    resetPractice() {
        // Implementation for resetting practice
    }

    handleQuizTimeout() {
        // Implementation for quiz timeout
    }
}

// Export the handler
export default new LessonTemplateHandler();
