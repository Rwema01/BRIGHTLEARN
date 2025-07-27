// Interactive Assessment Handler

class AssessmentManager {
    constructor(container, config) {
        this.container = container;
        this.config = {
            autoGrade: true,
            showFeedback: true,
            allowRetries: true,
            ...config
        };
        this.score = 0;
        this.attempts = 0;
        this.questions = [];
        this.currentQuestionIndex = 0;
    }

    async loadAssessment(assessmentId) {
        try {
            const response = await fetch(`/api/assessments/${assessmentId}`);
            const data = await response.json();
            this.questions = data.questions;
            this.render();
        } catch (error) {
            console.error('Error loading assessment:', error);
            this.showError('Failed to load assessment');
        }
    }

    render() {
        const question = this.questions[this.currentQuestionIndex];
        const container = document.createElement('div');
        container.className = 'assessment-container lesson-fade-in';
        
        container.innerHTML = `
            <div class="assessment-header">
                <div class="question-counter">
                    Question ${this.currentQuestionIndex + 1} of ${this.questions.length}
                </div>
                <div class="score-display" aria-live="polite">
                    Score: ${this.score}/${this.questions.length}
                </div>
            </div>
            <div class="question-container" role="region" aria-label="Current Question">
                ${this.renderQuestion(question)}
            </div>
            <div class="assessment-controls">
                ${this.renderControls()}
            </div>
            <div class="feedback-area" aria-live="polite"></div>
        `;

        this.container.innerHTML = '';
        this.container.appendChild(container);
        this.attachEventListeners();
    }

    renderQuestion(question) {
        switch (question.type) {
            case 'multiple-choice':
                return this.renderMultipleChoice(question);
            case 'matching':
                return this.renderMatching(question);
            case 'coding':
                return this.renderCoding(question);
            case 'fill-blank':
                return this.renderFillBlank(question);
            default:
                return this.renderMultipleChoice(question);
        }
    }

    renderMultipleChoice(question) {
        return `
            <div class="question-content">
                <h3 class="question-text">${question.text}</h3>
                <div class="options-grid" role="radiogroup" aria-label="Answer options">
                    ${question.options.map((option, index) => `
                        <div class="option-card" role="radio" tabindex="0" data-index="${index}">
                            <div class="option-content">
                                ${option.text}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderMatching(question) {
        const shuffledTargets = this.shuffleArray([...question.targets]);
        return `
            <div class="matching-exercise">
                <h3 class="question-text">${question.text}</h3>
                <div class="matching-container">
                    <div class="sources-list">
                        ${question.sources.map((source, index) => `
                            <div class="draggable source-item" draggable="true" data-index="${index}">
                                ${source.text}
                            </div>
                        `).join('')}
                    </div>
                    <div class="targets-list">
                        ${shuffledTargets.map((target, index) => `
                            <div class="dropzone target-item" data-index="${index}">
                                <div class="target-text">${target.text}</div>
                                <div class="drop-area" data-target="${target.id}"></div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    renderCoding(question) {
        return `
            <div class="coding-exercise">
                <h3 class="question-text">${question.text}</h3>
                <div class="code-workspace">
                    <div class="code-editor-container" id="codeEditor"></div>
                    <div class="code-output">
                        <div class="output-header">
                            <h4>Output</h4>
                            <button class="run-btn">Run Code</button>
                        </div>
                        <div class="output-content"></div>
                    </div>
                </div>
                <div class="test-cases">
                    ${question.testCases.map(testCase => `
                        <div class="test-case">
                            <div class="test-input">Input: ${testCase.input}</div>
                            <div class="test-expected">Expected: ${testCase.expected}</div>
                            <div class="test-result"></div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderFillBlank(question) {
        const parts = question.text.split('___');
        return `
            <div class="fill-blank-exercise">
                <h3 class="question-text">Fill in the blanks:</h3>
                <div class="fill-blank-content">
                    ${parts.map((part, index) => `
                        ${part}
                        ${index < parts.length - 1 ? `
                            <input type="text" 
                                class="blank-input" 
                                data-index="${index}"
                                aria-label="Blank ${index + 1}"
                            >
                        ` : ''}
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderControls() {
        return `
            <div class="navigation-controls">
                <button class="nav-button prev" 
                    ${this.currentQuestionIndex === 0 ? 'disabled' : ''}>
                    Previous
                </button>
                <button class="submit-button">Submit Answer</button>
                <button class="nav-button next"
                    ${this.currentQuestionIndex === this.questions.length - 1 ? 'disabled' : ''}>
                    Next
                </button>
            </div>
        `;
    }

    attachEventListeners() {
        // Multiple Choice
        this.container.querySelectorAll('.option-card').forEach(option => {
            option.addEventListener('click', () => this.handleOptionSelect(option));
            option.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    this.handleOptionSelect(option);
                }
            });
        });

        // Navigation
        this.container.querySelector('.prev')?.addEventListener('click', 
            () => this.navigate(-1));
        this.container.querySelector('.next')?.addEventListener('click', 
            () => this.navigate(1));
        this.container.querySelector('.submit-button')?.addEventListener('click', 
            () => this.submitAnswer());

        // Matching Exercise
        this.setupDragAndDrop();

        // Coding Exercise
        this.setupCodeEditor();
    }

    handleOptionSelect(option) {
        this.container.querySelectorAll('.option-card').forEach(opt => 
            opt.classList.remove('selected'));
        option.classList.add('selected');
    }

    setupDragAndDrop() {
        const draggables = this.container.querySelectorAll('.draggable');
        const dropzones = this.container.querySelectorAll('.dropzone');

        draggables.forEach(draggable => {
            draggable.addEventListener('dragstart', this.handleDragStart.bind(this));
            draggable.addEventListener('dragend', this.handleDragEnd.bind(this));
        });

        dropzones.forEach(dropzone => {
            dropzone.addEventListener('dragover', this.handleDragOver.bind(this));
            dropzone.addEventListener('drop', this.handleDrop.bind(this));
        });
    }

    setupCodeEditor() {
        const editorContainer = this.container.querySelector('#codeEditor');
        if (editorContainer) {
            require(['vs/editor/editor.main'], () => {
                this.editor = monaco.editor.create(editorContainer, {
                    value: this.questions[this.currentQuestionIndex].starterCode || '',
                    language: this.questions[this.currentQuestionIndex].language,
                    theme: 'vs-dark',
                    minimap: { enabled: false },
                    automaticLayout: true
                });

                this.container.querySelector('.run-btn')?.addEventListener('click', 
                    () => this.runCode());
            });
        }
    }

    async runCode() {
        const code = this.editor.getValue();
        const outputContent = this.container.querySelector('.output-content');
        const testCases = this.questions[this.currentQuestionIndex].testCases;

        outputContent.innerHTML = 'Running tests...';
        
        try {
            const results = await this.executeTests(code, testCases);
            this.displayTestResults(results);
        } catch (error) {
            outputContent.innerHTML = `Error: ${error.message}`;
        }
    }

    async executeTests(code, testCases) {
        // Implementation for test execution
        // This would typically involve sending the code to a secure backend
        return [];
    }

    displayTestResults(results) {
        const testElements = this.container.querySelectorAll('.test-case');
        results.forEach((result, index) => {
            const testElement = testElements[index];
            const resultElement = testElement.querySelector('.test-result');
            
            resultElement.textContent = result.passed ? 'Passed ✓' : 'Failed ✗';
            resultElement.className = `test-result ${result.passed ? 'passed' : 'failed'}`;
        });
    }

    navigate(delta) {
        const newIndex = this.currentQuestionIndex + delta;
        if (newIndex >= 0 && newIndex < this.questions.length) {
            this.currentQuestionIndex = newIndex;
            this.render();
        }
    }

    async submitAnswer() {
        const question = this.questions[this.currentQuestionIndex];
        let isCorrect = false;

        switch (question.type) {
            case 'multiple-choice':
                isCorrect = this.gradeMultipleChoice();
                break;
            case 'matching':
                isCorrect = this.gradeMatching();
                break;
            case 'coding':
                isCorrect = await this.gradeCoding();
                break;
            case 'fill-blank':
                isCorrect = this.gradeFillBlank();
                break;
        }

        this.showFeedback(isCorrect);
        if (isCorrect) {
            this.score++;
            setTimeout(() => this.navigate(1), 1500);
        }
    }

    showFeedback(isCorrect) {
        const feedbackArea = this.container.querySelector('.feedback-area');
        feedbackArea.innerHTML = `
            <div class="feedback ${isCorrect ? 'correct' : 'incorrect'}">
                ${isCorrect ? 'Correct!' : 'Try again!'}
            </div>
        `;
        feedbackArea.classList.add('visible');
    }

    // Utility methods
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    showError(message) {
        this.container.innerHTML = `
            <div class="error-message">
                <p>${message}</p>
                <button onclick="location.reload()">Retry</button>
            </div>
        `;
    }
}

export default AssessmentManager;
