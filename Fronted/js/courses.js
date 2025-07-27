// Fetch courses from the backend
async function fetchCourses() {
    try {
        const response = await fetch('http://localhost:3000/api/courses', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            }
        });
        const data = await response.json();
        return data.courses;
    } catch (error) {
        console.error('Error fetching courses:', error);
        return [];
    }
}

// Fetch user progress
async function fetchUserProgress() {
    try {
        const response = await fetch('http://localhost:3000/api/progress', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            }
        });
        const data = await response.json();
        return data.progress;
    } catch (error) {
        console.error('Error fetching progress:', error);
        return [];
    }
}

// Get appropriate icon for course subject
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

// Format duration string
function formatDuration(duration) {
    return duration.replace('weeks', 'Weeks').replace('days', 'Days');
}

// Render course card
function renderCourseCard(course, progress) {
    const courseProgress = progress.find(p => p.courseId === course.id) || { progress: 0 };
    const icon = getCourseIcon(course.subjects);
    
    return `
        <div class="course-card">
            <div class="course-banner">
                <i class="fas fa-${icon}"></i>
                <h3>${course.title}</h3>
            </div>
            <div class="course-info">
                <p class="course-description">${course.description}</p>
                <div class="course-meta">
                    <div class="meta-item">
                        <i class="fas fa-clock"></i>
                        <span>${formatDuration(course.duration)}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-book"></i>
                        <span>${course.totalLessons} Lessons</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-quiz"></i>
                        <span>${course.totalQuizzes} Quizzes</span>
                    </div>
                </div>
                <div class="course-progress">
                    <div class="completion-label">
                        <span>Progress</span>
                        <span>${courseProgress.progress}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${courseProgress.progress}%"></div>
                    </div>
                </div>
                <div class="course-actions">
                    <button class="course-btn continue-btn" onclick="continueCourse('${course.id}')">
                        ${courseProgress.progress > 0 ? 'Continue' : 'Start'} Course
                    </button>
                    <button class="course-btn details-btn" onclick="viewCourseDetails('${course.id}')">
                        View Details
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Initialize courses page
async function initCoursesPage() {
    const coursesContainer = document.querySelector('.courses-grid');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // Show loading state
    coursesContainer.innerHTML = '<div class="loading">Loading courses...</div>';
    
    try {
        // Fetch courses and progress in parallel
        const [courses, progress] = await Promise.all([
            fetchCourses(),
            fetchUserProgress()
        ]);
        
        // Render all courses
        function renderCourses(filteredCourses = courses) {
            coursesContainer.innerHTML = filteredCourses
                .map(course => renderCourseCard(course, progress))
                .join('');
        }
        
        // Initialize with all courses
        renderCourses();
        
        // Add filter functionality
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                
                // Update active state
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Filter courses
                const filteredCourses = filter === 'all' 
                    ? courses 
                    : courses.filter(course => course.subjects.includes(filter));
                
                renderCourses(filteredCourses);
            });
        });
        
    } catch (error) {
        console.error('Error initializing courses page:', error);
        coursesContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Failed to load courses. Please try again later.</p>
            </div>
        `;
    }
}

// Navigation functions
function continueCourse(courseId) {
    window.location.href = `course-content.html?id=${courseId}`;
}

function viewCourseDetails(courseId) {
    window.location.href = `course-details.html?id=${courseId}`;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initCoursesPage);
