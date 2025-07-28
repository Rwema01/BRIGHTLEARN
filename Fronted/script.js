// API Base URL
const BASE_URL = 'https://brightlearnbackend.onrender.com/api';

// Helper function to safely handle DOM elements that might not exist
function safeAddEventListener(selector, event, handler) {
    const element = document.querySelector(selector);
    if (element) {
        element.addEventListener(event, handler);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (!token || !userId) {
        window.location.replace('login.html');
        return;
    }

    // === LOGOUT FUNCTIONALITY ===
    // Use safer method with try-catch to prevent errors in production
    try {
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                localStorage.clear();
                sessionStorage.clear();
                window.location.replace("login.html");
            });
        }
    } catch (err) {
        console.warn('Logout button not available on this page');
    }

    // === NAVIGATION HIGHLIGHT ===
    const navLinks = document.querySelectorAll('.nav-links li a');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href').split('/').pop();
        if (linkPage === currentPage) {
            link.classList.add('active');
        }
    });

    // === DASHBOARD INITIALIZATION ===
    async function initializeDashboard() {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');

        if (!token || !userId) {
            window.location.replace('login.html');
            return;
        }

        try {
            // Fetch dashboard summary from backend
            const dashboardResponse = await fetch(`${BASE_URL}/dashboard/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const dashboard = await dashboardResponse.json();

            // Update welcome name
            document.querySelector('.student-name').textContent = dashboard.name;

            // Update learning overview
            document.querySelector('.progress-details').innerHTML = `
                <p>• Overall: ${dashboard.overallProgress}%</p>
                <p>• Trend: ↗ ${dashboard.overallProgress}%</p>
            `;

            // Update quick stats
            document.querySelector('.quick-stats ul').innerHTML = `
                <li>• Total Courses: ${dashboard.totalCourses}</li>
                <li>• Completed: ${dashboard.completedCourses}/${dashboard.totalCourses} (${dashboard.completedCourses > 0 ? Math.round((dashboard.completedCourses/dashboard.totalCourses)*100) : 0}%)</li>
                <li>• Avg. Score: ${dashboard.avgScore}% (${dashboard.passing ? 'Passing' : 'Not Passing'})</li>
                <li>• Streak: ${dashboard.streak} days 🔥</li>
            `;

            // Update recent activity
            const activityList = document.querySelector('.activity-list');
            activityList.innerHTML = dashboard.recentActivity.map(activity => `
                <div class="activity-item">
                    <span class="activity-date">${new Date(activity.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <span class="activity-course">${activity.type || activity.description || 'Activity'}</span>
                    <span class="activity-score passed">${activity.score ? activity.score + '%' : ''} ✅</span>
                </div>
            `).join('');

            // Update progress chart (doughnut)
            const ctx = document.getElementById('progressChart')?.getContext('2d');
            if (ctx) {
                new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Completed', 'Remaining'],
                        datasets: [{
                            data: [dashboard.overallProgress, 100-dashboard.overallProgress],
                            backgroundColor: ['#3A86FF', '#E0E0E0'],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        cutout: '70%',
                        plugins: {
                            legend: { display: false },
                            tooltip: { enabled: false }
                        }
                    }
                });
            }

            // === DYNAMIC: YOUR COURSES ===
            function getCourseIcon(title) {
                const map = {
                    'math': '🧮',
                    'mathematics': '🧮',
                    'english': '🖊️',
                    'history': '🏛️',
                    'science': '🔬',
                    'algebra': '➗',
                    'geometry': '📐',
                    'literature': '📚',
                    'civics': '🏛️',
                    'writing': '✍️',
                    'essay': '✍️',
                    'civilization': '🏺',
                };
                const key = title.toLowerCase();
                for (const k in map) {
                    if (key.includes(k)) return map[k];
                }
                return '📘';
            }

            const coursesResponse = await fetch(`${BASE_URL}/students/${userId}/courses`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const courses = await coursesResponse.json();
            const courseCards = document.querySelector('.your-courses .course-cards');
            if (courseCards && Array.isArray(courses)) {
                courseCards.innerHTML = courses.map(course => `
                    <div class="course-card" style="cursor:pointer" onclick="window.location.href='courses.html?courseId=${course.id}'">
                        <div class="course-icon">${getCourseIcon(course.title)}</div>
                        <h4>${course.title}</h4>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${course.progress || 0}%;"></div>
                        </div>
                        <p>Progress: ${course.progress || 0}%</p>
                        <p>Last: ${course.grades && course.grades.length > 0 ? (course.grades[course.grades.length-1].score + '%') : '--'}</p>
                        <p class="course-description">${course.description || ''}</p>
                    </div>
                `).join('');
            }

            // === DYNAMIC: CONTINUE LEARNING ===
            const recResponse = await fetch(`${BASE_URL}/recommendations/user/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const recData = await recResponse.json();
            const learningCards = document.querySelector('.continue-learning .learning-cards');
            if (learningCards && recData && Array.isArray(recData.newCourses)) {
                learningCards.innerHTML = recData.newCourses.map(course => `
                    <div class="learning-card" style="cursor:pointer" onclick="window.location.href='courses.html?courseId=${course.id}'">
                        <div class="course-icon">${getCourseIcon(course.title)}</div>
                        <h4>${course.title}</h4>
                        <p>New</p>
                        <button>Start</button>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Error initializing dashboard:', error);
        }
    }

    // Initialize dashboard on load
    initializeDashboard();

    // === COURSES PAGE DYNAMIC RENDERING ===
    if (window.location.pathname.endsWith('courses.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const courseId = urlParams.get('courseId');
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        if (courseId && token && userId) {
            // Hide all-courses grid, show single course view
            const allCoursesGrid = document.querySelector('.course-cards-grid');
            if (allCoursesGrid) allCoursesGrid.style.display = 'none';
            // Fetch course details from backend
            fetch(`${BASE_URL}/courses`)
                .then(res => res.json())
                .then(courses => {
                    const course = (courses.courses || courses).find(c => c.id === courseId);
                    if (!course) return;
                    // Fetch user's progress for this course
                    fetch(`${BASE_URL}/students/${userId}/courses`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                    .then(res => res.json())
                    .then(userCourses => {
                        const userCourse = userCourses.find(c => c.id === courseId);
                        const isEnrolled = !!userCourse;
                        const progress = userCourse ? userCourse.progress : 0;
                        const lastGrade = userCourse && userCourse.grades && userCourse.grades.length > 0 
                            ? userCourse.grades[userCourse.grades.length-1].score 
                            : null;
                        // Create single course view
                        const contentSection = document.querySelector('.content-section');
                        if (contentSection) {
                            contentSection.innerHTML = `
                                <div class="single-course-view">
                                    <div class="course-header">
                                        <h2>${course.title}</h2>
                                        <div class="course-icon">${getCourseIcon(course.title)}</div>
                                    </div>
                                    <p class="course-description">${course.description || 'No description available.'}</p>
                                    
                                    ${isEnrolled ? `
                                        <div class="course-progress">
                                            <h3>Your Progress</h3>
                                            <div class="progress-bar">
                                                <div class="progress-fill" style="width: ${progress}%"></div>
                                            </div>
                                            <p>${progress}% Complete</p>
                                            ${lastGrade ? `<p>Last Grade: ${lastGrade}%</p>` : ''}
                                        </div>
                                    ` : `
                                        <div class="enrollment-section">
                                            <h3>Enroll in this course</h3>
                                            <p>Start your learning journey with this course.</p>
                                            <button onclick="enrollInCourse('${courseId}')" class="enroll-btn">Enroll Now</button>
                                        </div>
                                    `}
                                    
                                    <div class="course-details">
                                        <h3>Course Information</h3>
                                        <div class="detail-grid">
                                            <div class="detail-item">
                                                <strong>Instructor:</strong> ${course.instructor ? course.instructor.name : 'N/A'}
                                            </div>
                                            <div class="detail-item">
                                                <strong>Email:</strong> ${course.instructor ? course.instructor.email : 'N/A'}
                                            </div>
                                            <div class="detail-item">
                                                <strong>Course ID:</strong> ${course.id}
                                            </div>
                                            <div class="detail-item">
                                                <strong>Status:</strong> ${isEnrolled ? 'Enrolled' : 'Not Enrolled'}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    ${isEnrolled ? `
                                        <div class="course-actions">
                                            <h3>Continue Learning</h3>
                                            <a href="lessons.html?courseId=${courseId}" class="action-btn">View Lessons</a>
                                            <a href="assignments.html?courseId=${courseId}" class="action-btn">Assignments</a>
                                            <a href="quizzes.html?courseId=${courseId}" class="action-btn">Quizzes</a>
                                        </div>
                                    ` : ''}
                                    
                                    <a href="courses.html" class="back-btn">&larr; Back to all courses</a>
                                </div>
                            `;
                        }
                    });
                });
        }
    }

    // === ENROLLMENT FUNCTION ===
    window.enrollInCourse = function(courseId) {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        if (!token || !userId) {
            alert('Please log in to enroll in courses.');
            return;
        }
        
        fetch(`${BASE_URL}/students/${userId}/enroll`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ courseId })
        })
        .then(res => res.json())
        .then(data => {
            if (data.message) {
                alert('Successfully enrolled!');
                location.reload(); // Refresh to show enrolled state
            } else {
                alert('Enrollment failed. Please try again.');
                }
        })
        .catch(err => {
            console.error('Enrollment error:', err);
            alert('Enrollment failed. Please try again.');
        });
    };

// PROFILE DROPDOWN
// Profile dropdown functionality
    // Profile and Notification Links
    safeAddEventListener('.profile-link', 'click', (e) => {
        e.preventDefault();
        window.location.href = 'profile.html';
    });

    safeAddEventListener('.notification-link', 'click', (e) => {
        e.preventDefault();
        window.location.href = 'notifications.html';
    });

    safeAddEventListener('.profile-dropdown', 'click', (e) => {
        e.preventDefault();
        window.location.href = 'profile.html';
    });
const profileIcon = document.querySelector('.profile-icon');

// NOTIFICATION DROPDOWN
const notificationDropdown = document.querySelector('.notification-dropdown');
const notificationIcon = document.querySelector('.notification-icon');

if (profileIcon && profileDropdown && notificationIcon && notificationDropdown) {
    // PROFILE
    profileIcon.addEventListener('click', function (e) {
        e.stopPropagation();
        profileDropdown.classList.toggle('show');
        notificationDropdown.classList.remove('show'); // hide other dropdown
    });

    // NOTIFICATION
    notificationIcon.addEventListener('click', function (e) {
        e.stopPropagation();
        notificationDropdown.classList.toggle('show');
        profileDropdown.classList.remove('show'); // hide other dropdown

        if (notificationDropdown.classList.contains('show')) {
            markNotificationsAsRead();
        }
    });

    // CLOSE BOTH ON OUTSIDE CLICK
    document.addEventListener('click', function () {
        profileDropdown.classList.remove('show');
        notificationDropdown.classList.remove('show');
    });
}

    // === HISTORY PAGE (Optimized Filter) ===
    const courseFilter = document.getElementById('course-filter');
    const dateFilter = document.getElementById('date-filter');
    
    if (courseFilter && dateFilter) {
        const applyFilters = () => {
            const courseValue = courseFilter.value;
            const dateValue = dateFilter.value;
            
            document.querySelectorAll('.history-item').forEach(item => {
                const showItem = 
                    (courseValue === 'all' || item.dataset.course === courseValue) &&
                    (dateValue === 'all' || 
                     (dateValue === 'week' && ['Today', 'Yesterday'].includes(
                         item.querySelector('.history-date')?.textContent)));
                
                item.style.display = showItem ? 'flex' : 'none';
            });
        };
        
        courseFilter.addEventListener('change', applyFilters);
        dateFilter.addEventListener('change', applyFilters);
    }

    // === HELP PAGE (Fixed Typo + Prevent Default) ===
    const helpSearchInput = document.querySelector('.help-search-input');
    document.querySelector('.help-search-btn')?.addEventListener('click', function(e) {
        e.preventDefault();
        if (helpSearchInput?.value.trim()) {
            alert(`Searching for: ${helpSearchInput.value.trim()}`);
        }
    });

    document.querySelector('.contact-btn')?.addEventListener('click', function(e) {
        e.preventDefault();
        alert('Contact support form would open here');
    });

    // ===== COURSE CARD INTERACTIONS =====
    const courseCards = document.querySelectorAll('.course-card');
    
    courseCards.forEach(card => {
        // Add click effect to entire card (excluding buttons)
        card.addEventListener('click', function(e) {
            if (!e.target.closest('.course-button, .dropdown-btn')) {
                const courseLink = this.querySelector('.continue-btn');
                if (courseLink) {
                    window.location.href = courseLink.href;
                }
            }
        });

            // === PROFILE EDITING FUNCTIONALITY ===
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const editForm = document.getElementById('profile-edit-form');
    const viewMode = document.querySelector('.detail-view-mode');
    
    if (editProfileBtn && editForm && viewMode) {
        const cancelEditBtn = document.getElementById('cancel-edit-btn');
        
        // Toggle edit/view modes
        editProfileBtn.addEventListener('click', () => {
            viewMode.style.display = 'none';
            editForm.style.display = 'block';
            editProfileBtn.style.display = 'none';
        });
        
        cancelEditBtn.addEventListener('click', () => {
            viewMode.style.display = 'block';
            editForm.style.display = 'none';
            editProfileBtn.style.display = 'block';
        });

        // Profile picture upload
        const editPictureBtn = document.getElementById('edit-picture-btn');
        const pictureUpload = document.getElementById('profile-picture-upload');
        
        if (editPictureBtn && pictureUpload) {
            editPictureBtn.addEventListener('click', () => pictureUpload.click());
            
            pictureUpload.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    const file = e.target.files[0];
                    // Validate file type/size
                    if (!file.type.match('image.*')) {
                        alert('Please select an image file (JPEG, PNG, etc.)');
                        return;
                    }
                    if (file.size > 2 * 1024 * 1024) { // 2MB limit
                        alert('Image must be smaller than 2MB');
                        return;
                    }
                    
                    // Preview new image
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        document.querySelector('.profile-pic-large').src = event.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        // Form submission
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Update displayed values
            document.getElementById('display-name').textContent = 
                document.getElementById('edit-name').value;
            document.getElementById('display-email').textContent = 
                document.getElementById('edit-email').value;
            document.getElementById('display-bio').textContent = 
                document.getElementById('edit-bio').value;
            
            // Return to view mode
            viewMode.style.display = 'block';
            editForm.style.display = 'none';
            editProfileBtn.style.display = 'block';
            
            // Show success notification (using your existing function)
            showTemporaryNotification('Profile updated successfully!');
        });
    }

    // === PASSWORD MODAL (Integrated with existing modal logic) ===
    const passwordModal = document.getElementById('password-modal');
    if (passwordModal) {
        const changePasswordBtns = document.querySelectorAll('[id^="change-password-btn"]');
        const closeModal = document.querySelector('.close-modal');
        const closeModalBtn = document.querySelector('.close-modal-btn');
        
        // Open modal
        changePasswordBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                passwordModal.style.display = 'block';
                document.body.style.overflow = 'hidden'; // Prevent scrolling
            });
        });
        
        // Close modal (compatible with your existing modal logic)
        const closePasswordModal = () => {
            passwordModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        };
        
        if (closeModal) closeModal.addEventListener('click', closePasswordModal);
        if (closeModalBtn) closeModalBtn.addEventListener('click', closePasswordModal);
        
        // Close when clicking outside modal
        window.addEventListener('click', (e) => {
            if (e.target === passwordModal) closePasswordModal();
        });
    }

        // Progress bar animation
        const progressFill = card.querySelector('.progress-fill');
        if (progressFill) {
            const targetWidth = progressFill.style.width;
            progressFill.style.width = '0';
            setTimeout(() => {
                progressFill.style.width = targetWidth;
            }, 100);
        }
    });

    // ===== DROPDOWN MENUS =====
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const btn = dropdown.querySelector('.dropdown-btn');
        
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const content = this.nextElementSibling;
            content.style.display = content.style.display === 'block' ? 'none' : 'block';
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function() {
        document.querySelectorAll('.dropdown-content').forEach(content => {
            content.style.display = 'none';
        });
    });

    // ===== ACTIVITY LOG FILTERS =====
    const courseFilter2 = document.getElementById('course-filter');
    const timeFilter = document.getElementById('time-filter');
    
    if (courseFilter2 && timeFilter) {
        courseFilter2.addEventListener('change', filterActivities);
        timeFilter.addEventListener('change', filterActivities);
        
        function filterActivities() {
            const course = courseFilter2.value.toLowerCase();
            const timePeriod = timeFilter.value.toLowerCase();
            const activities = document.querySelectorAll('.timeline-item');
            
            activities.forEach(activity => {
                const matchesCourse = course === 'all courses' || 
                                     activity.classList.contains(course);
                const matchesTime = true; // You would implement time filtering logic here
                
                if (matchesCourse && matchesTime) {
                    activity.style.display = 'flex';
                } else {
                    activity.style.display = 'none';
                }
            });
        }
    }

    // ===== RESOURCE TABS =====
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons/contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Show corresponding content
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // ===== CERTIFICATE DOWNLOADS =====
    const downloadButtons = document.querySelectorAll('.download-btn');
    
    downloadButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            // In a real implementation, this would generate/download a PDF
            console.log('Downloading certificate...');
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparing...';
            
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-download"></i> Download';
                alert('Certificate downloaded successfully!');
            }, 1500);
        });
    });

    // ===== QUIZ FUNCTIONALITY =====
    const quizQuestions = document.querySelectorAll('.quiz-question');
    
    if (quizQuestions.length > 0) {
        // Initialize quiz
        let currentQuestion = 0;
        showQuestion(currentQuestion);
        
        // Navigation buttons
        document.querySelector('.prev').addEventListener('click', () => {
            if (currentQuestion > 0) {
                currentQuestion--;
                showQuestion(currentQuestion);
            }
        });
        
        document.querySelector('.next').addEventListener('click', () => {
            if (currentQuestion < quizQuestions.length - 1) {
                currentQuestion++;
                showQuestion(currentQuestion);
            }
        });
        
        function showQuestion(index) {
            quizQuestions.forEach((q, i) => {
                q.style.display = i === index ? 'block' : 'none';
            });
            
            // Update progress
            const progress = ((index + 1) / quizQuestions.length) * 100;
            document.querySelector('.quiz-progress .progress-fill').style.width = `${progress}%`;
            document.querySelector('.quiz-progress span').textContent = `Question ${index + 1} of ${quizQuestions.length}`;
        }
    }

    // ===== PROGRESS TRACKING =====
    if (document.querySelector('.course-header')) {
        // Simulate loading progress
        const progressBars = document.querySelectorAll('.progress-fill');
        progressBars.forEach(bar => {
            const width = bar.style.width;
            bar.style.width = '0';
            setTimeout(() => {
                bar.style.width = width;
            }, 300);
        });
        
        // Save progress to localStorage
        const continueButtons = document.querySelectorAll('.continue-btn');
        continueButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const course = this.closest('.course-card').classList[1];
                localStorage.setItem(`lastAccessed_${course}`, new Date().toISOString());
            });
        });
    }

    // Initialize certificate functionality
    initCertificateViewing();
    initCertificateFilters();
    setupActionButtons();

    // Initialize recommendation functionality
    initRecommendationFilters();
    setupActionButtons2();
    setupRefreshButton();

    // Initialize progress functionality
    initCircularProgress();
    initActivityCalendar();
    setupFilterButtons();
    setupCourseHoverEffects();
    simulateDataLoading();

    // Initialize notifications
    initNotifications();

    // === LESSONS PAGE DYNAMIC RENDERING ===
    if (window.location.pathname.endsWith('lessons.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const courseId = urlParams.get('courseId');
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        if (courseId && token && userId) {
            // Fetch course details and lessons
            Promise.all([
                fetch(`${BASE_URL}/courses`).then(res => res.json()),
                fetch(`${BASE_URL}/students/${userId}/courses`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }).then(res => res.json())
            ]).then(([coursesData, userCourses]) => {
                const course = (coursesData.courses || coursesData).find(c => c.id === courseId);
                const userCourse = userCourses.find(c => c.id === courseId);
                
                if (course) {
                    // Update page title and course name
                    document.getElementById('course-title').textContent = course.title;
                    document.getElementById('course-name').textContent = course.title;
                    
                    // Update progress
                    const progress = userCourse ? userCourse.progress : 0;
                    document.getElementById('course-progress').style.width = `${progress}%`;
                    document.getElementById('progress-text').textContent = `${progress}% Complete`;
                    
                    // Generate sample lessons (in a real app, this would come from backend)
                    const lessons = [
                        { id: 1, title: 'Introduction to Course', status: 'completed', duration: '30 min' },
                        { id: 2, title: 'Basic Concepts', status: 'completed', duration: '45 min' },
                        { id: 3, title: 'Advanced Topics', status: 'in-progress', duration: '60 min' },
                        { id: 4, title: 'Practice Exercises', status: 'not-started', duration: '30 min' },
                        { id: 5, title: 'Final Review', status: 'not-started', duration: '45 min' }
                    ];
                    
                    const lessonsGrid = document.getElementById('lessons-grid');
                    lessonsGrid.innerHTML = lessons.map(lesson => `
                        <div class="lesson-card ${lesson.status}">
                            <div class="lesson-header">
                                <h4>${lesson.title}</h4>
                                <span class="lesson-status ${lesson.status}">${lesson.status.replace('-', ' ')}</span>
                            </div>
                            <p class="lesson-duration">${lesson.duration}</p>
                            <button class="lesson-btn" onclick="startLesson(${lesson.id})">
                                ${lesson.status === 'completed' ? 'Review' : lesson.status === 'in-progress' ? 'Continue' : 'Start'}
                            </button>
                        </div>
                    `).join('');
                }
            });
        }
    }

    // === ASSIGNMENTS PAGE DYNAMIC RENDERING ===
    if (window.location.pathname.endsWith('assignments.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const courseId = urlParams.get('courseId');
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        if (courseId && token && userId) {
            // Fetch course details and assignments
            Promise.all([
                fetch(`${BASE_URL}/courses`).then(res => res.json()),
                fetch(`${BASE_URL}/students/${userId}/courses`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }).then(res => res.json())
            ]).then(([coursesData, userCourses]) => {
                const course = (coursesData.courses || coursesData).find(c => c.id === courseId);
                const userCourse = userCourses.find(c => c.id === courseId);
                
                if (course) {
                    // Update page title and course name
                    document.getElementById('course-title').textContent = course.title;
                    document.getElementById('course-name').textContent = course.title;
                    
                    // Generate sample assignments (in a real app, this would come from backend)
                    const assignments = [
                        { id: 1, title: 'Assignment 1', dueDate: '2024-01-15', status: 'submitted', grade: 85 },
                        { id: 2, title: 'Assignment 2', dueDate: '2024-01-22', status: 'pending', grade: null },
                        { id: 3, title: 'Assignment 3', dueDate: '2024-01-29', status: 'not-started', grade: null }
                    ];
                    
                    // Update stats
                    const total = assignments.length;
                    const completed = assignments.filter(a => a.status === 'submitted').length;
                    const dueSoon = assignments.filter(a => a.status !== 'submitted' && new Date(a.dueDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length;
                    
                    document.getElementById('total-assignments').textContent = total;
                    document.getElementById('completed-assignments').textContent = completed;
                    document.getElementById('due-soon').textContent = dueSoon;
                    
                    const assignmentsGrid = document.getElementById('assignments-grid');
                    assignmentsGrid.innerHTML = assignments.map(assignment => `
                        <div class="assignment-card ${assignment.status}">
                            <div class="assignment-header">
                                <h4>${assignment.title}</h4>
                                <span class="assignment-status ${assignment.status}">${assignment.status.replace('-', ' ')}</span>
                            </div>
                            <p class="assignment-due">Due: ${new Date(assignment.dueDate).toLocaleDateString()}</p>
                            ${assignment.grade ? `<p class="assignment-grade">Grade: ${assignment.grade}%</p>` : ''}
                            <button class="assignment-btn" onclick="openAssignment(${assignment.id})">
                                ${assignment.status === 'submitted' ? 'View' : assignment.status === 'pending' ? 'Submit' : 'Start'}
                            </button>
                        </div>
                    `).join('');
                }
            });
        }
    }

    // === QUIZZES PAGE DYNAMIC RENDERING ===
    if (window.location.pathname.endsWith('quizzes.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const courseId = urlParams.get('courseId');
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        if (courseId && token && userId) {
            // Fetch course details and quizzes
            Promise.all([
                fetch(`${BASE_URL}/courses`).then(res => res.json()),
                fetch(`${BASE_URL}/students/${userId}/courses`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }).then(res => res.json()),
                fetch(`${BASE_URL}/quizzes/course/${courseId}`).then(res => res.json()).catch(() => [])
            ]).then(([coursesData, userCourses, quizzesData]) => {
                const course = (coursesData.courses || coursesData).find(c => c.id === courseId);
                const userCourse = userCourses.find(c => c.id === courseId);
                const quizzes = quizzesData.quizzes || quizzesData || [];
                
                if (course) {
                    // Update page title and course name
                    document.getElementById('course-title').textContent = course.title;
                    document.getElementById('course-name').textContent = course.title;
                    
                    // Generate sample quizzes if none from backend
                    const sampleQuizzes = quizzes.length > 0 ? quizzes : [
                        { id: 1, title: 'Quiz 1: Basic Concepts', questions: 10, status: 'completed', score: 85 },
                        { id: 2, title: 'Quiz 2: Advanced Topics', questions: 15, status: 'not-started', score: null },
                        { id: 3, title: 'Final Quiz', questions: 20, status: 'not-started', score: null }
                    ];
                    
                    // Update stats
                    const total = sampleQuizzes.length;
                    const completed = sampleQuizzes.filter(q => q.status === 'completed').length;
                    const avgScore = completed > 0 ? 
                        Math.round(sampleQuizzes.filter(q => q.score).reduce((sum, q) => sum + q.score, 0) / completed) : 0;
                    
                    document.getElementById('total-quizzes').textContent = total;
                    document.getElementById('completed-quizzes').textContent = completed;
                    document.getElementById('avg-score').textContent = `${avgScore}%`;
                    
                    const quizzesGrid = document.getElementById('quizzes-grid');
                    quizzesGrid.innerHTML = sampleQuizzes.map(quiz => `
                        <div class="quiz-card ${quiz.status}">
                            <div class="quiz-header">
                                <h4>${quiz.title}</h4>
                                <span class="quiz-status ${quiz.status}">${quiz.status.replace('-', ' ')}</span>
                            </div>
                            <p class="quiz-questions">${quiz.questions} questions</p>
                            ${quiz.score ? `<p class="quiz-score">Score: ${quiz.score}%</p>` : ''}
                            <button class="quiz-btn" onclick="startQuiz(${quiz.id})">
                                ${quiz.status === 'completed' ? 'Review' : 'Start Quiz'}
                            </button>
                        </div>
                    `).join('');
                }
            });
        }
    }

    // === HELPER FUNCTIONS FOR LESSONS/ASSIGNMENTS/QUIZZES ===
    window.startLesson = function(lessonId) {
        alert(`Starting lesson ${lessonId}. In a real app, this would open the lesson content.`);
    };

    window.openAssignment = function(assignmentId) {
        alert(`Opening assignment ${assignmentId}. In a real app, this would open the assignment submission form.`);
    };

    window.startQuiz = function(quizId) {
        alert(`Starting quiz ${quizId}. In a real app, this would open the quiz interface.`);
    };

    // === NOTIFICATION COUNT ===
    async function updateNotificationCount() {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        if (!token || !userId) return;

        try {
            const response = await fetch(`https://brightlearnbackend.onrender.com/api/notifications/user/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const notifications = await response.json();
                const unreadCount = notifications.filter(n => !n.read).length;
                
                // Update notification icon with count
                const notificationIcon = document.querySelector('.notification-icon');
                if (notificationIcon) {
                    // Remove existing badge
                    const existingBadge = notificationIcon.querySelector('.notification-badge');
                    if (existingBadge) {
                        existingBadge.remove();
                    }
                    
                    // Add new badge if there are unread notifications
                    if (unreadCount > 0) {
                        const badge = document.createElement('span');
                        badge.className = 'notification-badge';
                        badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
                        notificationIcon.appendChild(badge);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching notification count:', error);
        }
    }

    // Initialize notification count
    updateNotificationCount();

    // === PROFILE AND NOTIFICATION LINKS ===
});

// Certificate Functions
function initCertificateViewing() {
    // Set up view buttons
    const viewButtons = document.querySelectorAll('.view-btn');
    const modal = document.getElementById('certificateModal');
    const modalContent = document.querySelector('.modal-certificate-view');
    const closeModal = document.querySelector('.close-modal');
    
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const certificateCard = this.closest('.certificate-card');
            const certificatePreview = certificateCard.querySelector('.certificate-design').cloneNode(true);
            
            // Clear previous content and add new
            modalContent.innerHTML = '';
            modalContent.appendChild(certificatePreview);
            
            // Show modal
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    });
    
    // Close modal
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    
    // Close when clicking outside modal
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
}

function initCertificateFilters() {
    const courseFilter = document.getElementById('course-filter');
    const dateFilter = document.getElementById('date-filter');
    const certificateCards = document.querySelectorAll('.certificate-card');
    
    function filterCertificates() {
        const courseValue = courseFilter.value;
        const dateValue = dateFilter.value;
        
        certificateCards.forEach(card => {
            const matchesCourse = courseValue === 'all' || card.classList.contains(courseValue);
            
            // In a real app, you would compare actual dates
            const matchesDate = dateValue === 'all'; 
            
            if (matchesCourse && matchesDate) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
        
        // Show empty state if no certificates match
        const visibleCards = document.querySelectorAll('.certificate-card[style="display: block"]');
        const emptyState = document.querySelector('.empty-state');
        
        if (visibleCards.length === 0) {
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
        }
    }
    
    courseFilter.addEventListener('change', filterCertificates);
    dateFilter.addEventListener('change', filterCertificates);
}

function setupActionButtons() {
    // Download buttons
    const downloadButtons = document.querySelectorAll('.download-btn');
    downloadButtons.forEach(button => {
        button.addEventListener('click', function() {
            const certificateCard = this.closest('.certificate-card');
            const courseName = certificateCard.classList.contains('math') ? 'Mathematics' : 
                              certificateCard.classList.contains('english') ? 'English' : 'Science';
            
            // In a real app, this would trigger an actual download
            console.log(`Downloading ${courseName} certificate`);
            alert(`Preparing ${courseName} certificate for download...`);
        });
    });
    
    // Share buttons
    const shareButtons = document.querySelectorAll('.share-btn');
    shareButtons.forEach(button => {
        button.addEventListener('click', function() {
            const certificateCard = this.closest('.certificate-card');
            const courseName = certificateCard.classList.contains('math') ? 'Mathematics' : 
                              certificateCard.classList.contains('english') ? 'English' : 'Science';
            
            // In a real app, this would open a share dialog
            console.log(`Sharing ${courseName} certificate`);
            alert(`Share ${courseName} certificate dialog would open here`);
        });
    });
    
    // Print button in modal
    const printButton = document.querySelector('.print-btn');
    if (printButton) {
        printButton.addEventListener('click', function() {
            window.print();
        });
    }
    
    // Bulk actions
    const downloadAll = document.querySelector('.download-all');
    const shareAll = document.querySelector('.share-all');
    
    if (downloadAll) {
        downloadAll.addEventListener('click', function() {
            alert('Preparing all certificates for download as a ZIP file...');
        });
    }
    
    if (shareAll) {
        shareAll.addEventListener('click', function() {
            alert('Share all certificates dialog would open here');
        });
    }
}

// Recommendation Functions
function initRecommendationFilters() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    const sortSelect = document.getElementById('sort-by');
    const recommendationCards = document.querySelectorAll('.recommendation-card');
    
    // Filter by category
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            filterTabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            const category = this.getAttribute('data-category');
            filterRecommendations(category);
        });
    });
    
    // Sort recommendations
    sortSelect.addEventListener('change', function() {
        sortRecommendations(this.value);
    });
    
    function filterRecommendations(category) {
        recommendationCards.forEach(card => {
            if (category === 'all' || card.classList.contains(category)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    function sortRecommendations(sortBy) {
        const container = document.querySelector('.recommendations-grid');
        const cards = Array.from(document.querySelectorAll('.recommendation-card[style="display: block"]'));
        
        cards.sort((a, b) => {
            switch(sortBy) {
                case 'popularity':
                    const aPop = a.getAttribute('data-popularity');
                    const bPop = b.getAttribute('data-popularity');
                    return popularityValue(bPop) - popularityValue(aPop);
                case 'difficulty':
                    const aDiff = a.getAttribute('data-difficulty');
                    const bDiff = b.getAttribute('data-difficulty');
                    return difficultyValue(bDiff) - difficultyValue(aDiff);
                case 'newest':
                    // In a real app, you would compare actual dates
                    return Math.random() - 0.5;
                default: // relevance
                    return 0;
            }
        });
        
        // Re-append sorted cards
        cards.forEach(card => container.appendChild(card));
    }
    
    function popularityValue(pop) {
        const values = { high: 3, medium: 2, low: 1 };
        return values[pop] || 0;
    }
    
    function difficultyValue(diff) {
        const values = { advanced: 3, intermediate: 2, beginner: 1 };
        return values[diff] || 0;
    }
}

function setupActionButtons2() {
    // Enroll buttons
    const enrollButtons = document.querySelectorAll('.enroll-btn');
    enrollButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.recommendation-card');
            const courseName = card.querySelector('h3').textContent;
            alert(`Enrolling in: ${courseName}`);
            // In a real app, this would redirect to enrollment page
        });
    });
    
    // Download buttons
    const downloadButtons = document.querySelectorAll('.download-btn');
    downloadButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.recommendation-card');
            const resourceName = card.querySelector('h3').textContent;
            alert(`Downloading: ${resourceName}`);
            // In a real app, this would trigger a download
        });
    });
    
    // Explore buttons
    const exploreButtons = document.querySelectorAll('.explore-btn');
    exploreButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.recommendation-card');
            const careerName = card.querySelector('h3').textContent;
            alert(`Exploring career path: ${careerName}`);
            // In a real app, this would open career details
        });
    });
    
    // Feedback button
    const feedbackBtn = document.querySelector('.feedback-btn');
    if (feedbackBtn) {
        feedbackBtn.addEventListener('click', function() {
            alert('Feedback modal would open here');
            // In a real app, this would open a feedback form
        });
    }
}

function setupRefreshButton() {
    const refreshBtn = document.querySelector('.refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            this.disabled = true;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing';
            
            // Simulate API call
            setTimeout(() => {
                alert('Recommendations refreshed based on your recent activity');
                this.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
                this.disabled = false;
            }, 1500);
        });
    }
}

// Progress Functions
function initCircularProgress() {
    const progressElements = document.querySelectorAll('.circular-progress');
    
    progressElements.forEach(element => {
        const progress = element.getAttribute('data-progress');
        const circle = element.querySelector('.progress-ring-circle');
        const radius = circle.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;
        
        circle.style.strokeDasharray = circumference;
        circle.style.strokeDashoffset = circumference - (progress / 100) * circumference;
        
        // Animate progress
        setTimeout(() => {
            circle.style.transition = 'stroke-dashoffset 1s ease-in-out';
        }, 100);
    });
}

function initActivityCalendar() {
    const calendarPlaceholder = document.querySelector('.calendar-placeholder');
    if (!calendarPlaceholder) return;
    
    // Remove placeholder text
    calendarPlaceholder.innerHTML = '';
    
    // Create calendar container
    const calendar = document.createElement('div');
    calendar.className = 'activity-calendar-grid';
    
    // Add month header
    const monthHeader = document.createElement('div');
    monthHeader.className = 'calendar-month-header';
    monthHeader.textContent = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    calendar.appendChild(monthHeader);
    
    // Add day headers
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    days.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day-header';
        dayHeader.textContent = day;
        calendar.appendChild(dayHeader);
    });
    
    // Calculate days in month
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Calculate first day of month
    const firstDay = new Date(year, month, 1).getDay();
    
    // Add empty cells for days before first day of month
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day empty';
        calendar.appendChild(emptyCell);
    }
    
    // Add day cells with random activity levels (simulated data)
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        
        // Add date
        const dateElement = document.createElement('span');
        dateElement.className = 'day-date';
        dateElement.textContent = day;
        dayCell.appendChild(dateElement);
        
        // Add activity level (simulated)
        const activityLevel = Math.floor(Math.random() * 4); // 0-3
        if (activityLevel > 0) {
            const activityElement = document.createElement('div');
            activityElement.className = `activity-level level-${activityLevel}`;
            dayCell.appendChild(activityElement);
            
            // Add tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'activity-tooltip';
            tooltip.textContent = `${activityLevel * 30} mins on ${month + 1}/${day}/${year}`;
            dayCell.appendChild(tooltip);
            
            // Show tooltip on hover
            dayCell.addEventListener('mouseenter', () => {
                tooltip.style.visibility = 'visible';
                tooltip.style.opacity = '1';
            });
            
            dayCell.addEventListener('mouseleave', () => {
                tooltip.style.visibility = 'hidden';
                tooltip.style.opacity = '0';
            });
        }
        
        // Highlight current day
        if (day === date.getDate() && month === date.getMonth()) {
            dayCell.classList.add('today');
        }
        
        calendar.appendChild(dayCell);
    }
    
    calendarPlaceholder.appendChild(calendar);
}

function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // In a real app, you would filter data here
            console.log(`Filter changed to: ${this.textContent}`);
        });
    });
}

function setupCourseHoverEffects() {
    const courseCards = document.querySelectorAll('.course-progress-card');
    
    courseCards.forEach(card => {
        const progressBar = card.querySelector('.progress-fill');
        const originalWidth = progressBar.style.width;
        
        card.addEventListener('mouseenter', () => {
            // Animate progress bar on hover
            progressBar.style.transition = 'width 0.5s ease-in-out';
            progressBar.style.width = '100%';
        });
        
        card.addEventListener('mouseleave', () => {
            // Return to original width
            progressBar.style.width = originalWidth;
        });
    });
}

function simulateDataLoading() {
    // Show loading state
    const loadingElements = document.querySelectorAll('.stat-value, .progress-value, .completion-percent');
    loadingElements.forEach(el => {
        el.textContent = '--';
    });
    
    // Simulate API delay
    setTimeout(() => {
        // In a real app, you would update with actual data
        document.querySelector('.progress-value').textContent = '72%';
        document.querySelector('.stat-value:nth-of-type(1)').textContent = '5';
        document.querySelector('.stat-value:nth-of-type(2)').textContent = '3';
        document.querySelector('.stat-value:nth-of-type(3)').textContent = '36h 45m';
        
        // Update course progress percentages
        document.querySelectorAll('.completion-percent').forEach((el, index) => {
            el.textContent = index === 0 ? '69%' : '42%';
        });
        
        // Update stats
        document.querySelectorAll('.stat-item .stat-value').forEach((el, index) => {
            const values = ['12/20', '82%', '2 days ago', '8/18', '78%', '1 week ago'];
            el.textContent = values[index];
        });
    }, 1000);
}

// Notification Functions
function initNotifications() {
    // Sample notification data
    const notifications = [
        {
            id: 1,
            icon: 'bookmark',
            title: 'New Course Available',
            message: '"Advanced Mathematics" has been added to your available courses.',
            time: '2 hours ago',
            unread: true
        },
        {
            id: 2,
            icon: 'calendar-check',
            title: 'Assignment Due Soon',
            message: 'Your "History Essay" assignment is due in 3 days.',
            time: '5 hours ago',
            unread: true
        },
        {
            id: 3,
            icon: 'check-circle',
            title: 'Quiz Graded',
            message: 'Your "Algebra Basics" quiz has been graded - Score: 92%',
            time: '1 day ago',
            unread: false
        },
        {
            id: 4,
            icon: 'comment-alt',
            title: 'New Message',
            message: 'You have a new message from your English instructor.',
            time: '2 days ago',
            unread: false
        },
        {
            id: 5,
            icon: 'certificate',
            title: 'Certificate Earned',
            message: 'Congratulations! You\'ve earned a certificate for completing "Introduction to Science".',
            time: '1 week ago',
            unread: false
        }
    ];

    // DOM elements
    const notificationList = document.querySelector('.notification-list');
    const markAllReadBtn = document.querySelector('.mark-all-read');
    const clearAllBtn = document.querySelector('.clear-all');
    const searchInput = document.querySelector('.search-input');

    // Initialize notifications
    renderNotifications(notifications);

    // Mark notification as read
    function markAsRead(notificationId) {
        const notification = notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.unread = false;
        }
        renderNotifications(notifications);
    }

    // Mark all notifications as read
    function markAllAsRead() {
        notifications.forEach(notification => {
            notification.unread = false;
        });
        renderNotifications(notifications);
        showTemporaryNotification('All notifications marked as read');
    }

    // Clear all notifications
    function clearAll() {
        notifications.length = 0;
        renderNotifications(notifications);
        showTemporaryNotification('All notifications cleared');
    }

    // Search notifications
    function searchNotifications() {
        const searchTerm = searchInput.value.toLowerCase();
        const filtered = notifications.filter(notification => 
            notification.title.toLowerCase().includes(searchTerm) || 
            notification.message.toLowerCase().includes(searchTerm)
        );
        renderNotifications(filtered);
    }

    // Show temporary notification
    function showTemporaryNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'temp-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    function renderNotifications(notificationsToRender = notifications) {
        if (notificationsToRender.length === 0) {
            notificationList.innerHTML = `
                <div class="empty-notifications">
                    <i class="fas fa-bell-slash" style="font-size: 3rem; color: #667eea; margin-bottom: 20px;"></i>
                    <h3>No notifications</h3>
                    <p>Your notification inbox is empty</p>
                </div>
            `;
            return;
        }

        notificationList.innerHTML = notificationsToRender.map(notification => `
            <div class="notification-item ${notification.unread ? 'notification-unread' : ''}" data-id="${notification.id}">
                <div class="notification-icon">
                    <i class="fas fa-${notification.icon}"></i>
                </div>
                <div class="notification-content">
                    <h3 class="notification-title">${notification.title}</h3>
                    <p class="notification-message">${notification.message}</p>
                    <div class="notification-time">${notification.time}</div>
                </div>
            </div>
        `).join('');
    }

    // Event listeners
    // Mark as read when clicked
    notificationList.addEventListener('click', (e) => {
        const notificationItem = e.target.closest('.notification-item');
        if (notificationItem) {
            const notificationId = parseInt(notificationItem.dataset.id);
            markAsRead(notificationId);
        }
    });
    
    // Mark all as read
    markAllReadBtn?.addEventListener('click', markAllAsRead);
    
    // Clear all notifications
    clearAllBtn?.addEventListener('click', clearAll);
    
    // Search functionality
    searchInput?.addEventListener('input', searchNotifications);
}

document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logout-btn');
    const logoutModal = document.getElementById('logout-modal');
    const confirmLogout = document.getElementById('confirm-logout');
    const cancelLogout = document.getElementById('cancel-logout');

    // Show modal when logout button is clicked
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault(); // Prevent default link behavior
        logoutModal.style.display = 'block';
    });

    // Handle confirm logout
    confirmLogout.addEventListener('click', function() {
        window.location.href = 'logout.html'; // Redirect to logout page
    });

    // Handle cancel logout
    cancelLogout.addEventListener('click', function() {
        logoutModal.style.display = 'none';
    });

    // Close modal if clicked outside
    window.addEventListener('click', function(e) {
        if (e.target === logoutModal) {
            logoutModal.style.display = 'none';
        }
    });
});

// === MINIMAL PROGRESS TRACKING ===
const PROGRESS_KEY = 'brightlearn_progress';

function loadProgress() {
    const data = localStorage.getItem(PROGRESS_KEY);
    return data ? JSON.parse(data) : { lessons: {}, quizzes: {} };
}

function saveProgress(progress) {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

function markLessonCompleted(subject, lessonId) {
    const progress = loadProgress();
    if (!progress.lessons[subject]) progress.lessons[subject] = [];
    if (!progress.lessons[subject].includes(lessonId)) {
        progress.lessons[subject].push(lessonId);
        saveProgress(progress);
    }
}

function saveQuizScore(subject, quizId, score) {
    const progress = loadProgress();
    if (!progress.quizzes[subject]) progress.quizzes[subject] = {};
    progress.quizzes[subject][quizId] = score;
    saveProgress(progress);
}

function getLessonCompletion(subject, lessonId) {
    const progress = loadProgress();
    return progress.lessons[subject]?.includes(lessonId) || false;
}

function getQuizScore(subject, quizId) {
    const progress = loadProgress();
    return progress.quizzes[subject]?.[quizId] ?? null;
}

// === EXAMPLE USAGE ===
// markLessonCompleted('math', 'lesson1');
// saveQuizScore('english', 'quiz2', 85);
// let completed = getLessonCompletion('math', 'lesson1');
// let score = getQuizScore('english', 'quiz2');

// Additional styles for calendar (would normally be in CSS, but included here for completeness)
function addCalendarStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .activity-calendar-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 8px;
            text-align: center;
        }
        
        .calendar-month-header {
            grid-column: span 7;
            font-weight: bold;
            margin-bottom: 10px;
            color: var(--text-dark);
        }
        
        .calendar-day-header {
            font-size: 0.8rem;
            color: var(--text-medium);
            padding: 5px 0;
        }
        
        .calendar-day {
            position: relative;
            height: 40px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border-radius: var(--radius-sm);
            background-color: var(--bg-light);
        }
        
        .calendar-day.today {
            border: 1px solid var(--primary-blue);
        }
        
        .day-date {
            font-size: 0.7rem;
            margin-bottom: 2px;
        }
        
        .activity-level {
            width: 16px;
            height: 4px;
            border-radius: 2px;
        }
        
        .activity-level.level-1 {
            background-color: var(--primary-light);
        }
        
        .activity-level.level-2 {
            background-color: var(--primary-blue);
        }
        
        .activity-level.level-3 {
            background-color: var(--primary-dark);
        }
        
        .activity-tooltip {
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background-color: var(--text-dark);
            color: white;
            padding: 5px 10px;
            border-radius: var(--radius-sm);
            font-size: 0.8rem;
            white-space: nowrap;
            visibility: hidden;
            opacity: 0;
            transition: var(--transition);
            z-index: 10;
            margin-bottom: 5px;
        }
        
        .activity-tooltip::after {
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border-width: 5px;
            border-style: solid;
            border-color: var(--text-dark) transparent transparent transparent;
        }
    `;
    document.head.appendChild(style);
}

// Add calendar styles when the page loads
addCalendarStyles();

// ===== MINIMAL QUIZ SYSTEM (WORKS WITHOUT BACKEND) =====
// Example: Place a <div id="quiz-container"></div> in your HTML where you want the quiz.
// You can adapt this for each subject/quiz as needed.

const quizData  = [
    {
        question: "1. What is the solution to the equation: 2x + 5 = 15?",
        options: ["x = 5", "x = 7.5", "x = 10", "x = 20"],
        answer: 0
    },
    {
        question: "2. Simplify: (3x²)(4x³)",
        options: ["7x⁵", "12x⁵", "12x⁶", "7x⁶"],
        answer: 1
    },
    {
        question: "3. Factor completely: x² - 9",
        options: ["(x-3)(x-3)", "(x+3)(x+3)", "(x-3)(x+3)", "Cannot be factored"],
        answer: 2
    },
    {
        question: "4. Solve for y: 3y - 7 = 8",
        options: ["y = 1", "y = 5", "y = 15", "y = 45"],
        answer: 1
    },
    {
        question: "5. What is the slope of the line: y = 2x + 5?",
        options: ["2", "5", "-2", "1/2"],
        answer: 0
    },
    {
        question: "6. Solve the system: y = 2x + 1 and y = 3x - 4",
        options: ["(5,11)", "(-5,-9)", "(1,-1)", "(0,1)"],
        answer: 0
    },
    {
        question: "7. Expand: (x + 3)(x - 2)",
        options: ["x² + x - 6", "x² + 5x - 6", "x² - x - 6", "x² - 5x - 6"],
        answer: 0
    },
    {
        question: "8. What is the y-intercept of y = -3x + 7?",
        options: ["-3", "3", "7", "-7"],
        answer: 2
    },
    {
        question: "9. Solve for x: x² - 5x + 6 = 0",
        options: ["x = 2, x = 3", "x = -2, x = -3", "x = 1, x = 6", "x = -1, x = -6"],
        answer: 0
    },
    {
        question: "10. Simplify: √(16x⁴)",
        options: ["4x", "4x²", "8x²", "16x²"],
        answer: 1
    },
    {
        question: "11. Solve the inequality: 3x - 5 < 10",
        options: ["x < 5", "x > 5", "x < 15", "x > 15"],
        answer: 0
    },
    {
        question: "12. What is the vertex of y = (x-2)² + 3?",
        options: ["(-2,3)", "(2,3)", "(-3,2)", "(3,2)"],
        answer: 1
    },
    {
        question: "13. Solve for x: |2x - 3| = 7",
        options: ["x = 5", "x = -2", "x = 5 or x = -2", "x = 2 or x = -5"],
        answer: 2
    },
    {
        question: "14. Simplify: (2x⁻³)⁻²",
        options: ["4x⁶", "2x⁶", "(1/4)x⁶", "4/x⁶"],
        answer: 0
    },
    {
        question: "15. Which is the equation of a line with slope -2 passing through (1,4)?",
        options: ["y = -2x + 2", "y = -2x + 6", "y = 2x + 2", "y = 2x + 6"],
        answer: 1
    },
    {
        question: "16. Factor: 2x² + 7x + 3",
        options: ["(2x+1)(x+3)", "(2x+3)(x+1)", "(x+1)(2x+3)", "Cannot be factored"],
        answer: 1
    },
    {
        question: "17. Solve for x: 5ˣ⁻¹ = 25",
        options: ["x = 1", "x = 2", "x = 3", "x = 4"],
        answer: 2
    },
    {
        question: "18. What is the domain of f(x) = √(x-4)?",
        options: ["x > 4", "x ≥ 4", "All real numbers", "x ≤ 4"],
        answer: 1
    },
    {
        question: "19. Simplify: (3x²y⁻³)³",
        options: ["9x⁵", "27x⁶/y⁹", "9x⁶y⁻⁹", "27x⁵y⁻⁶"],
        answer: 1
    },
    {
        question: "20. Solve for x: log₂(x) = 3",
        options: ["x = 6", "x = 8", "x = 9", "x = 1/8"],
        answer: 1
    },
    {
        question: "21. What is the solution to: 4 - 2x > 10?",
        options: ["x > -3", "x < -3", "x > 3", "x < 3"],
        answer: 1
    },
    {
        question: "22. Find the x-intercept of y = -2x + 8",
        options: ["(8,0)", "(-4,0)", "(4,0)", "(0,8)"],
        answer: 2
    },
    {
        question: "23. Simplify: (x² - 4)/(x - 2)",
        options: ["x - 2", "x + 2", "x² + 2", "Cannot be simplified"],
        answer: 1
    },
    {
        question: "24. Solve the system: 2x + y = 5 and x - y = 1",
        options: ["(2,1)", "(1,2)", "(3,2)", "(2,3)"],
        answer: 0
    },
    {
        question: "25. What is f(-2) if f(x) = x³ - 2x² + 1?",
        options: ["-15", "-7", "1", "17"],
        answer: 1
    },
    {
        question: "26. Which represents exponential growth?",
        options: ["y = 100(0.95)ˣ", "y = 50(1.05)ˣ", "y = 200 - 5x", "y = 300/x"],
        answer: 1
    },
    {
        question: "27. Solve for x: 3/x + 1/2 = 5/x",
        options: ["x = 4", "x = 2", "x = 1/4", "x = 1/2"],
        answer: 0
    },
    {
        question: "28. What is the range of f(x) = x² + 3?",
        options: ["All real numbers", "y ≥ 0", "y ≥ 3", "y ≤ 3"],
        answer: 2
    },
    {
        question: "29. Simplify: (2 + √3)(2 - √3)",
        options: ["1", "4 - 2√3", "4 + 2√3", "4 - 3"],
        answer: 0
    },
    {
        question: "30. Which is the inverse of f(x) = 2x - 5?",
        options: ["f⁻¹(x) = (x+5)/2", "f⁻¹(x) = (x-5)/2", "f⁻¹(x) = 2/(x+5)", "f⁻¹(x) = -2x + 5"],
        answer: 0
    },
    {
        question: "31. Solve: x² + 6x + 9 = 0",
        options: ["x = 3", "x = -3", "x = 3 or x = -3", "No real solution"],
        answer: 1
    },
    {
        question: "32. What is the midpoint between (1,3) and (5,7)?",
        options: ["(3,5)", "(4,4)", "(6,10)", "(2.5,3.5)"],
        answer: 0
    },
    {
        question: "33. Which is a solution to x³ - 4x = 0?",
        options: ["x = 0 only", "x = 2 only", "x = -2, 0, or 2", "No real solutions"],
        answer: 2
    },
    {
        question: "34. Simplify: i²⁰²³ (where i = √-1)",
        options: ["1", "-1", "i", "-i"],
        answer: 3
    },
    {
        question: "35. What is the degree of 4x³ - 2x⁵ + x - 7?",
        options: ["3", "5", "7", "1"],
        answer: 1
    },
    {
        question: "36. Solve for x: eˣ = 5 (ln5 ≈ 1.609)",
        options: ["x ≈ 0.699", "x ≈ 1.609", "x ≈ 5", "x ≈ 0.2"],
        answer: 1
    },
    {
        question: "37. Which is the factored form of 6x² - x - 1?",
        options: ["(2x-1)(3x+1)", "(6x+1)(x-1)", "(3x-1)(2x+1)", "Cannot be factored"],
        answer: 2
    },
    {
        question: "38. What is the solution to √(x+9) = x - 3?",
        options: ["x = 0", "x = 7", "x = 0 or x = 7", "No solution"],
        answer: 1
    },
    {
        question: "39. Which function is odd?",
        options: ["f(x) = x²", "f(x) = x³", "f(x) = |x|", "f(x) = 2ˣ"],
        answer: 1
    },
    {
        question: "40. Solve the inequality: x² - 4 < 0",
        options: ["-2 < x < 2", "x < -2 or x > 2", "x < 2", "x > -2"],
        answer: 0
    }
];

// Add quiz CSS dynamically for quizData-rendered questions/answers
function addQuizStyles() {
    if (document.getElementById('quiz-style')) return;
    const style = document.createElement('style');
    style.id = 'quiz-style';
    style.textContent = `
      .bl-quiz-q {
        font-size: 1.2rem;
        font-weight: 600;
        margin-bottom: 1rem;
        color: #2d3748;
      }
      .bl-quiz-options {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-bottom: 1.5rem;
      }
      .bl-quiz-options label {
        background: #f7fafc;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        padding: 0.5rem 1rem;
        cursor: pointer;
        transition: background 0.2s, border 0.2s;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .bl-quiz-options input[type="radio"] {
        accent-color: #3a86ff;
        margin-right: 0.5rem;
      }
      .bl-quiz-options label:hover, .bl-quiz-options label:has(input:checked) {
        background: #e0e7ff;
        border-color: #3a86ff;
      }
      .bl-quiz-nav {
        display: flex;
        justify-content: space-between;
        margin-bottom: 1.5rem;
      }
      .bl-quiz-nav button {
        background: #3a86ff;
        color: #fff;
        border: none;
        border-radius: 4px;
        padding: 0.5rem 1.5rem;
        font-size: 1rem;
        cursor: pointer;
        transition: background 0.2s;
      }
      .bl-quiz-nav button:disabled {
        background: #a0aec0;
        cursor: not-allowed;
      }
      .bl-quiz-result {
        font-size: 1.3rem;
        font-weight: 700;
        color: #256029;
        margin-bottom: 1.5rem;
      }
      #retryQuiz {
        background: #f59e42;
        color: #fff;
        border: none;
        border-radius: 4px;
        padding: 0.5rem 1.5rem;
        font-size: 1rem;
        cursor: pointer;
        transition: background 0.2s;
      }
      #retryQuiz:hover {
        background: #ffb366;
      }
    `;
    document.head.appendChild(style);
}

// Call this before rendering quiz
addQuizStyles();

// Update renderQuiz to use the new class names
function renderQuiz(quizId = 'defaultQuiz', subject = 'math') {
    addQuizStyles();
    const container = document.getElementById('quiz-container');
    if (!container) return;
    let current = 0;
    let userAnswers = Array(quizData.length).fill(null);
    container.innerHTML = '';

    function showQuestion(idx) {
        const q = quizData[idx];
        container.innerHTML = `
            <div class="bl-quiz-q">${q.question}</div>
            <div class="bl-quiz-options">
                ${q.options.map((opt, i) => `
                    <label>
                        <input type="radio" name="option" value="${i}" ${userAnswers[idx] === i ? 'checked' : ''}>
                        ${opt}
                    </label>
                `).join('')}
            </div>
            <div class="bl-quiz-nav">
                <button id="prevQ" ${idx === 0 ? 'disabled' : ''}>Previous</button>
                <button id="nextQ">${idx === quizData.length - 1 ? 'Finish' : 'Next'}</button>
            </div>
            <div id="quiz-feedback"></div>
        `;
        document.querySelectorAll('input[name="option"]').forEach(input => {
            input.addEventListener('change', e => {
                userAnswers[idx] = parseInt(e.target.value);
            });
        });
        document.getElementById('prevQ').onclick = () => {
            if (current > 0) {
                current--;
                showQuestion(current);
            }
        };
        document.getElementById('nextQ').onclick = () => {
            if (current < quizData.length - 1) {
                current++;
                showQuestion(current);
            } else {
                finishQuiz();
            }
        };
    }

    function finishQuiz() {
        let correct = 0;
        quizData.forEach((q, i) => {
            if (userAnswers[i] === q.answer) correct++;
        });
        const percent = Math.round((correct / quizData.length) * 100);
        saveQuizScore(subject, quizId, percent);
        container.innerHTML = `
            <div class="bl-quiz-result">You scored ${percent}% (${correct} out of ${quizData.length})</div>
            <button id="retryQuiz">Retry</button>
        `;
        document.getElementById('retryQuiz').onclick = () => {
            userAnswers = Array(quizData.length).fill(null);
            current = 0;
            showQuestion(current);
        };
    }

    showQuestion(current);
}

const geometryQuizData = [
    {
        question: "1. What is the sum of the angles in a triangle?",
        options: ["90°", "180°", "270°", "360°"],
        answer: 1
    },
    {
        question: "2. What do you call a triangle with all sides equal?",
        options: ["Isosceles", "Scalene", "Equilateral", "Right"],
        answer: 2
    },
    {
        question: "3. What is the area of a rectangle with length 5 and width 3?",
        options: ["8", "15", "16", "10"],
        answer: 1
    },
    {
        question: "4. What is the name of a 6-sided polygon?",
        options: ["Pentagon", "Hexagon", "Heptagon", "Octagon"],
        answer: 1
    },
    {
        question: "5. What is the length of the hypotenuse in a right triangle with legs 3 and 4?",
        options: ["5", "6", "7", "8"],
        answer: 0
    },
    {
        question: "6. What is the volume of a cube with side length 3?",
        options: ["9", "18", "27", "36"],
        answer: 2
    },
    {
        question: "7. What is the surface area of a sphere with radius 3? (Use π = 3.14)",
        options: ["28.26", "31.42", "18.84", "37.68"],
        answer: 1
    },
    {
        question: "8. What is the circumference of a circle with diameter 10? (Use π = 3.14)",
        options: ["31.4", "15.7", "25.12", "20"],
        answer: 0
    },
    {
        question: "9. What is the area of a triangle with base 4 and height 3?",
        options: ["12", "6", "8", "10"],
        answer: 1
    },
    {
        question: "10. What do you call a polygon with 10 sides?",
        options: ["Decagon", "Dodecagon", "Pentagon", "Hexadecagon"],
        answer: 0
    },
    {
        question: "11. What is the measure of each interior angle in a regular hexagon?",
        options: ["120°", "90°", "60°", "150°"],
        answer: 0
    },
    {
        question: "12. What is the Pythagorean Theorem?",
        options: ["a² + b² = c²", "a + b = c", "a² - b² = c²", "2ab = c²"],
        answer: 0
    },
    {
        question: "13. What is the distance between the points (3,4) and (6,8)?",
        options: ["5", "10", "7", "8"],
        answer: 0
    },
    {
        question: "14. What is the midpoint of the line segment connecting (2,3) and (4,7)?",
        options: ["(3,5)", "(2.5,3.5)", "(4,5)", "(3,7)"],
        answer: 1
    },
    {
        question: "15. What is the slope of the line passing through (1,2) and (3,4)?",
        options: ["1", "2", "0.5", "3"],
        answer: 0
    },
    {
        question: "16. What is the equation of the line with slope 2 passing through the origin?",
        options: ["y = 2x", "y = x/2", "y = 2/x", "y = x+2"],
        answer: 0
    },
    {
        question: "17. What is the area of a circle with radius 2? (Use π = 3.14)",
        options: ["12.56", "6.28", "3.14", "25.12"],
        answer: 0
    },
    {
        question: "18. What is the circumference of a circle with radius 3? (Use π = 3.14)",
        options: ["18.84", "12.56", "9.42", "6.28"],
        answer: 0
    },
    {
        question: "19. What is the surface area of a cube with side length 2?",
        options: ["24", "12", "8", "16"],
        answer: 0
    },
    {
        question: "20. What is the volume of a cylinder with radius 2 and height 5? (Use π = 3.14)",
        options: ["20π", "10π", "5π", "40π"],
        answer: 0
    },
];
