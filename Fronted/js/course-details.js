// Course Details Page JavaScript

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

async function fetchCourseProgress(courseId) {
    try {
        const response = await fetch(`http://localhost:3000/api/courses/${courseId}/progress`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            }
        });
        return await response.json();
    } catch (error) {
        console.error('Error fetching course progress:', error);
        return null;
    }
}

async function fetchCourseQuizzes(courseId) {
    try {
        const response = await fetch(`http://localhost:3000/api/quizzes/course/${courseId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            }
        });
        return await response.json();
    } catch (error) {
        console.error('Error fetching course quizzes:', error);
        return null;
    }
}

function getCourseIcon(subjects) {
    const iconMap = {
        'algebra': 'calculator',
        'geometry': 'shapes',
        'statistics': 'chart-line',
        'grammar': 'book',
        'creative-writing': 'pen-fancy',
        'modern-novels': 'book-open',
        'history': 'landmark',
        'science': 'flask',
        'computer': 'laptop-code'
    };
    return iconMap[subjects[0]] || 'graduation-cap';
}

function renderCourseHeader(course, progress) {
    const headerSection = document.querySelector('.course-details-header');
    const icon = getCourseIcon(course.subjects);
    
    headerSection.innerHTML = `
        <div class="course-title-section">
            <div class="course-icon">
                <i class="fas fa-${icon}"></i>
            </div>
            <div class="course-info">
                <h1>${course.title}</h1>
                <p>${course.description}</p>
            </div>
        </div>
        <div class="course-meta-info">
            <div class="meta-group">
                <i class="fas fa-clock"></i>
                <span>${course.duration}</span>
            </div>
            <div class="meta-group">
                <i class="fas fa-book"></i>
                <span>${course.totalLessons} Lessons</span>
            </div>
            <div class="meta-group">
                <i class="fas fa-quiz"></i>
                <span>${course.totalQuizzes} Quizzes</span>
            </div>
            <div class="meta-group">
                <i class="fas fa-signal"></i>
                <span>${course.difficulty}</span>
            </div>
        </div>
        <div class="course-progress">
            <div class="completion-label">
                <span>Course Progress</span>
                <span>${progress?.progress || 0}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress?.progress || 0}%"></div>
            </div>
        </div>
    `;
}

function renderLessons(course, progress) {
    const lessonsContainer = document.querySelector('.lessons-list');
    
    lessonsContainer.innerHTML = course.lessons.map(lesson => {
        const isCompleted = progress?.completedLessons?.includes(lesson.id);
        const status = isCompleted ? 'completed' : 'in-progress';
        
        return `
            <div class="lesson-card" onclick="startLesson('${lesson.id}')">
                <div class="lesson-icon">
                    <i class="fas fa-${lesson.type === 'video' ? 'play' : 'tasks'}"></i>
                </div>
                <div class="lesson-info">
                    <h3 class="lesson-title">${lesson.title}</h3>
                    <p class="lesson-duration">
                        <i class="fas fa-clock"></i>
                        <span>${lesson.duration}</span>
                    </p>
                </div>
                <div class="lesson-status status-${status}">
                    <i class="fas fa-${isCompleted ? 'check' : 'arrow-right'}"></i>
                    ${isCompleted ? 'Completed' : 'Start'}
                </div>
            </div>
        `;
    }).join('');
}

function renderQuizzes(quizzes, progress) {
    const quizzesContainer = document.querySelector('.quizzes-list');
    
    quizzesContainer.innerHTML = quizzes.map(quiz => {
        const isCompleted = progress?.completedQuizzes?.includes(quiz.id);
        const status = isCompleted ? 'completed' : 'in-progress';
        
        return `
            <div class="quiz-card" onclick="startQuiz('${quiz.id}')">
                <div class="quiz-icon">
                    <i class="fas fa-question-circle"></i>
                </div>
                <div class="quiz-info">
                    <h3 class="quiz-title">${quiz.title}</h3>
                    <div class="quiz-meta">
                        <span class="quiz-duration">
                            <i class="fas fa-clock"></i>
                            ${quiz.duration}
                        </span>
                        <span class="quiz-questions">
                            <i class="fas fa-list"></i>
                            ${quiz.totalQuestions} Questions
                        </span>
                    </div>
                </div>
                <div class="quiz-status status-${status}">
                    <i class="fas fa-${isCompleted ? 'check' : 'arrow-right'}"></i>
                    ${isCompleted ? 'Completed' : 'Start Quiz'}
                </div>
            </div>
        `;
    }).join('');
}

function renderResources(course) {
    const resourcesContainer = document.querySelector('.resources-list');
    
    const resourceTypes = {
        'pdf': { icon: 'file-pdf', color: '#dc2626' },
        'video': { icon: 'video', color: '#2563eb' },
        'practice': { icon: 'pencil-alt', color: '#059669' }
    };
    
    resourcesContainer.innerHTML = course.resources.map(resource => {
        const type = resource.split('-')[0];
        const resourceInfo = resourceTypes[type] || { icon: 'file', color: '#6b7280' };
        
        return `
            <div class="resource-card">
                <div class="resource-icon" style="color: ${resourceInfo.color}">
                    <i class="fas fa-${resourceInfo.icon}"></i>
                </div>
                <h3 class="resource-title">${resource.split('-').join(' ').toUpperCase()}</h3>
                <p class="resource-description">
                    Access your ${type} materials for this course
                </p>
                <button class="download-btn" onclick="downloadResource('${resource}')">
                    <i class="fas fa-download"></i>
                    Download
                </button>
            </div>
        `;
    }).join('');
}

function initializeTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and panes
            tabs.forEach(t => t.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding pane
            tab.classList.add('active');
            const pane = document.getElementById(tab.dataset.tab);
            pane.classList.add('active');
        });
    });
}

function startLesson(lessonId) {
    window.location.href = `lesson-viewer.html?id=${lessonId}`;
}

function startQuiz(quizId) {
    window.location.href = `quiz.html?id=${quizId}`;
}

function downloadResource(resource) {
    // Implement resource download functionality
    console.log(`Downloading resource: ${resource}`);
}

async function initializeCoursePage() {
    // Get course ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('id');
    
    if (!courseId) {
        window.location.href = 'courses.html';
        return;
    }
    
    try {
        // Fetch all required data
        const [course, progress, quizzes] = await Promise.all([
            fetchCourseDetails(courseId),
            fetchCourseProgress(courseId),
            fetchCourseQuizzes(courseId)
        ]);
        
        if (!course) {
            throw new Error('Course not found');
        }
        
        // Render all sections
        renderCourseHeader(course, progress);
        renderLessons(course, progress);
        renderQuizzes(quizzes, progress);
        renderResources(course);
        
        // Initialize tabs
        initializeTabs();
        
    } catch (error) {
        console.error('Error initializing course page:', error);
        // Show error message to user
        document.querySelector('.course-details-container').innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Failed to load course details. Please try again later.</p>
                <button onclick="window.location.reload()">Retry</button>
            </div>
        `;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeCoursePage);
