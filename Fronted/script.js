document.addEventListener('DOMContentLoaded', function() {
    // === LOGOUT FUNCTIONALITY (Enhanced) ===
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Clear all client-side storage
            localStorage.clear();
            sessionStorage.clear();
            
            // Clear cache headers (simulated)
            fetch('/clear-cache', {
                method: 'POST',
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate'
                }
            }).catch(() => {}); // Silent fail if endpoint doesn't exist
            
            // Redirect with history manipulation
            window.location.replace("login.html"); // replace() prevents back navigation
            window.history.pushState(null, null, window.location.href);
            window.onpopstate = function() {
                window.history.go(1);
            };
        });
    }

    // === NAVIGATION HIGHLIGHT (Optimized) ===
    const navLinks = document.querySelectorAll('.nav-links li a');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href').split('/').pop();
        if (linkPage === currentPage) {
            link.classList.add('active');
            link.removeEventListener('click', handleNavClick); // Avoid duplicate handlers
        }
        
        link.addEventListener('click', handleNavClick);
    });

    function handleNavClick() {
        navLinks.forEach(l => l.classList.remove('active'));
        this.classList.add('active');
    }

    // === CHART.JS INIT (Unchanged) ===
    const ctx = document.getElementById('progressChart')?.getContext('2d');
    if (ctx) {
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'Remaining'],
                datasets: [{
                    data: [65, 35],
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

    // === PROFILE DROPDOWN (Optimized) ===
    const profileDropdown = document.querySelector('.profile-dropdown');
    const profileIcon = document.querySelector('.profile-icon');
    
    if (profileIcon && profileDropdown) {
        profileIcon.addEventListener('click', function(e) {
            e.stopPropagation();
            profileDropdown.classList.toggle('show');
        });

        document.addEventListener('click', function() {
            profileDropdown.classList.remove('show');
        });
    }

    // === SEARCH FUNCTIONALITY (Unchanged) ===
    document.querySelector('.search-input')?.addEventListener('input', function() {
        console.log(`Searching for: ${this.value}`);
    });

    // === NOTIFICATION FUNCTIONALITY ===
    const notificationDropdown = document.querySelector('.notification-dropdown');
    const notificationIcon = document.querySelector('.notification-icon');

    if (notificationIcon && notificationDropdown) {
        // Toggle dropdown
        notificationIcon.addEventListener('click', function(e) {
            e.stopPropagation();
            notificationDropdown.classList.toggle('show');
            
            // Mark as read when opened
            if (notificationDropdown.classList.contains('show')) {
                markNotificationsAsRead();
            }
        });

        // Close when clicking outside
        document.addEventListener('click', function() {
            notificationDropdown.classList.remove('show');
        });

        // Mark all as read button
        const markAllReadBtn = document.querySelector('.mark-all-read');
        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                markNotificationsAsRead();
            });
        }
    }

    function markNotificationsAsRead() {
        // Remove unread class from all notifications
        document.querySelectorAll('.notification-item.unread').forEach(item => {
            item.classList.remove('unread');
        });
        
        // Update badge count (you would normally get this from your backend)
        updateNotificationBadge(0);
    }

    function updateNotificationBadge(count) {
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'block' : 'none';
        }
    }

    // Initialize with 3 unread notifications (you would get this from your backend)
    updateNotificationBadge(3);

    // === COURSES PAGE (Added Null Check) ===
    document.querySelectorAll('.course-btn').forEach(button => {
        button.addEventListener('click', function() {
            const courseName = this.closest('.course-card')?.querySelector('h4')?.textContent;
            if (courseName) {
                alert(`Continuing with ${courseName} course...`);
                // Add actual navigation logic here
            }
        });
    });

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
