document.addEventListener('DOMContentLoaded', function() {
    // Initialize Chart.js
    const ctx = document.getElementById('progressChart').getContext('2d');
    const progressChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Remaining'],
            datasets: [{
                data: [65, 35],
                backgroundColor: [
                    '#3A86FF',
                    '#E0E0E0'
                ],
                borderWidth: 0
            }]
        },
        options: {
            cutout: '70%',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            }
        }
    });

    // Profile dropdown functionality
    const profileDropdown = document.querySelector('.profile-dropdown');
    const profileIcon = document.querySelector('.profile-icon');
    
    profileIcon.addEventListener('click', function(e) {
        e.stopPropagation();
        // In a real app, this would toggle a dropdown menu
        console.log('Profile dropdown clicked');
    });
    
    // Search functionality
    const searchInput = document.querySelector('.search-input');
    
    searchInput.addEventListener('input', function() {
        console.log(`Searching for: ${this.value}`);
    });
    
    // Notification icon
    const notificationIcon = document.querySelector('.notification-icon');
    
    notificationIcon.addEventListener('click', function() {
        console.log('Notifications clicked');
    });
    
    // Simulate loading data
    setTimeout(() => {
        console.log('Dashboard data loaded');
    }, 1000);
    
    // Navigation active state
    const navLinks = document.querySelectorAll('.nav-links li a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
});
