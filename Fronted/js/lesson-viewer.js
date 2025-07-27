// Lesson Viewer JavaScript

let currentLesson = null;
let courseData = null;
let userNotes = {};

async function fetchLessonDetails(lessonId) {
    try {
        const response = await fetch(`http://localhost:3000/api/lessons/${lessonId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            }
        });
        return await response.json();
    } catch (error) {
        console.error('Error fetching lesson details:', error);
        return null;
    }
}

async function fetchCourseDetails(courseId) {
    try {
        const response = await fetch(`http://localhost:3000/api/courses/${courseId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            }
        });
        return await response.json();
    } catch (error) {
        console.error('Error fetching course details:', error);
        return null;
    }
}

function renderLessonHeader(lesson) {
    const header = document.querySelector('.lesson-header');
    
    header.innerHTML = `
        <h1 class="lesson-title">${lesson.title}</h1>
        <div class="lesson-duration">
            <i class="fas fa-clock"></i>
            <span>${lesson.duration}</span>
        </div>
    `;
}

function renderLessonContent(lesson) {
    const content = document.querySelector('.lesson-body');
    
    if (lesson.type === 'video') {
        content.innerHTML = `
            <div class="video-wrapper">
                <iframe 
                    src="${lesson.content}"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen>
                </iframe>
            </div>
            <div class="lesson-text">
                ${lesson.description}
            </div>
        `;
    } else if (lesson.type === 'interactive') {
        content.innerHTML = `
            <div class="interactive-element">
                <iframe 
                    src="${lesson.content}"
                    frameborder="0"
                    style="width: 100%; height: 600px;">
                </iframe>
            </div>
        `;
    } else {
        content.innerHTML = `
            <div class="lesson-text">
                ${lesson.content}
            </div>
        `;
    }
}

function renderLessonOverview(lesson) {
    const overview = document.querySelector('.overview-content');
    
    overview.innerHTML = `
        <p>${lesson.description}</p>
        <div class="lesson-objectives">
            <h4>Learning Objectives:</h4>
            <ul>
                ${lesson.objectives?.map(obj => `<li>${obj}</li>`).join('') || ''}
            </ul>
        </div>
    `;
}

function renderResources(lesson) {
    const resourcesList = document.querySelector('.resources-list');
    
    const resourceTypes = {
        'pdf': { icon: 'file-pdf', color: '#dc2626' },
        'video': { icon: 'video', color: '#2563eb' },
        'practice': { icon: 'pencil-alt', color: '#059669' }
    };
    
    resourcesList.innerHTML = lesson.resources?.map(resource => {
        const type = resource.type || 'pdf';
        const resourceInfo = resourceTypes[type];
        
        return `
            <div class="resource-item" onclick="openResource('${resource.url}')">
                <div class="resource-icon">
                    <i class="fas fa-${resourceInfo.icon}" style="color: ${resourceInfo.color}"></i>
                </div>
                <div class="resource-info">
                    <div class="resource-title">${resource.title}</div>
                    <div class="resource-type">${type.toUpperCase()}</div>
                </div>
            </div>
        `;
    }).join('') || '<p>No additional resources available</p>';
}

function updateProgressIndicator(courseData, currentLessonId) {
    const progressDots = document.querySelector('.progress-dots');
    const currentIndex = courseData.lessons.findIndex(l => l.id === currentLessonId);
    
    progressDots.innerHTML = courseData.lessons.map((lesson, index) => {
        const status = index < currentIndex ? 'completed' : 
                      index === currentIndex ? 'current' : '';
        return `<div class="progress-dot ${status}"></div>`;
    }).join('');
    
    // Update lesson counter
    document.querySelector('.current-lesson').textContent = `Lesson ${currentIndex + 1}`;
    document.querySelector('.total-lessons').textContent = `of ${courseData.lessons.length} Lessons`;
    
    // Update navigation buttons
    const prevBtn = document.querySelector('.prev-lesson');
    const nextBtn = document.querySelector('.next-lesson');
    
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === courseData.lessons.length - 1;
}

function setupNavigation(courseData, currentLessonId) {
    const currentIndex = courseData.lessons.findIndex(l => l.id === currentLessonId);
    
    // Back to course button
    document.querySelector('.back-to-course').href = `course-details.html?id=${courseData.id}`;
    
    // Previous lesson button
    const prevBtn = document.querySelector('.prev-lesson');
    prevBtn.onclick = () => {
        if (currentIndex > 0) {
            navigateToLesson(courseData.lessons[currentIndex - 1].id);
        }
    };
    
    // Next lesson button
    const nextBtn = document.querySelector('.next-lesson');
    nextBtn.onclick = () => {
        if (currentIndex < courseData.lessons.length - 1) {
            navigateToLesson(courseData.lessons[currentIndex + 1].id);
        }
    };
}

function setupNotes() {
    const notesEditor = document.querySelector('.notes-editor');
    const saveButton = document.querySelector('.save-notes-btn');
    
    // Load existing notes
    notesEditor.value = userNotes[currentLesson.id] || '';
    
    // Save notes
    saveButton.onclick = () => {
        userNotes[currentLesson.id] = notesEditor.value;
        localStorage.setItem('lessonNotes', JSON.stringify(userNotes));
        
        // Show save confirmation
        saveButton.innerHTML = '<i class="fas fa-check"></i> Saved!';
        setTimeout(() => {
            saveButton.innerHTML = '<i class="fas fa-save"></i> Save Notes';
        }, 2000);
    };
}

async function markLessonComplete() {
    try {
        const response = await fetch(`http://localhost:3000/api/lessons/${currentLesson.id}/complete`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            }
        });
        
        if (response.ok) {
            const completeBtn = document.querySelector('.complete-lesson-btn');
            completeBtn.innerHTML = '<i class="fas fa-check-circle"></i> Completed';
            completeBtn.disabled = true;
            
            // Auto-navigate to next lesson after 2 seconds
            setTimeout(() => {
                const currentIndex = courseData.lessons.findIndex(l => l.id === currentLesson.id);
                if (currentIndex < courseData.lessons.length - 1) {
                    navigateToLesson(courseData.lessons[currentIndex + 1].id);
                }
            }, 2000);
        }
    } catch (error) {
        console.error('Error marking lesson as complete:', error);
    }
}

function navigateToLesson(lessonId) {
    window.location.href = `lesson-viewer.html?id=${lessonId}`;
}

function openResource(url) {
    window.open(url, '_blank');
}

async function initializeLessonViewer() {
    // Load saved notes
    userNotes = JSON.parse(localStorage.getItem('lessonNotes') || '{}');
    
    // Get lesson ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const lessonId = urlParams.get('id');
    
    if (!lessonId) {
        window.location.href = 'courses.html';
        return;
    }
    
    try {
        // Show loading state
        document.querySelector('.lesson-container').innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                Loading lesson...
            </div>
        `;
        
        // Fetch lesson details
        currentLesson = await fetchLessonDetails(lessonId);
        if (!currentLesson) {
            throw new Error('Lesson not found');
        }
        
        // Fetch course details
        courseData = await fetchCourseDetails(currentLesson.courseId);
        if (!courseData) {
            throw new Error('Course not found');
        }
        
        // Render all sections
        renderLessonHeader(currentLesson);
        renderLessonContent(currentLesson);
        renderLessonOverview(currentLesson);
        renderResources(currentLesson);
        updateProgressIndicator(courseData, lessonId);
        setupNavigation(courseData, lessonId);
        setupNotes();
        
        // Setup complete button
        document.querySelector('.complete-lesson-btn').onclick = markLessonComplete;
        
    } catch (error) {
        console.error('Error initializing lesson viewer:', error);
        document.querySelector('.lesson-container').innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Failed to load lesson. Please try again later.</p>
                <button onclick="window.location.reload()">Retry</button>
            </div>
        `;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeLessonViewer);
