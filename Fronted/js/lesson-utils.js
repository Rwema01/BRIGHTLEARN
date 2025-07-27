// Utility functions for lesson components

class ProgressTracker {
    constructor(lessonId, userId) {
        this.lessonId = lessonId;
        this.userId = userId;
        this.startTime = new Date();
        this.checkpoints = [];
    }

    addCheckpoint(type, data) {
        this.checkpoints.push({
            type,
            data,
            timestamp: new Date().toISOString()
        });
    }

    async saveProgress() {
        const progress = {
            lessonId: this.lessonId,
            userId: this.userId,
            duration: new Date() - this.startTime,
            checkpoints: this.checkpoints,
            completedAt: new Date().toISOString()
        };

        try {
            const response = await fetch('/api/progress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(progress)
            });
            return await response.json();
        } catch (error) {
            console.error('Error saving progress:', error);
            // Store locally if server is unavailable
            localStorage.setItem(`progress_${this.lessonId}`, JSON.stringify(progress));
        }
    }
}

class InteractivityManager {
    constructor(container) {
        this.container = container;
        this.interactions = [];
        this.setupDragAndDrop();
        this.setupHighlighting();
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

    setupHighlighting() {
        const highlightables = this.container.querySelectorAll('.highlightable');
        highlightables.forEach(element => {
            element.addEventListener('click', () => {
                element.classList.toggle('highlighted');
                this.recordInteraction('highlight', {
                    elementId: element.id,
                    isHighlighted: element.classList.contains('highlighted')
                });
            });
        });
    }

    handleDragStart(e) {
        e.target.classList.add('dragging');
        e.dataTransfer.setData('text/plain', e.target.id);
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
    }

    handleDragOver(e) {
        e.preventDefault();
        e.target.classList.add('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData('text/plain');
        const draggedElement = document.getElementById(draggedId);
        const dropzone = e.target.closest('.dropzone');
        
        dropzone.classList.remove('drag-over');
        
        if (this.validateDrop(draggedElement, dropzone)) {
            dropzone.appendChild(draggedElement);
            this.recordInteraction('drop', {
                elementId: draggedId,
                dropzoneId: dropzone.id
            });
        }
    }

    validateDrop(element, dropzone) {
        return element.dataset.type === dropzone.dataset.accepts;
    }

    recordInteraction(type, data) {
        this.interactions.push({
            type,
            data,
            timestamp: new Date().toISOString()
        });
    }

    getInteractions() {
        return this.interactions;
    }
}

class AccessibilityHelper {
    constructor(container) {
        this.container = container;
        this.setupKeyboardNavigation();
        this.setupScreenReaderSupport();
    }

    setupKeyboardNavigation() {
        this.container.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.handleTabNavigation(e);
            } else if (e.key === 'Enter' || e.key === ' ') {
                this.handleActivation(e);
            }
        });
    }

    setupScreenReaderSupport() {
        const interactiveElements = this.container.querySelectorAll('button, a, input, [role="button"]');
        interactiveElements.forEach(element => {
            if (!element.getAttribute('aria-label')) {
                element.setAttribute('aria-label', element.textContent.trim());
            }
        });
    }

    handleTabNavigation(e) {
        const focusableElements = this.container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    }

    handleActivation(e) {
        const target = e.target;
        if (target.getAttribute('role') === 'button' || target.tagName === 'BUTTON') {
            e.preventDefault();
            target.click();
        }
    }
}

class MediaManager {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.sounds = new Map();
    }

    async loadSound(name, url) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.sounds.set(name, audioBuffer);
        } catch (error) {
            console.error(`Error loading sound ${name}:`, error);
        }
    }

    playSound(name) {
        const sound = this.sounds.get(name);
        if (sound) {
            const source = this.audioContext.createBufferSource();
            source.buffer = sound;
            source.connect(this.audioContext.destination);
            source.start(0);
        }
    }

    async loadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });
    }
}

export { ProgressTracker, InteractivityManager, AccessibilityHelper, MediaManager };
