document.addEventListener('DOMContentLoaded', function() {
    const confirmLogoutBtn = document.getElementById('confirmLogout');
    const cancelLogoutBtn = document.getElementById('cancelLogout');
    const appContainer = document.querySelector('.app-container');

    // 1. Confirm Logout - Immediate redirect to login.html with cleanup
    confirmLogoutBtn.addEventListener('click', function() {
        // Visual feedback
        confirmLogoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging Out...';
        confirmLogoutBtn.disabled = true;
        appContainer.classList.add('logging-out');
        
        // Clear authentication data
        localStorage.removeItem('authToken');
        sessionStorage.clear();
        document.cookie.split(';').forEach(cookie => {
            document.cookie = cookie.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
        });
        
        // Immediate redirect to login page
        window.location.href = 'login.html';
    });

    // 2. Cancel Logout - Return to previous page safely
    cancelLogoutBtn.addEventListener('click', function() {
        // Check if there's history and we didn't come from login page
        if (document.referrer && !document.referrer.includes('login.html')) {
            window.history.back();
        } else {
            // Default fallback to dashboard
            window.location.href = 'index.html';
        }
    });

    // 3. Enhanced Keyboard Support
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            cancelLogoutBtn.click();
        }
        if (e.key === 'Enter' && document.activeElement === confirmLogoutBtn) {
            confirmLogoutBtn.click();
        }
    });
});
