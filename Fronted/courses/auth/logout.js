document.addEventListener('DOMContentLoaded', function() {
    const confirmLogoutBtn = document.getElementById('confirmLogout');
    const cancelLogoutBtn = document.getElementById('cancelLogout');
    const appContainer = document.querySelector('.app-container');

    // Confirm logout
    confirmLogoutBtn.addEventListener('click', function() {
        // Show loading state
        confirmLogoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging Out...';
        confirmLogoutBtn.disabled = true;
        
        // Add fade out effect to entire app
        appContainer.classList.add('logging-out');
        
        // In a real app, you would send a logout request to the server here
        // Then redirect on success
        setTimeout(() => {
            // For demo purposes, we'll redirect after 1.5 seconds
            window.location.href = '../index.html';
            
            // In a real implementation:
            // 1. Send logout request to server
            // 2. Clear session/local storage
            // 3. Redirect to login page
        }, 1500);
    });

    // Cancel logout
    cancelLogoutBtn.addEventListener('click', function() {
        // Redirect back to dashboard
        window.location.href = '../index.html';
    });

    // Optional: Add keyboard support
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            window.location.href = 'index.html';
        }
    });
});