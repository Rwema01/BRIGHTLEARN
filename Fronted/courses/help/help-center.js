// Sample help articles data
const helpArticles = {
    "How to navigate the platform": {
        content: `
            <h3>Getting Around BRIGHTLEARN</h3>
            <p>Welcome to BRIGHTLEARN! Here's how to navigate our platform:</p>
            <ol>
                <li><strong>Dashboard:</strong> Your central hub showing progress and recent activity</li>
                <li><strong>Courses:</strong> Access all your enrolled courses and discover new ones</li>
                <li><strong>Notifications:</strong> Stay updated with important announcements</li>
                <li><strong>Profile:</strong> Manage your account settings and personal information</li>
            </ol>
            <p>Use the left navigation menu to switch between sections. The search bar at the top helps you quickly find specific content.</p>
        `
    },
    "Setting up your profile": {
        content: `
            <h3>Perfecting Your Profile</h3>
            <p>To set up your profile:</p>
            <ol>
                <li>Click on your profile picture in the top right corner</li>
                <li>Select "Profile Settings" from the dropdown</li>
                <li>Upload a profile picture by clicking the camera icon</li>
                <li>Fill in your personal information (name, bio, etc.)</li>
                <li>Set your preferences for notifications and display</li>
                <li>Click "Save Changes" to update your profile</li>
            </ol>
            <p>A complete profile helps personalize your learning experience and connect with instructors.</p>
        `
    },
    "Enrolling in courses": {
        content: `
            <h3>Joining New Courses</h3>
            <p>To enroll in courses:</p>
            <ol>
                <li>Navigate to the "Courses" section</li>
                <li>Browse available courses or use the search function</li>
                <li>Click on a course to view details</li>
                <li>Press the "Enroll" button</li>
                <li>Some courses may require payment or access codes</li>
                <li>Once enrolled, the course will appear in your dashboard</li>
            </ol>
            <p>You can enroll in multiple courses simultaneously and manage them from your dashboard.</p>
        `
    },
    // Other articles would follow the same pattern
};

// DOM elements
const modal = document.getElementById('articleModal');
const modalTitle = document.getElementById('modalTitle');
const modalContent = document.getElementById('modalContent');
const closeModal = document.querySelector('.close-modal');
const readMoreButtons = document.querySelectorAll('.read-more');
const contactBtn = document.querySelector('.contact-btn');
const helpSearch = document.getElementById('helpSearch');

// Initialize help center
document.addEventListener('DOMContentLoaded', function() {
    // Set up article modal functionality
    readMoreButtons.forEach(button => {
        button.addEventListener('click', function() {
            const articleTitle = this.closest('.help-article').querySelector('h3').textContent;
            openArticleModal(articleTitle);
        });
    });

    // Close modal when clicking X
    closeModal.addEventListener('click', closeArticleModal);

    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeArticleModal();
        }
    });

    // Contact support button
    contactBtn.addEventListener('click', function() {
        alert('Our support team will contact you shortly. Please check your email.');
    });

    // Search functionality
    helpSearch.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const articles = document.querySelectorAll('.help-article');
        
        articles.forEach(article => {
            const title = article.querySelector('h3').textContent.toLowerCase();
            const description = article.querySelector('p').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                article.style.display = 'block';
            } else {
                article.style.display = 'none';
            }
        });
    });
});

// Open article modal
function openArticleModal(title) {
    if (helpArticles[title]) {
        modalTitle.textContent = title;
        modalContent.innerHTML = helpArticles[title].content;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
}

// Close article modal
function closeArticleModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Re-enable scrolling
}

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
        closeArticleModal();
    }
});