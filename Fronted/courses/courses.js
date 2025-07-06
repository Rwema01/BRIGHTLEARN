document.addEventListener('DOMContentLoaded', function() {
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
    const courseFilter = document.getElementById('course-filter');
    const timeFilter = document.getElementById('time-filter');
    
    if (courseFilter && timeFilter) {
        courseFilter.addEventListener('change', filterActivities);
        timeFilter.addEventListener('change', filterActivities);
        
        function filterActivities() {
            const course = courseFilter.value.toLowerCase();
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
});