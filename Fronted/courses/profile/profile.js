// DOM elements
const settingsMenuItems = document.querySelectorAll('.settings-menu li');
const settingsTabs = document.querySelectorAll('.settings-tab');
const saveChangesBtn = document.querySelector('.save-changes');
const profileUpload = document.getElementById('profile-upload');
const profilePreview = document.getElementById('profile-preview');
const uploadBtn = document.querySelector('.upload-btn');

// Initialize profile page
document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    settingsMenuItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all menu items and tabs
            settingsMenuItems.forEach(i => i.classList.remove('active'));
            settingsTabs.forEach(tab => tab.classList.remove('active'));
            
            // Add active class to clicked menu item
            this.classList.add('active');
            
            // Show corresponding tab
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Profile picture upload
    uploadBtn.addEventListener('click', function() {
        profileUpload.click();
    });

    profileUpload.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function(event) {
                profilePreview.src = event.target.result;
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });

    // Save changes
    saveChangesBtn.addEventListener('click', function() {
        showNotification('Changes saved successfully!');
        
        // In a real app, you would send data to server here
        // const formData = new FormData();
        // formData.append('profileImage', profileUpload.files[0]);
        // formData.append('fullName', document.getElementById('full-name').value);
        // ...etc
    });
});

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'profile-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        </div>
    `;
    
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: 'linear-gradient(135deg, #28a745, #20c997)',
        color: 'white',
        padding: '15px 20px',
        borderRadius: '10px',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
        zIndex: '10000',
        opacity: '0',
        transform: 'translateX(100%)',
        transition: 'all 0.3s ease'
    });
    
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