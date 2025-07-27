// Lesson Interactions Handler

class VideoInteractions {
    constructor(iframe) {
        this.iframe = iframe;
        this.player = null;
        this.initializePlayer();
    }

    initializePlayer() {
        // Using YouTube iframe API as an example
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        window.onYouTubeIframeAPIReady = () => {
            this.player = new YT.Player(this.iframe, {
                events: {
                    'onStateChange': this.onPlayerStateChange.bind(this)
                }
            });
        };
    }

    onPlayerStateChange(event) {
        // Handle state changes
        switch(event.data) {
            case YT.PlayerState.ENDED:
                this.onVideoComplete();
                break;
            case YT.PlayerState.PLAYING:
                this.startProgressTracking();
                break;
            case YT.PlayerState.PAUSED:
                this.pauseProgressTracking();
                break;
        }
    }

    rewind() {
        const currentTime = this.player.getCurrentTime();
        this.player.seekTo(Math.max(0, currentTime - 10), true);
    }

    forward() {
        const currentTime = this.player.getCurrentTime();
        this.player.seekTo(currentTime + 10, true);
    }

    togglePlayPause() {
        const state = this.player.getPlayerState();
        if (state === YT.PlayerState.PLAYING) {
            this.player.pauseVideo();
        } else {
            this.player.playVideo();
        }
    }
}

class InteractiveExercise {
    constructor(container, exerciseData) {
        this.container = container;
        this.data = exerciseData;
        this.currentQuestion = 0;
        this.answers = new Array(exerciseData.totalQuestions).fill(null);
        this.setupNavigation();
    }

    setupNavigation() {
        const prevBtn = this.container.querySelector('.prev-btn');
        const nextBtn = this.container.querySelector('.next-btn');
        const submitBtn = this.container.querySelector('.submit-btn');

        prevBtn?.addEventListener('click', () => this.navigateQuestion(-1));
        nextBtn?.addEventListener('click', () => this.navigateQuestion(1));
        submitBtn?.addEventListener('click', () => this.submitExercise());
    }

    navigateQuestion(delta) {
        const newQuestion = this.currentQuestion + delta;
        if (newQuestion >= 0 && newQuestion < this.data.totalQuestions) {
            this.saveCurrentAnswer();
            this.currentQuestion = newQuestion;
            this.loadQuestion(this.currentQuestion);
            this.updateProgress();
        }
    }

    saveCurrentAnswer() {
        const answer = this.container.querySelector('input[name="answer"]:checked')?.value;
        if (answer) {
            this.answers[this.currentQuestion] = answer;
        }
    }

    loadQuestion(index) {
        const question = this.data.questions[index];
        // Implementation for loading question content
    }

    updateProgress() {
        const progress = this.container.querySelector('.progress-fill');
        const percentage = ((this.currentQuestion + 1) / this.data.totalQuestions) * 100;
        progress.style.width = `${percentage}%`;
    }

    submitExercise() {
        this.saveCurrentAnswer();
        const score = this.calculateScore();
        this.showResults(score);
    }

    calculateScore() {
        return this.answers.reduce((score, answer, index) => {
            return score + (answer === this.data.questions[index].correct ? 1 : 0);
        }, 0);
    }

    showResults(score) {
        // Implementation for showing results
    }
}

class ReadingLesson {
    constructor(container) {
        this.container = container;
        this.content = container.querySelector('.reading-content');
        this.setupControls();
        this.setupProgressTracking();
    }

    setupControls() {
        const controls = {
            fontSize: this.container.querySelector('.font-size-controls'),
            theme: this.container.querySelector('.theme-toggle'),
            bookmark: this.container.querySelector('.bookmark-btn')
        };

        this.setupFontSizeControls(controls.fontSize);
        this.setupThemeToggle(controls.theme);
        this.setupBookmarking(controls.bookmark);
    }

    setupFontSizeControls(control) {
        let fontSize = 16;
        control.querySelector('.increase').addEventListener('click', () => {
            fontSize = Math.min(fontSize + 2, 24);
            this.content.style.fontSize = `${fontSize}px`;
        });

        control.querySelector('.decrease').addEventListener('click', () => {
            fontSize = Math.max(fontSize - 2, 12);
            this.content.style.fontSize = `${fontSize}px`;
        });
    }

    setupThemeToggle(toggle) {
        toggle.addEventListener('click', () => {
            this.content.classList.toggle('dark-theme');
            this.savePreference('theme', this.content.classList.contains('dark-theme'));
        });
    }

    setupBookmarking(button) {
        button.addEventListener('click', () => {
            const scrollPosition = this.content.scrollTop;
            this.saveBookmark(scrollPosition);
        });
    }

    setupProgressTracking() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: [0, 0.25, 0.5, 0.75, 1]
        };

        const observer = new IntersectionObserver(this.handleIntersection.bind(this), options);
        this.content.querySelectorAll('section').forEach(section => observer.observe(section));
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.intersectionRatio > 0.5) {
                this.updateProgress(entry.target);
            }
        });
    }

    savePreference(key, value) {
        localStorage.setItem(`reading_${key}`, JSON.stringify(value));
    }

    saveBookmark(position) {
        localStorage.setItem('reading_bookmark', position);
    }

    updateProgress(section) {
        const progress = {
            section: section.id,
            timestamp: new Date().toISOString()
        };
        // Send progress update to server
    }
}

class PracticeExercise {
    constructor(container, exerciseData) {
        this.container = container;
        this.data = exerciseData;
        this.editor = null;
        this.setupCodeEditor();
        this.setupControls();
    }

    setupCodeEditor() {
        // Using Monaco Editor as an example
        require(['vs/editor/editor.main'], () => {
            this.editor = monaco.editor.create(
                this.container.querySelector('.code-editor'),
                {
                    value: this.data.initialCode || '',
                    language: this.data.language,
                    theme: 'vs-dark',
                    minimap: { enabled: false },
                    automaticLayout: true
                }
            );
        });
    }

    setupControls() {
        const hintBtn = this.container.querySelector('.hint-btn');
        const solutionBtn = this.container.querySelector('.solution-btn');
        const resetBtn = this.container.querySelector('.reset-btn');
        const runBtn = this.container.querySelector('.run-btn');

        hintBtn?.addEventListener('click', () => this.showHint());
        solutionBtn?.addEventListener('click', () => this.showSolution());
        resetBtn?.addEventListener('click', () => this.resetCode());
        runBtn?.addEventListener('click', () => this.runCode());
    }

    showHint() {
        const hintPanel = this.container.querySelector('.hint-panel');
        const currentHint = this.data.hints[this.currentHintIndex];
        
        hintPanel.textContent = currentHint;
        hintPanel.classList.add('visible');
        
        this.currentHintIndex = (this.currentHintIndex + 1) % this.data.hints.length;
    }

    showSolution() {
        if (confirm('Are you sure you want to see the solution?')) {
            const solutionPanel = this.container.querySelector('.solution-panel');
            solutionPanel.textContent = this.data.solution;
            solutionPanel.classList.add('visible');
        }
    }

    resetCode() {
        if (confirm('Are you sure you want to reset your code?')) {
            this.editor.setValue(this.data.initialCode || '');
        }
    }

    async runCode() {
        const code = this.editor.getValue();
        try {
            // Implementation for code execution
            // This could involve sending to a backend service
            const result = await this.executeCode(code);
            this.showResult(result);
        } catch (error) {
            this.showError(error);
        }
    }

    async executeCode(code) {
        // Implementation for code execution
    }

    showResult(result) {
        const output = this.container.querySelector('.output-panel');
        output.textContent = result;
        output.classList.remove('error');
    }

    showError(error) {
        const output = this.container.querySelector('.output-panel');
        output.textContent = error.message;
        output.classList.add('error');
    }
}
