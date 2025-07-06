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

// Mark notification as read
function markAsRead(notificationId) {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
        notification.unread = false;
    }
    renderNotifications();
}

// Mark all notifications as read
function markAllAsRead() {
    notifications.forEach(notification => {
        notification.unread = false;
    });
    renderNotifications();
    showTemporaryNotification('All notifications marked as read');
}

// Clear all notifications
function clearAll() {
    notifications.length = 0;
    renderNotifications();
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

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    renderNotifications();
    
    // Mark as read when clicked
    notificationList.addEventListener('click', (e) => {
        const notificationItem = e.target.closest('.notification-item');
        if (notificationItem) {
            const notificationId = parseInt(notificationItem.dataset.id);
            markAsRead(notificationId);
        }
    });
    
    // Mark all as read
    markAllReadBtn.addEventListener('click', markAllAsRead);
    
    // Clear all notifications
    clearAllBtn.addEventListener('click', clearAll);
    
    // Search functionality
    searchInput.addEventListener('input', searchNotifications);
});