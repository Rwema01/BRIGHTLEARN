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
});
